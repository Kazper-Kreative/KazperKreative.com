"""Kazper's own calendar (first named "Kazper · Deadlines"), one view of every deadline.

Kazper creates this calendar in your Google account and manages it himself:
adding, moving and removing deadlines, and renaming or re-describing the
calendar itself, without asking (you chose that). It's tracked by its Google
id (logged as a calendar.create action), so a rename never loses it. Google's
calendar.app.created permission means he can only ever write to calendars he
created, so your own calendars are out of reach no matter what. Every change
is logged in kazper_actions with what it replaced, reported to you (Discord +
app), and one tap undoes it.
"""

import threading
from contextvars import ContextVar
from datetime import date, datetime, timedelta
from urllib.parse import quote
from zoneinfo import ZoneInfo

import httpx

from . import Tool, Toolbox, schema
from .google import CALENDAR_API, Google

CALENDAR_NAME = "Kazper · Deadlines"  # the name it gets at creation; Kazper may rename it
# Google event colour ids: one per area of your life, so the calendar reads at a glance.
AREAS = {
    "SensorOps": "9",        # blueberry
    "Nexxverse": "3",        # grape
    "SoB": "11",             # tomato
    "Kazper Kreative": "6",  # tangerine
    "Personal": "2",         # sage
    "Other": "8",            # graphite
}
SNAPSHOT_FIELDS = ("summary", "description", "start", "end", "colorId", "extendedProperties")
MAX_PER_TURN = 10

# Changes made during the current turn; bot.py reports them to you once the reply is out.
done: ContextVar[list[dict] | None] = ContextVar("kazper_deadline_actions", default=None)
_lock = threading.Lock()


def _when(due: str) -> tuple[dict, dict]:
    """'2026-11-07' → an all-day event; '2026-11-07T15:00' (+ optional offset) → a 30-minute slot."""
    due = due.strip()
    try:
        day = date.fromisoformat(due)
        return {"date": day.isoformat()}, {"date": (day + timedelta(days=1)).isoformat()}
    except ValueError:
        pass
    try:
        start = datetime.fromisoformat(due)
    except ValueError:
        raise ValueError("due must be YYYY-MM-DD or YYYY-MM-DDTHH:MM")
    return {"dateTime": start.isoformat()}, {"dateTime": (start + timedelta(minutes=30)).isoformat()}


def _show(event: dict) -> dict:
    start = event.get("start", {})
    private = event.get("extendedProperties", {}).get("private", {})
    return {
        "event_id": event.get("id"),
        "title": event.get("summary"),
        "due": start.get("date") or start.get("dateTime"),
        "area": private.get("area"),
        "notes": event.get("description") or None,
    }


