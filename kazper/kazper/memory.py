"""Kazper's memory: conversations, facts about you, feedback, and noticed events.

Two interchangeable backends:
- SupabaseMemory (production) — the kazper_* tables from supabase/kazper.sql,
  reached over PostgREST with the service-role key.
- SqliteMemory (local fallback) — data/kazper.db, used when SUPABASE_URL /
  SUPABASE_SERVICE_ROLE_KEY are unset.

Every exchange keeps its full prompt + tool calls in `messages`, and every
rating/correction lands in feedback — that is the fine-tuning dataset.
"""

import json
import sqlite3
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

from .config import Config


def _now() -> datetime:
    return datetime.now(timezone.utc)


def open_memory(cfg: Config):
    if cfg.supabase_url and cfg.supabase_service_key:
        return SupabaseMemory(cfg.supabase_url, cfg.supabase_service_key)
    return SqliteMemory(cfg.data_dir)


class SupabaseMemory:
    backend = "supabase"

    def __init__(self, url: str, service_key: str):
        # New-style secret keys (sb_secret_…) go in `apikey` only — they aren't JWTs, so they
        # mustn't be sent as a Bearer token. Legacy service_role keys (eyJ…) are JWTs and need both.
        headers = {"apikey": service_key}
        if service_key.startswith("eyJ"):
            headers["Authorization"] = f"Bearer {service_key}"
        self.http = httpx.Client(base_url=f"{url}/rest/v1", headers=headers, timeout=15)

    def _get(self, table: str, **params) -> list[dict]:
        r = self.http.get(f"/{table}", params=params)
        r.raise_for_status()
        return r.json()

    def _insert(self, table: str, row: dict) -> dict:
        r = self.http.post(f"/{table}", json=row, headers={"Prefer": "return=representation"})
        r.raise_for_status()
        return r.json()[0]

    # --- conversation -------------------------------------------------

    def recent_exchanges(self, limit: int) -> list[dict]:
        rows = self._get("kazper_exchanges", select="id,user_text,reply_text", order="id.desc", limit=limit)
        return list(reversed(rows))

    def save_exchange(self, user_text: str, reply_text: str, messages: list[dict]) -> int:
        row = self._insert(
            "kazper_exchanges",
            {"user_text": user_text, "reply_text": reply_text, "messages": messages},
        )
        return row["id"]

    def link_reply_message(self, discord_message_id: int, exchange_id: int) -> None:
        self.http.post(
            "/kazper_reply_messages",
            json={"discord_message_id": str(discord_message_id), "exchange_id": exchange_id},
            headers={"Prefer": "resolution=merge-duplicates"},
        ).raise_for_status()

    def exchange_for_message(self, discord_message_id: int) -> dict | None:
        links = self._get(
            "kazper_reply_messages", select="exchange_id", discord_message_id=f"eq.{discord_message_id}"
        )
        if not links:
            return None
        rows = self._get("kazper_exchanges", select="id,user_text,reply_text", id=f"eq.{links[0]['exchange_id']}")
        return rows[0] if rows else None

    # --- facts ----------------------------------------------------------

    def add_fact(self, text: str) -> int:
        return self._insert("kazper_facts", {"text": text})["id"]

    def list_facts(self) -> list[dict]:
        return self._get("kazper_facts", select="id,text", order="id")

    def forget_fact(self, fact_id: int) -> bool:
        r = self.http.delete("/kazper_facts", params={"id": f"eq.{fact_id}"}, headers={"Prefer": "return=representation"})
        r.raise_for_status()
        return bool(r.json())

    # --- feedback -------------------------------------------------------

    def add_feedback(self, exchange: dict, kind: str, correction: str | None = None) -> None:
        self._insert("kazper_feedback", {"exchange_id": exchange["id"], "kind": kind, "correction": correction})

    # --- events (senses) ------------------------------------------------

    def add_event(self, source: str, summary: str, data: dict) -> None:
        self._insert("kazper_events", {"source": source, "summary": summary, "data": data})

    def recent_events(self, source: str, hours: float) -> list[dict]:
        since = (_now() - timedelta(hours=hours)).isoformat()
        return self._get(
            "kazper_events", select="created_at,summary,data",
            source=f"eq.{source}", created_at=f"gte.{since}", order="created_at.desc", limit=100,
        )


