"""Your calendar list: which calendars Kazper looks at, and which ones you see in Google.

Two levels, both undoable and reported like his deadline changes:
- mute / unmute: Kazper stops (or starts) reading a calendar. Only Kazper is
  affected; it stays in your Google Calendar. Stored as one "calendarlist.muted"
  state row in kazper_actions, so it survives restarts.
- hide / unhide / unsubscribe: changes your Google calendar list itself (needs
  the calendar.calendarlist scope). Hiding keeps the calendar but drops it from
  your list (and from Kazper's view); unsubscribing removes it. Neither deletes
  a calendar or touches its events or sharing: Google's scope doesn't allow it.
"""

import threading
from urllib.parse import quote

import httpx

from . import Tool, Toolbox, schema
from .deadlines import MAX_PER_TURN, done
from .google import CALENDAR_API, Google

STATE_KIND = "calendarlist.muted"
# What we put back when undoing a hide or an unsubscribe.
ENTRY_FIELDS = ("hidden", "selected", "summaryOverride", "colorId", "backgroundColor", "foregroundColor",
                "defaultReminders", "notificationSettings")

_lock = threading.Lock()


class CalendarList:
    def __init__(self, google: Google, memory, own_calendar=None):
        self.google = google
        self.memory = memory
        self.own_calendar = own_calendar  # Deadlines, so he can't mute or drop his own calendar
        self._state_id: int | None = None
        state = memory.latest_action(STATE_KIND)
        if state:
            self._state_id = state["id"]
            google.muted = set(state["payload"].get("muted", []))

    # --- plumbing -------------------------------------------------------

    def _entry_url(self, calendar_id: str) -> str:
        return f"{CALENDAR_API}/users/me/calendarList/{quote(calendar_id, safe='')}"

    def _resolve(self, calendar: str) -> dict:
        """A calendar list entry by id, or by its (case-insensitive) name, hidden ones included."""
        wanted = calendar.strip()
        entries = self.google.all_calendars()
        match = next((c for c in entries if c["id"] == wanted), None)
        if match is None:
            named = [c for c in entries
                     if wanted.lower() in {(c.get("summaryOverride") or "").lower(), (c.get("summary") or "").lower()}]
            if len(named) > 1:
                raise ValueError(f"more than one calendar is called '{wanted}'; use its id from calendar_list")
            match = named[0] if named else None
        if match is None:
            raise ValueError(f"no calendar '{wanted}' in your list; check calendar_list")
        return match

    def _guard(self, entry: dict, verb: str) -> None:
        if entry.get("primary"):
            raise ValueError(f"won't {verb} your primary calendar")
        if self.own_calendar is not None and entry["id"] == self.own_calendar.calendar_id():
            raise ValueError(f"won't {verb} his own deadlines calendar")

    @staticmethod
    def _name(entry: dict) -> str:
        return entry.get("summaryOverride") or entry.get("summary") or entry["id"]

    def _record(self, kind: str, summary: str, destination: str, payload: dict) -> str:
        turn = done.get()
        if turn is not None and len(turn) >= MAX_PER_TURN:
            raise RuntimeError(f"at most {MAX_PER_TURN} calendar changes per reply")
        action_id = self.memory.add_action(kind, summary, destination, payload)
        if turn is not None:
            turn.append({"id": action_id, "kind": kind, "summary": summary})
        return f"done; logged as action #{action_id} (I'll be told and can undo it)"

    def _save_muted(self, muted: set[str]) -> None:
        self.google.muted = muted
        payload = {"muted": sorted(muted)}
        if self._state_id is None:
            self._state_id = self.memory.add_action(STATE_KIND, "Calendars Kazper ignores", "Kazper", payload)
        else:
            self.memory.update_action(self._state_id, payload=payload)

    # --- tools ----------------------------------------------------------

    def mute(self, calendar: str) -> str:
        with _lock:
            entry = self._resolve(calendar)
            self._guard(entry, "mute")
            if entry["id"] in self.google.muted:
                return f"'{self._name(entry)}' is already muted"
            self._save_muted(self.google.muted | {entry["id"]})
            return self._record("calendarlist.mute", f"Stopped reading '{self._name(entry)}'", self._name(entry),
                                {"calendar_id": entry["id"]})

    def unmute(self, calendar: str) -> str:
        with _lock:
            entry = self._resolve(calendar)
            if entry["id"] not in self.google.muted:
                return f"'{self._name(entry)}' isn't muted"
            self._save_muted(self.google.muted - {entry["id"]})
            return self._record("calendarlist.unmute", f"Reading '{self._name(entry)}' again", self._name(entry),
                                {"calendar_id": entry["id"]})

    def hide(self, calendar: str) -> str:
        with _lock:
            entry = self._resolve(calendar)
            self._guard(entry, "hide")
            if entry.get("hidden"):
                return f"'{self._name(entry)}' is already hidden"
            self.google._request("PATCH", self._entry_url(entry["id"]), json={"hidden": True, "selected": False})
            return self._record("calendarlist.hide", f"Hid '{self._name(entry)}' from your calendar list",
                                self._name(entry), {"calendar_id": entry["id"],
                                                    "before": {k: bool(entry.get(k)) for k in ("hidden", "selected")}})

    def unhide(self, calendar: str) -> str:
        with _lock:
            entry = self._resolve(calendar)
            if not entry.get("hidden"):
                return f"'{self._name(entry)}' isn't hidden"
            self.google._request("PATCH", self._entry_url(entry["id"]), json={"hidden": False, "selected": True})
            return self._record("calendarlist.unhide", f"Put '{self._name(entry)}' back in your calendar list",
                                self._name(entry), {"calendar_id": entry["id"],
                                                    "before": {k: bool(entry.get(k)) for k in ("hidden", "selected")}})

    def unsubscribe(self, calendar: str) -> str:
        with _lock:
            entry = self._resolve(calendar)
            self._guard(entry, "unsubscribe from")
            if entry.get("accessRole") == "owner":
                raise ValueError(f"you own '{self._name(entry)}'; unsubscribing would only lose it from your list. "
                                 "Hide or mute it instead")
            self.google._request("DELETE", self._entry_url(entry["id"]))
            return self._record("calendarlist.unsubscribe", f"Unsubscribed you from '{self._name(entry)}'",
                                self._name(entry), {"calendar_id": entry["id"],
                                                    "before": {k: entry[k] for k in ENTRY_FIELDS if k in entry}})

    # --- undo -----------------------------------------------------------

    def undo(self, action: dict) -> str:
        payload, kind = action["payload"], action["kind"]
        calendar_id = payload["calendar_id"]
        with _lock:
            if kind == "calendarlist.mute":
                self._save_muted(self.google.muted - {calendar_id})
                return "reading it again"
            if kind == "calendarlist.unmute":
                self._save_muted(self.google.muted | {calendar_id})
                return "ignoring it again"
            try:
                if kind in ("calendarlist.hide", "calendarlist.unhide"):
                    self.google._request("PATCH", self._entry_url(calendar_id), json=payload["before"])
                    return "put it back how it was"
                if kind == "calendarlist.unsubscribe":
                    self.google._request("POST", f"{CALENDAR_API}/users/me/calendarList",
                                         params={"colorRgbFormat": "true"},
                                         json={"id": calendar_id, **payload["before"]})
                    return "subscribed you again"
            except httpx.HTTPStatusError as e:
                if kind == "calendarlist.unsubscribe" and e.response.status_code in (403, 404):
                    return "couldn't re-add it: you no longer have access, so it has to be re-shared with you"
                raise
        raise ValueError(f"can't undo a {kind}")


