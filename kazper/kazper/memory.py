"""Kazper's memory: conversations, facts about you, pointers, feedback, and noticed events.

Two interchangeable backends:
- SupabaseMemory (production) — the kazper_* tables from supabase/kazper.sql,
  reached over PostgREST with the service-role key.
- SqliteMemory (local fallback) — data/kazper.db, used when SUPABASE_URL /
  SUPABASE_SERVICE_ROLE_KEY are unset.

Every exchange keeps its full prompt + tool calls in `messages` and what it
cost; every rating/correction lands in feedback — that is the fine-tuning
dataset. Only a short window of chat is replayed each turn; Kazper reaches
further back with search_exchanges / get_exchanges and its own pointers.
"""

import json
import sqlite3
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

from .config import Config

USAGE_FIELDS = ("llm_calls", "prompt_tokens", "cached_tokens", "completion_tokens", "reasoning_tokens",
                "cost_usd", "providers")
SUMMARY_FIELDS = "id,created_at,kind,user_text,reply_text"
ACTION_FIELDS = "id,created_at,kind,status,summary,destination,payload,exchange_id,decided_at"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _since(days: float) -> str:
    return (_now() - timedelta(days=days)).isoformat()


def open_memory(cfg: Config):
    if cfg.supabase_url and cfg.supabase_service_key:
        return SupabaseMemory(cfg.supabase_url, cfg.supabase_service_key)
    return SqliteMemory(cfg.data_dir)