class Deadlines:
    def __init__(self, google: Google, memory, timezone: str):
        self.google = google
        self.memory = memory
        self.timezone = timezone
        self._calendar_id: str | None = None
        self.name = CALENDAR_NAME

    # --- plumbing -------------------------------------------------------

    def calendar_id(self) -> str:
        """His calendar's Google id: remembered from when he created it, so renaming can't lose it."""
        if self._calendar_id:
            return self._calendar_id
        known = self.memory.latest_action("calendar.create")
        cals = {c["id"]: c for c in self.google.calendars()}
        if known and known["payload"].get("calendar_id") in cals:
            cal = cals[known["payload"]["calendar_id"]]
        else:
            # Not on record (first run, or it was deleted): adopt one by its original name, else create it.
            cal = next((c for c in cals.values()
                        if c.get("summary") == CALENDAR_NAME and c.get("accessRole") == "owner"), None)
            if cal is None:
                cal = self.google._request("POST", f"{CALENDAR_API}/calendars", json={
                    "summary": CALENDAR_NAME,
                    "description": "Every deadline across SensorOps, Nexxverse, SoB, Kazper Kreative and life, "
                                   "kept by Kazper.",
                    "timeZone": self.timezone,
                })
            self.memory.add_action("calendar.create", f"Set up his calendar '{cal['summary']}'",
                                   cal["summary"], {"calendar_id": cal["id"]})
        self._calendar_id, self.name = cal["id"], cal.get("summary") or CALENDAR_NAME
        return self._calendar_id

    def _events_url(self, event_id: str | None = None) -> str:
        url = f"{CALENDAR_API}/calendars/{quote(self.calendar_id(), safe='')}/events"
        return f"{url}/{quote(event_id, safe='')}" if event_id else url

    def _body(self, title: str, due: str, area: str, notes: str, source: str) -> dict:
        start, end = _when(due)
        if "dateTime" in start:
            start["timeZone"] = end["timeZone"] = self.timezone
        return {
            "summary": f"[{area}] {title}" if area != "Other" else title,
            "description": notes or "",
            "start": start,
            "end": end,
            "colorId": AREAS[area],
            "extendedProperties": {"private": {"kazper": "1", "area": area, "source": source[:200]}},
        }

    def _record(self, kind: str, summary: str, payload: dict) -> str:
        turn = done.get()
        action_id = self.memory.add_action(kind, summary, self.name, payload)
        if turn is not None:
            turn.append({"id": action_id, "kind": kind, "summary": summary})
        return f"done; logged as action #{action_id} (I'll be told and can undo it)"

    def _check_turn(self):
        turn = done.get()
        if turn is not None and len(turn) >= MAX_PER_TURN:
            raise RuntimeError(f"at most {MAX_PER_TURN} deadline changes per reply")

    @staticmethod
    def _area(area: str | None) -> str:
        match = next((a for a in AREAS if a.lower() == (area or "Other").strip().lower()), None)
        if match is None:
            raise ValueError(f"area must be one of: {', '.join(AREAS)}")
        return match

    # --- tools ----------------------------------------------------------

    def add(self, title: str, due: str, area: str = "Other", notes: str = "", source: str = "") -> str:
        area = self._area(area)
        title = " ".join(title.split())[:150]
        if not title:
            raise ValueError("title is required")
        with _lock:
            self._check_turn()
            event = self.google._request("POST", self._events_url(), json=self._body(title, due, area, notes, source))
            return self._record("deadline.add", f"Added [{area}] {title} · {due}",
                                {"event_id": event["id"], "after": _show(event)})

    def update(self, event_id: str, title: str | None = None, due: str | None = None, area: str | None = None,
               notes: str | None = None) -> str:
        with _lock:
            self._check_turn()
            before = self.google._request("GET", self._events_url(event_id))
            private = before.get("extendedProperties", {}).get("private", {})
            cur_area = private.get("area", "Other")
            cur_title = before.get("summary", "").removeprefix(f"[{cur_area}] ")
            cur_due = before.get("start", {}).get("date") or before.get("start", {}).get("dateTime", "")
            new_area = self._area(area) if area else cur_area
            new_title = " ".join(title.split())[:150] if title else cur_title
            body = self._body(new_title, due or cur_due, new_area,
                              notes if notes is not None else before.get("description", ""), private.get("source", ""))
            after = self.google._request("PATCH", self._events_url(event_id), json=body)
            return self._record("deadline.update", f"Updated [{new_area}] {new_title} · {due or cur_due}",
                                {"event_id": event_id, "before": {k: before.get(k) for k in SNAPSHOT_FIELDS},
                                 "after": _show(after)})

    def remove(self, event_id: str) -> str:
        with _lock:
            self._check_turn()
            before = self.google._request("GET", self._events_url(event_id))
            self.google._request("DELETE", self._events_url(event_id))
            return self._record("deadline.remove", f"Removed {before.get('summary')}",
                                {"event_id": event_id, "before": {k: before.get(k) for k in SNAPSHOT_FIELDS}})

    def settings(self, name: str | None = None, description: str | None = None) -> str:
        """Rename or re-describe his calendar."""
        changes = {}
        if name is not None:
            name = " ".join(name.split())[:100]
            if not name:
                raise ValueError("name can't be empty")
            changes["summary"] = name
        if description is not None:
            changes["description"] = description[:1000]
        if not changes:
            raise ValueError("give a new name and/or description")
        with _lock:
            self._check_turn()
            url = f"{CALENDAR_API}/calendars/{quote(self.calendar_id(), safe='')}"
            before = self.google._request("GET", url)
            after = self.google._request("PATCH", url, json=changes)
            self.name = after.get("summary") or self.name
            what = f"Renamed his calendar to '{self.name}'" if name else f"Updated the description of '{self.name}'"
            return self._record("calendar.update", what, {
                "calendar_id": self._calendar_id,
                "before": {k: before.get(k) for k in changes},
                "after": {k: after.get(k) for k in changes},
            })

    def list(self, days_ahead: int = 60, days_back: int = 7) -> list[dict]:
        today = datetime.now(ZoneInfo(self.timezone)).replace(hour=0, minute=0, second=0, microsecond=0)
        data = self.google._get(
            self._events_url(), timeMin=(today - timedelta(days=days_back)).isoformat(),
            timeMax=(today + timedelta(days=days_ahead)).isoformat(),
            singleEvents="true", orderBy="startTime", maxResults=100,
        )
        return [_show(e) for e in data.get("items", [])]

    # --- undo -----------------------------------------------------------

    def undo(self, action: dict) -> str:
        """Reverse one logged change. Returns a short description of what was restored."""
        payload, kind = action["payload"], action["kind"]
        event_id = payload.get("event_id")
        try:
            if kind == "deadline.add":
                self.google._request("DELETE", self._events_url(event_id))
                return "removed it again"
            if kind == "deadline.update":
                self.google._request("PATCH", self._events_url(event_id), json=payload["before"])
                return "restored the previous version"
            if kind == "calendar.update":
                url = f"{CALENDAR_API}/calendars/{quote(payload['calendar_id'], safe='')}"
                restored = self.google._request("PATCH", url, json=payload["before"])
                self.name = restored.get("summary") or self.name
                return "changed it back"
            if kind == "deadline.remove":
                restored = self.google._request("POST", self._events_url(), json=payload["before"])
                self.memory.update_action(action["id"], payload={**payload, "event_id": restored["id"]})
                return "put it back"
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (404, 410):
                return "it was already gone"
            raise
        raise ValueError(f"can't undo a {kind}")