def register(box: Toolbox, calendars: CalendarList) -> None:
    target = {"calendar": {"type": "string", "description": "The calendar's id or exact name, from calendar_list."}}
    box.add(Tool(
        "calendar_mute",
        "Stop reading a calendar: its events no longer reach you (calendar_events, briefings, the app). It stays "
        "in my Google Calendar untouched. Use it for noisy calendars that don't matter to you.",
        schema(target, ["calendar"]),
        calendars.mute,
    ))
    box.add(Tool(
        "calendar_unmute",
        "Start reading a muted calendar again.",
        schema(target, ["calendar"]),
        calendars.unmute,
    ))
    box.add(Tool(
        "calendar_hide",
        "Hide a calendar from my Google calendar list (it still exists and I keep access; unhide brings it back). "
        "Hidden calendars are out of your view too. Only when I ask.",
        schema(target, ["calendar"]),
        calendars.hide,
    ))
    box.add(Tool(
        "calendar_unhide",
        "Put a hidden calendar back in my Google calendar list.",
        schema(target, ["calendar"]),
        calendars.unhide,
    ))
    box.add(Tool(
        "calendar_unsubscribe",
        "Remove a calendar I'm subscribed to or that's shared with me from my Google calendar list. Doesn't delete "
        "the calendar or change its sharing. Not for calendars I own (hide or mute those). Only when I ask.",
        schema(target, ["calendar"]),
        calendars.unsubscribe,
    ))
    box.undo["calendarlist"] = calendars.undo
    box.senses.append("Writes: your calendar list (mute freely; hide/unsubscribe when asked; you're told, undoable)")
