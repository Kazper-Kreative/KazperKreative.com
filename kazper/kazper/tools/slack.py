"""Slack, read-only, via a *user* token (xoxp-…) so Kazper sees what you see.

Unlike Discord, Slack lets you grant an app access to your own DMs and
search — with your explicit OAuth consent — without breaking its rules.
"""

import time as _time
from datetime import datetime, timezone

import httpx

from . import Tool, Toolbox, schema

MAX_DM_CONVERSATIONS = 40  # keeps recent_dms under Slack's per-minute rate limits


class Slack:
    def __init__(self, user_token: str):
        self.http = httpx.Client(
            base_url="https://slack.com/api", headers={"Authorization": f"Bearer {user_token}"}, timeout=20
        )
        self._names: dict[str, str] = {}

    def _call(self, method: str, **params) -> dict:
        body = self.http.get(f"/{method}", params=params).json()
        if not body.get("ok"):
            raise RuntimeError(f"Slack {method}: {body.get('error')}")
        return body

    def _name(self, user_id: str | None) -> str:
        if not user_id:
            return "unknown"
        if user_id not in self._names:
            try:
                u = self._call("users.info", user=user_id)["user"]
                self._names[user_id] = u.get("real_name") or u.get("name") or user_id
            except RuntimeError:
                self._names[user_id] = user_id
        return self._names[user_id]

    def search(self, query: str, count: int = 20) -> list[dict]:
        matches = self._call("search.messages", query=query, count=min(count, 50), sort="timestamp")
        return [
            {
                "channel": m.get("channel", {}).get("name"),
                "from": m.get("username") or self._name(m.get("user")),
                "time": _ts(m.get("ts")),
                "text": (m.get("text") or "")[:800],
                "link": m.get("permalink"),
            }
            for m in matches.get("messages", {}).get("matches", [])
        ]

    def recent_dms(self, hours: float = 24) -> list[dict]:
        me = self._call("auth.test")["user_id"]
        oldest = str(_time.time() - hours * 3600)
        convs = self._call("conversations.list", types="im,mpim", exclude_archived="true", limit=200)["channels"]
        out = []
        for conv in convs[:MAX_DM_CONVERSATIONS]:
            try:
                history = self._call("conversations.history", channel=conv["id"], oldest=oldest, limit=15)
            except RuntimeError:
                continue
            msgs = history.get("messages", [])
            if not msgs:
                continue
            out.append({
                "with": self._name(conv.get("user")) if conv.get("is_im") else conv.get("name"),
                "messages": [
                    {
                        "from": "me" if m.get("user") == me else self._name(m.get("user")),
                        "time": _ts(m.get("ts")),
                        "text": (m.get("text") or "")[:500],
                    }
                    for m in reversed(msgs)
                ],
            })
        return out


def _ts(ts: str | None) -> str | None:
    return datetime.fromtimestamp(float(ts), timezone.utc).isoformat() if ts else None


def register(box: Toolbox, slack: Slack) -> None:
    box.add(Tool(
        "slack_recent_dms",
        "Show my Slack direct messages (1:1 and group DMs) from the last N hours.",
        schema({"hours": {"type": "number", "description": "Look-back window in hours (default 24)."}}),
        slack.recent_dms,
    ))
    box.add(Tool(
        "slack_search",
        "Search Slack messages I can see. Supports Slack search syntax: 'in:#channel', 'from:@name', "
        "'after:YYYY-MM-DD', 'has:link', plus plain keywords.",
        schema({
            "query": {"type": "string"},
            "count": {"type": "integer", "description": "Max results (default 20)."},
        }, ["query"]),
        slack.search,
    ))
    box.senses.append("Slack DMs + search (read-only)")