SQLITE_SCHEMA = """
CREATE TABLE IF NOT EXISTS exchanges (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL,
    user_text TEXT NOT NULL, reply_text TEXT NOT NULL, messages TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS reply_messages (
    discord_message_id INTEGER PRIMARY KEY, exchange_id INTEGER NOT NULL REFERENCES exchanges(id)
);
CREATE TABLE IF NOT EXISTS facts (id INTEGER PRIMARY KEY, ts TEXT NOT NULL, text TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, exchange_id INTEGER NOT NULL REFERENCES exchanges(id),
    kind TEXT NOT NULL, correction TEXT
);
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, source TEXT NOT NULL, summary TEXT NOT NULL, data TEXT NOT NULL
);
"""


class SqliteMemory:
    backend = "sqlite"

    def __init__(self, data_dir: Path):
        # Memory calls run in worker threads (asyncio.to_thread), so share one
        # connection across threads and serialise access with a lock.
        self.db = sqlite3.connect(data_dir / "kazper.db", check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SQLITE_SCHEMA)
        self.lock = threading.Lock()

    def _exec(self, sql: str, params: tuple = ()) -> sqlite3.Cursor:
        with self.lock:
            cur = self.db.execute(sql, params)
            self.db.commit()
            return cur

    def _rows(self, sql: str, params: tuple = ()) -> list[sqlite3.Row]:
        with self.lock:
            return self.db.execute(sql, params).fetchall()

    def recent_exchanges(self, limit: int) -> list[dict]:
        rows = self._rows("SELECT id, user_text, reply_text FROM exchanges ORDER BY id DESC LIMIT ?", (limit,))
        return [dict(r) for r in reversed(rows)]

    def save_exchange(self, user_text: str, reply_text: str, messages: list[dict]) -> int:
        return self._exec(
            "INSERT INTO exchanges (ts, user_text, reply_text, messages) VALUES (?, ?, ?, ?)",
            (_now().isoformat(), user_text, reply_text, json.dumps(messages, ensure_ascii=False)),
        ).lastrowid

    def link_reply_message(self, discord_message_id: int, exchange_id: int) -> None:
        self._exec("INSERT OR REPLACE INTO reply_messages VALUES (?, ?)", (discord_message_id, exchange_id))

    def exchange_for_message(self, discord_message_id: int) -> dict | None:
        rows = self._rows(
            "SELECT e.id, e.user_text, e.reply_text FROM exchanges e "
            "JOIN reply_messages r ON r.exchange_id = e.id WHERE r.discord_message_id = ?",
            (discord_message_id,),
        )
        return dict(rows[0]) if rows else None

    def add_fact(self, text: str) -> int:
        return self._exec("INSERT INTO facts (ts, text) VALUES (?, ?)", (_now().isoformat(), text)).lastrowid

    def list_facts(self) -> list[dict]:
        return [dict(r) for r in self._rows("SELECT id, text FROM facts ORDER BY id")]

    def forget_fact(self, fact_id: int) -> bool:
        return self._exec("DELETE FROM facts WHERE id = ?", (fact_id,)).rowcount > 0

    def add_feedback(self, exchange: dict, kind: str, correction: str | None = None) -> None:
        self._exec(
            "INSERT INTO feedback (ts, exchange_id, kind, correction) VALUES (?, ?, ?, ?)",
            (_now().isoformat(), exchange["id"], kind, correction),
        )

    def add_event(self, source: str, summary: str, data: dict) -> None:
        self._exec(
            "INSERT INTO events (ts, source, summary, data) VALUES (?, ?, ?, ?)",
            (_now().isoformat(), source, summary, json.dumps(data, ensure_ascii=False)),
        )

    def recent_events(self, source: str, hours: float) -> list[dict]:
        since = (_now() - timedelta(hours=hours)).isoformat()
        rows = self._rows(
            "SELECT ts AS created_at, summary, data FROM events WHERE source = ? AND ts >= ? "
            "ORDER BY ts DESC LIMIT 100",
            (source, since),
        )
        return [{**dict(r), "data": json.loads(r["data"])} for r in rows]