def register(box: Toolbox, deadlines: Deadlines) -> None:
    areas = ", ".join(AREAS)
    box.add(Tool(
        "deadline_add",
        "Put a deadline on your own deadlines calendar (the single view of my deadlines). Do this "
        "yourself, without asking, whenever I mention a deadline or you spot a real one in my mail, tasks or "
        "messages, but check deadline_list first so you don't add duplicates. I'm told about every change "
        f"and can undo it. area is one of: {areas}.",
        schema({
            "title": {"type": "string", "description": "Short, e.g. 'Q4 investor update due'."},
            "due": {"type": "string", "description": "YYYY-MM-DD for a day, or YYYY-MM-DDTHH:MM for a time."},
            "area": {"type": "string", "enum": list(AREAS)},
            "notes": {"type": "string", "description": "Context: who asked, what's needed. Plain text."},
            "source": {"type": "string", "description": "Where you found it, e.g. 'email from Dana, 27 Oct'."},
        }, ["title", "due", "area"]),
        deadlines.add,
    ))
    box.add(Tool(
        "deadline_update",
        "Change a deadline on your deadlines calendar (moved date, renamed, different area, more notes). "
        "event_id comes from deadline_list.",
        schema({
            "event_id": {"type": "string"},
            "title": {"type": "string"},
            "due": {"type": "string", "description": "YYYY-MM-DD or YYYY-MM-DDTHH:MM"},
            "area": {"type": "string", "enum": list(AREAS)},
            "notes": {"type": "string"},
        }, ["event_id"]),
        deadlines.update,
    ))
    box.add(Tool(
        "deadline_remove",
        "Remove a deadline from your deadlines calendar when it's cancelled or was added by mistake. Leave done "
        "deadlines in place: they're the record.",
        schema({"event_id": {"type": "string"}}, ["event_id"]),
        deadlines.remove,
    ))
    box.add(Tool(
        "deadline_list",
        "List deadlines on your deadlines calendar with their event ids.",
        schema({
            "days_ahead": {"type": "integer", "description": "Default 60."},
            "days_back": {"type": "integer", "description": "Default 7."},
        }),
        deadlines.list,
    ))
    box.add(Tool(
        "deadline_calendar_settings",
        "Rename your deadlines calendar or change its description. It's yours; do this whenever it helps "
        "(I'm told and can undo it). It's tracked by id, so renaming never loses it.",
        schema({
            "name": {"type": "string", "description": "New calendar name."},
            "description": {"type": "string", "description": "New calendar description (plain text)."},
        }),
        deadlines.settings,
    ))
    box.undo["deadline"] = deadlines.undo
    box.undo["calendar"] = deadlines.undo
    box.senses.append("Writes: his own deadlines calendar, events and settings (acts freely, you're told, undoable)")