def _stats(counts: dict, costs: list[tuple[str, float | None]]) -> dict:
    """Shared tail of stats(): cost totals from (created_at, cost_usd) rows of the last 30 days."""
    week = _since(7)
    cost_30 = sum(c or 0 for _, c in costs)
    cost_7 = sum(c or 0 for ts, c in costs if ts >= week)
    priced = [c for _, c in costs if c is not None]
    return {
        **counts,
        "cost_7d_usd": round(cost_7, 4),
        "cost_30d_usd": round(cost_30, 4),
        "avg_cost_per_reply_usd": round(sum(priced) / len(priced), 5) if priced else None,
        "replies_30d": len(costs),
    }


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

    def _count(self, table: str, **filters) -> int:
        r = self.http.head(f"/{table}", params=filters, headers={"Prefer": "count=exact"})
        r.raise_for_status()
        return int(r.headers.get("content-range", "*/0").split("/")[-1])

    # --- conversation -------------------------------------------------

    def recent_exchanges(self, limit: int, kind: str = "chat") -> list[dict]:
        rows = self._get("kazper_exchanges", select=SUMMARY_FIELDS, kind=f"eq.{kind}", order="id.desc", limit=limit)
        return list(reversed(rows))

    def save_exchange(self, user_text: str, reply_text: str, messages: list[dict], kind: str = "chat",
                      usage: dict | None = None, channel: str = "discord") -> int:
        row = {"user_text": user_text, "reply_text": reply_text, "messages": messages, "kind": kind,
               "channel": channel}
        row.update({k: v for k, v in (usage or {}).items() if k in USAGE_FIELDS})
        return self._insert("kazper_exchanges", row)["id"]

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
        rows = self._get("kazper_exchanges", select=SUMMARY_FIELDS, id=f"eq.{links[0]['exchange_id']}")
        return rows[0] if rows else None

    def search_exchanges(self, query: str | None = None, days: float | None = None, limit: int = 8,
                         before_id: int | None = None) -> list[dict]:
        params = {"select": SUMMARY_FIELDS, "order": "id.desc", "limit": limit}
        if query:
            params["search"] = f"wfts(english).{query}"
        if days:
            params["created_at"] = f"gte.{_since(days)}"
        if before_id:
            params["id"] = f"lt.{before_id}"
        return self._get("kazper_exchanges", **params)

    def get_exchanges(self, ids: list[int]) -> list[dict]:
        if not ids:
            return []
        return self._get("kazper_exchanges", select=SUMMARY_FIELDS, id=f"in.({','.join(str(int(i)) for i in ids)})",
                         order="id")

    # --- facts ----------------------------------------------------------

    def add_fact(self, text: str, source: str = "owner") -> int:
        return self._insert("kazper_facts", {"text": text, "source": source})["id"]

    def list_facts(self) -> list[dict]:
        return self._get("kazper_facts", select="id,text,source", order="id")

    def forget_fact(self, fact_id: int) -> bool:
        r = self.http.delete("/kazper_facts", params={"id": f"eq.{fact_id}"}, headers={"Prefer": "return=representation"})
        r.raise_for_status()
        return bool(r.json())

    # --- pointers (Kazper's working notes) ------------------------------

    def add_pointer(self, text: str) -> int:
        return self._insert("kazper_pointers", {"text": text})["id"]

    def link_pointers(self, pointer_ids: list[int], exchange_id: int) -> None:
        if pointer_ids:
            self.http.patch(
                "/kazper_pointers", params={"id": f"in.({','.join(str(i) for i in pointer_ids)})"},
                json={"exchange_id": exchange_id},
            ).raise_for_status()

    def recent_pointers(self, limit: int) -> list[dict]:
        rows = self._get("kazper_pointers", select="id,created_at,text,exchange_id", order="id.desc", limit=limit)
        return list(reversed(rows))

    def forget_pointer(self, pointer_id: int) -> bool:
        r = self.http.delete("/kazper_pointers", params={"id": f"eq.{pointer_id}"},
                             headers={"Prefer": "return=representation"})
        r.raise_for_status()
        return bool(r.json())

    # --- actions (things Kazper did or proposes, with what they replaced) ----

    def add_action(self, kind: str, summary: str, destination: str, payload: dict, status: str = "done") -> int:
        return self._insert("kazper_actions", {"kind": kind, "summary": summary, "destination": destination,
                                               "payload": payload, "status": status})["id"]

    def get_action(self, action_id: int) -> dict | None:
        rows = self._get("kazper_actions", select=ACTION_FIELDS, id=f"eq.{action_id}")
        return rows[0] if rows else None

    def latest_action(self, kind: str) -> dict | None:
        rows = self._get("kazper_actions", select=ACTION_FIELDS, kind=f"eq.{kind}", order="id.desc", limit=1)
        return rows[0] if rows else None

    def update_action(self, action_id: int, **fields) -> None:
        self.http.patch("/kazper_actions", params={"id": f"eq.{action_id}"}, json=fields).raise_for_status()

    def link_actions(self, action_ids: list[int], exchange_id: int) -> None:
        if action_ids:
            self.http.patch(
                "/kazper_actions", params={"id": f"in.({','.join(str(i) for i in action_ids)})"},
                json={"exchange_id": exchange_id},
            ).raise_for_status()

    # --- live activity (the app's Presence tab; see presence.py) ---------

    def add_activity(self, kind: str, text: str) -> None:
        self.http.post("/kazper_activity", json={"kind": kind, "text": text},
                       headers={"Prefer": "return=minimal"}).raise_for_status()

    def prune_activity(self, before_iso: str) -> None:
        self.http.delete("/kazper_activity", params={"created_at": f"lt.{before_iso}"}).raise_for_status()

    # --- feedback -------------------------------------------------------

    def add_feedback(self, exchange: dict, kind: str, correction: str | None = None) -> None:
        self._insert("kazper_feedback", {"exchange_id": exchange["id"], "kind": kind, "correction": correction})

    def feedback_since(self, days: float | None = None, with_messages: bool = False) -> list[dict]:
        fields = SUMMARY_FIELDS + (",messages" if with_messages else "")
        params = {"select": f"created_at,kind,correction,exchange:kazper_exchanges({fields})", "order": "id"}
        if days:
            params["created_at"] = f"gte.{_since(days)}"
        return self._get("kazper_feedback", **params)

    def stats(self) -> dict:
        counts = {
            "exchanges": self._count("kazper_exchanges"),
            "rated_good": self._count("kazper_feedback", kind="eq.good"),
            "rated_bad": self._count("kazper_feedback", kind="eq.bad"),
            "corrections": self._count("kazper_feedback", kind="eq.correction"),
            "redirects": self._count("kazper_feedback", kind="eq.redirect"),
            "facts": self._count("kazper_facts", source="eq.owner"),
            "kazper_notes": self._count("kazper_facts", source="eq.kazper"),
            "pointers": self._count("kazper_pointers"),
        }
        rows = self._get("kazper_exchanges", select="created_at,cost_usd", created_at=f"gte.{_since(30)}")
        return _stats(counts, [(r["created_at"], float(r["cost_usd"]) if r["cost_usd"] is not None else None)
                               for r in rows])

    # --- events (senses) ------------------------------------------------

    def add_event(self, source: str, summary: str, data: dict) -> None:
        self._insert("kazper_events", {"source": source, "summary": summary, "data": data})

    def recent_events(self, source: str, hours: float) -> list[dict]:
        return self._get(
            "kazper_events", select="created_at,summary,data",
            source=f"eq.{source}", created_at=f"gte.{_since(hours / 24)}", order="created_at.desc", limit=100,
        )


