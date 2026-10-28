"""Google Calendar + Gmail via a refresh token from setup_google.py.

Reads: every calendar you can see, and Gmail. The one write Google lets Kazper
make is on calendars *he created* (calendar.app.created), which is how his own
"Kazper · Deadlines" calendar works (tools/deadlines.py). Your other calendars
and Gmail stay read-only: Google itself refuses anything else.
"""

import base64
import time as _time
from datetime import datetime, timedelta
from urllib.parse import quote
from zoneinfo import ZoneInfo

import httpx

from . import Tool, Toolbox, schema

SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.app.created",  # only calendars Kazper creates
    "https://www.googleapis.com/auth/gmail.readonly",
]
CALENDAR_API = "https://www.googleapis.com/calendar/v3"
MAX_CALENDARS = 15
TOKEN_URL = "https://oauth2.googleapis.com/token"


class Google:
    def __init__(self, client_id: str, client_secret: str, refresh_token: str, tz: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.tz = ZoneInfo(tz)
        self.http = httpx.Client(timeout=20)
        self._access_token = ""
        self._expires_at = 0.0

    def _token(self) -> str:
        if _time.time() < self._expires_at - 60:
            return self._access_token
        r = self.http.post(TOKEN_URL, data={
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": self.refresh_token,
            "grant_type": "refresh_token",
        })
        r.raise_for_status()
        body = r.json()
        self._access_token = body["access_token"]
        self._expires_at = _time.time() + body.get("expires_in", 3600)
        return self._access_token

    def _get(self, url: str, **params) -> dict:
        return self._request("GET", url, params=params)

    def _request(self, method: str, url: str, params: dict | None = None, json: dict | None = None) -> dict:
        r = self.http.request(method, url, params=params, json=json,
                              headers={"Authorization": f"Bearer {self._token()}"})
        if r.status_code == 403 and "insufficient" in r.text.lower():
            raise PermissionError("Google says Kazper lacks permission for this. Re-run "
                                  "`python -m kazper.setup_google` and update GOOGLE_REFRESH_TOKEN on Railway.")
        r.raise_for_status()
        return r.json() if r.content else {}

    def calendars(self) -> list[dict]:
        """Every calendar in your list that isn't hidden (yours, shared with you, subscribed)."""
        items = self._get(f"{CALENDAR_API}/users/me/calendarList", maxResults=100).get("items", [])
        return [c for c in items if not c.get("hidden")][:MAX_CALENDARS]

    # --- calendar -------------------------------------------------------

    def calendar_events(self, days_ahead: int = 1, days_back: int = 0) -> list[dict]:
        today = datetime.now(self.tz).replace(hour=0, minute=0, second=0, microsecond=0)
        start = today - timedelta(days=days_back)
        end = today + timedelta(days=max(days_ahead, 1))
        events = []
        for cal in self.calendars():
            data = self._get(
                f"{CALENDAR_API}/calendars/{quote(cal['id'], safe='')}/events",
                timeMin=start.isoformat(), timeMax=end.isoformat(),
                singleEvents="true", orderBy="startTime", maxResults=50, timeZone=str(self.tz),
            )
            events += [(cal.get("summaryOverride") or cal.get("summary"), e) for e in data.get("items", [])]
        events.sort(key=lambda ce: ce[1].get("start", {}).get("dateTime") or ce[1].get("start", {}).get("date") or "")
        return [
            {
                "calendar": cal_name,
                "title": e.get("summary", "(no title)"),
                "start": e.get("start", {}).get("dateTime") or e.get("start", {}).get("date"),
                "end": e.get("end", {}).get("dateTime") or e.get("end", {}).get("date"),
                "location": e.get("location"),
                "all_day": "date" in e.get("start", {}),
                "attendees": len(e.get("attendees", [])),
                "my_response": next(
                    (a.get("responseStatus") for a in e.get("attendees", []) if a.get("self")), None
                ),
            }
            for cal_name, e in events
        ]

    def list_calendars(self) -> list[dict]:
        return [{"name": c.get("summaryOverride") or c.get("summary"), "access": c.get("accessRole"),
                 "primary": bool(c.get("primary"))} for c in self.calendars()]

    # --- gmail ----------------------------------------------------------

    def gmail_search(self, query: str = "is:unread newer_than:1d", max_results: int = 15) -> list[dict]:
        base = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
        ids = self._get(base, q=query, maxResults=min(max_results, 30)).get("messages", [])
        out = []
        for m in ids:
            msg = self._get(f"{base}/{m['id']}", format="metadata", metadataHeaders=["From", "Subject", "Date"])
            headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
            out.append({
                "id": m["id"],
                "from": headers.get("From"),
                "subject": headers.get("Subject"),
                "date": headers.get("Date"),
                "snippet": msg.get("snippet"),
                "labels": msg.get("labelIds", []),
            })
        return out

    def gmail_read(self, message_id: str) -> dict:
        msg = self._get(f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}", format="full")
        headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
        body = _plain_text(msg.get("payload", {})) or msg.get("snippet", "")
        return {
            "from": headers.get("From"), "to": headers.get("To"),
            "subject": headers.get("Subject"), "date": headers.get("Date"),
            "body": body[:6000],
        }


def _plain_text(part: dict) -> str:
    if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(part["body"]["data"] + "==").decode("utf-8", "replace")
    for sub in part.get("parts", []) or []:
        text = _plain_text(sub)
        if text:
            return text
    return ""


def register(box: Toolbox, google: Google) -> None:
    box.add(Tool(
        "calendar_events",
        "List events across all my Google calendars (each tagged with its calendar), starting from the "
        "beginning of today.",
        schema({
            "days_ahead": {"type": "integer", "description": "How many days forward to include (1 = today only)."},
            "days_back": {"type": "integer", "description": "How many past days to include (default 0)."},
        }),
        google.calendar_events,
    ))
    box.add(Tool(
        "calendar_list",
        "List the Google calendars I can see (mine, shared with me, subscribed), with my access level.",
        schema(),
        google.list_calendars,
    ))
    box.add(Tool(
        "gmail_search",
        "Search my Gmail with Gmail search syntax (e.g. 'is:unread newer_than:1d', 'from:alex', "
        "'is:important'). Returns sender, subject, date and a snippet for each message.",
        schema({
            "query": {"type": "string", "description": "Gmail search query."},
            "max_results": {"type": "integer", "description": "Max messages to return (default 15, max 30)."},
        }),
        google.gmail_search,
    ))
    box.add(Tool(
        "gmail_read",
        "Read the full text of one email by its id (from gmail_search).",
        schema({"message_id": {"type": "string"}}, ["message_id"]),
        google.gmail_read,
    ))
    box.senses.append("Google Calendar (all calendars) + Gmail (read-only)")