SQLITE_SCHEMA = """
CREATE TABLE IF NOT EXISTS exchanges (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL,
    user_text TEXT NOT NULL, reply_text TEXT NOT NULL, messages TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS reply_messages (
    discord_message_id INTEGER PRIMARY KEY, exchange_id INTEGER NOT NULL REFERENCES exchanges(id)
);
CREATE TABLE IF NOT EXISTS facts (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, text TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'owner'
);
CREATE TABLE IF NOT EXISTS pointers (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, text TEXT NOT NULL, exchange_id INTEGER REFERENCES exchanges(id)
);
CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, kind TEXT NOT NULL, status TEXT NOT NULL, summary TEXT NOT NULL,
    destination TEXT, payload TEXT NOT NULL DEFAULT '{}', exchange_id INTEGER REFERENCES exchanges(id),
    decided_at TEXT
);
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, exchange_id INTEGER NOT NULL REFERENCES exchanges(id),
    kind TEXT NOT NULL, correction TEXT
);
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY, ts TEXT NOT NULL, source TEXT NOT NULL, summary TEXT NOT NULL, data TEXT NOT NULL
);
"""

# Columns added after the first release; created on old databases at startup.
SQLITE_ADDED_COLUMNS = {
    "facts": {"source": "TEXT NOT NULL DEFAULT 'owner'"},
    "exchanges": {
        "kind": "TEXT NOT NULL DEFAULT 'chat'", "channel": "TEXT NOT NULL DEFAULT 'discord'", "llm_calls": "INTEGER", "prompt_tokens": "INTEGER",
        "cached_tokens": "INTEGER", "completion_tokens": "INTEGER", "reasoning_tokens": "INTEGER",
        "cost_usd": "REAL", "providers": "TEXT",
    },
}
SQLITE_SUMMARY = "SELECT id, ts AS created_at, kind, user_text, reply_text FROM exchanges"


class SqliteMemory:
    backend = "sqlite"

    def __init__(self, data_dir: Path):
        # Memory calls run in worker threads (asyncio.to_thread), so share one
        # connection across threads and serialise access with a lock.
        self.db = sqlite3.connect(data_dir / "kazper.db", check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SQLITE_SCHEMA)
        for table, columns in SQLITE_ADDED_COLUMNS.items():
            have = {r["name"] for r in self.db.execute(f"PRAGMA table_info({table})")}
            for name, decl in columns.items():
                if name not in have:
                    self.db.execute(f"ALTER TABLE {table} ADD COLUMN {name} {decl}")
        self.db.commit()
        self.lock = threading.Lock()

    def _exec(self, sql: str, params: tuple = ()) -> sqlite3.Cursor:
        with self.lock:
            cur = self.db.execute(sql, params)
            self.db.commit()
            return cur

    def _rows(self, sql: str, params: tuple = ()) -> list[dict]:
        with self.lock:
            return [dict(r) for r in self.db.execute(sql, params).fetchall()]

    def recent_exchanges(self, limit: int, kind: str = "chat") -> list[dict]:
        rows = self._rows(f"{SQLITE_SUMMARY} WHERE kind = ? ORDER BY id DESC LIMIT ?", (kind, limit))
        return list(reversed(rows))

    def save_exchange(self, user_text: str, reply_text: str, messages: list[dict], kind: str = "chat",
                      usage: dict | None = None, channel: str = "discord") -> int:
        usage = {k: v for k, v in (usage or {}).items() if k in USAGE_FIELDS}
        cols = ["ts", "user_text", "reply_text", "messages", "kind", "channel", *usage]
        vals = [_now().isoformat(), user_text, reply_text, json.dumps(messages, ensure_ascii=False), kind, channel,
                *usage.values()]
        return self._exec(
            f"INSERT INTO exchanges ({', '.join(cols)}) VALUES ({', '.join('?' * len(cols))})", tuple(vals)
        ).lastrowid

    def link_reply_message(self, discord_message_id: int, exchange_id: int) -> None:
        self._exec("INSERT OR REPLACE INTO reply_messages VALUES (?, ?)", (discord_message_id, exchange_id))

    def exchange_for_message(self, discord_message_id: int) -> dict | None:
        rows = self._rows(
            "SELECT e.id, e.ts AS created_at, e.kind, e.user_text, e.reply_text FROM exchanges e "
            "JOIN reply_messages r ON r.exchange_id = e.id WHERE r.discord_message_id = ?",
            (discord_message_id,),
        )
        return rows[0] if rows else None

    def search_exchanges(self, query: str | None = None, days: float | None = None, limit: int = 8,
                         before_id: int | None = None) -> list[dict]:
        # No full-text index locally: every word must appear somewhere in the exchange.
        where, params = [], []
        for word in (query or "").split():
            where.append("(user_text || ' ' || reply_text) LIKE ?")
            params.append(f"%{word.strip(chr(34))}%")
        if days:
            where.append("ts >= ?")
            params.append(_since(days))
        if before_id:
            where.append("id < ?")
            params.append(before_id)
        clause = f" WHERE {' AND '.join(where)}" if where else ""
        return self._rows(f"{SQLITE_SUMMARY}{clause} ORDER BY id DESC LIMIT ?", (*params, limit))

    def get_exchanges(self, ids: list[int]) -> list[dict]:
        if not ids:
            return []
        marks = ",".join("?" * len(ids))
        return self._rows(f"{SQLITE_SUMMARY} WHERE id IN ({marks}) ORDER BY id", tuple(int(i) for i in ids))

    def add_fact(self, text: str, source: str = "owner") -> int:
        return self._exec(
            "INSERT INTO facts (ts, text, source) VALUES (?, ?, ?)", (_now().isoformat(), text, source)
        ).lastrowid

    def list_facts(self) -> list[dict]:
        return self._rows("SELECT id, text, source FROM facts ORDER BY id")

    def forget_fact(self, fact_id: int) -> bool:
        return self._exec("DELETE FROM facts WHERE id = ?", (fact_id,)).rowcount > 0

    def add_pointer(self, text: str) -> int:
        return self._exec("INSERT INTO pointers (ts, text) VALUES (?, ?)", (_now().isoformat(), text)).lastrowid

    def link_pointers(self, pointer_ids: list[int], exchange_id: int) -> None:
        for pid in pointer_ids:
            self._exec("UPDATE pointers SET exchange_id = ? WHERE id = ?", (exchange_id, pid))

    def recent_pointers(self, limit: int) -> list[dict]:
        rows = self._rows(
            "SELECT id, ts AS created_at, text, exchange_id FROM pointers ORDER BY id DESC LIMIT ?", (limit,)
        )
        return list(reversed(rows))

    def forget_pointer(self, pointer_id: int) -> bool:
        return self._exec("DELETE FROM pointers WHERE id = ?", (pointer_id,)).rowcount > 0

    def add_action(self, kind: str, summary: str, destination: str, payload: dict, status: str = "done") -> int:
        return self._exec(
            "INSERT INTO actions (ts, kind, status, summary, destination, payload) VALUES (?, ?, ?, ?, ?, ?)",
            (_now().isoformat(), kind, status, summary, destination, json.dumps(payload, ensure_ascii=False)),
        ).lastrowid

    def get_action(self, action_id: int) -> dict | None:
        rows = self._rows("SELECT id, ts AS created_at, kind, status, summary, destination, payload, exchange_id, "
                          "decided_at FROM actions WHERE id = ?", (action_id,))
        return {**rows[0], "payload": json.loads(rows[0]["payload"])} if rows else None

    def latest_action(self, kind: str) -> dict | None:
        rows = self._rows("SELECT id FROM actions WHERE kind = ? ORDER BY id DESC LIMIT 1", (kind,))
        return self.get_action(rows[0]["id"]) if rows else None

    def update_action(self, action_id: int, **fields) -> None:
        if "payload" in fields:
            fields["payload"] = json.dumps(fields["payload"], ensure_ascii=False)
        sets = ", ".join(f"{k} = ?" for k in fields)
        self._exec(f"UPDATE actions SET {sets} WHERE id = ?", (*fields.values(), action_id))

    def link_actions(self, action_ids: list[int], exchange_id: int) -> None:
        for aid in action_ids:
            self._exec("UPDATE actions SET exchange_id = ? WHERE id = ?", (exchange_id, aid))

    def add_feedback(self, exchange: dict, kind: str, correction: str | None = None) -> None:
        self._exec(
            "INSERT INTO feedback (ts, exchange_id, kind, correction) VALUES (?, ?, ?, ?)",
            (_now().isoformat(), exchange["id"], kind, correction),
        )

    def feedback_since(self, days: float | None = None, with_messages: bool = False) -> list[dict]:
        rows = self._rows(
            "SELECT f.ts AS created_at, f.kind, f.correction, e.id, e.ts AS ex_created_at, e.kind AS ex_kind, "
            "e.user_text, e.reply_text, e.messages FROM feedback f JOIN exchanges e ON e.id = f.exchange_id "
            "WHERE f.ts >= ? ORDER BY f.id",
            (_since(days) if days else "",),
        )
        out = []
        for r in rows:
            exchange = {"id": r["id"], "created_at": r["ex_created_at"], "kind": r["ex_kind"],
                        "user_text": r["user_text"], "reply_text": r["reply_text"]}
            if with_messages:
                exchange["messages"] = json.loads(r["messages"])
            out.append({"created_at": r["created_at"], "kind": r["kind"], "correction": r["correction"],
                        "exchange": exchange})
        return out

    def stats(self) -> dict:
        def count(sql: str, *params) -> int:
            return self._rows(sql, params)[0]["n"]

        counts = {
            "exchanges": count("SELECT COUNT(*) n FROM exchanges"),
            **{k: count("SELECT COUNT(*) n FROM feedback WHERE kind = ?", kind) for k, kind in (
                ("rated_good", "good"), ("rated_bad", "bad"), ("corrections", "correction"),
                ("redirects", "redirect"))},
            "facts": count("SELECT COUNT(*) n FROM facts WHERE source = 'owner'"),
            "kazper_notes": count("SELECT COUNT(*) n FROM facts WHERE source = 'kazper'"),
            "pointers": count("SELECT COUNT(*) n FROM pointers"),
        }
        rows = self._rows("SELECT ts, cost_usd FROM exchanges WHERE ts >= ?", (_since(30),))
        return _stats(counts, [(r["ts"], r["cost_usd"]) for r in rows])

    def add_event(self, source: str, summary: str, data: dict) -> None:
        self._exec(
            "INSERT INTO events (ts, source, summary, data) VALUES (?, ?, ?, ?)",
            (_now().isoformat(), source, summary, json.dumps(data, ensure_ascii=False)),
        )

    def recent_events(self, source: str, hours: float) -> list[dict]:
        rows = self._rows(
            "SELECT ts AS created_at, summary, data FROM events WHERE source = ? AND ts >= ? "
            "ORDER BY ts DESC LIMIT 100",
            (source, _since(hours / 24)),
        )
        return [{**r, "data": json.loads(r["data"])} for r in rows]
