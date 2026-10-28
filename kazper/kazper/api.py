"""Kazper's HTTP API: the door the /kazper web app talks through.

Runs inside the same process as the Discord bot, so both doors share one brain,
one toolbox and one memory. Only the website's server calls it (never a
browser): every request must carry `Authorization: Bearer KAZPER_API_SECRET`,
and the site checks you're signed in as the owner before forwarding anything.
Reads (history, facts, pointers, costs) go straight from the site to Supabase.

  GET  /health             liveness (no auth)
  POST /v1/chat            {"text"}                      -> a turn
  POST /v1/brief           {}                            -> a briefing turn
  POST /v1/review          {}                            -> a weekly-review turn (or a "nothing to review" note)
  POST /v1/feedback        {"exchange_id", "kind", "correction"?}  kind: good | bad | correction
  POST /v1/undo            {"action_id"}                 -> reverse one thing Kazper did
  POST /v1/calendar        {"days_ahead"?, "days_back"?, "include_all"?} -> his deadlines (+ your calendars)
  POST /v1/limits          {}                            -> balances and limits at OpenRouter, Railway, Supabase
"""

import hmac
import logging
import os
from typing import TYPE_CHECKING

from aiohttp import web

if TYPE_CHECKING:
    from .bot import KazperBot

log = logging.getLogger("kazper.api")

MAX_TEXT = 8000
FEEDBACK_KINDS = {"good", "bad", "correction"}


def _turn_json(turn) -> dict:
    return {
        "exchange_id": turn.exchange_id, "reply": turn.reply, "error": turn.error, "kind": turn.kind,
        "notes": turn.notes, "actions": turn.actions, "tools": turn.tools, "usage": turn.usage,
    }


def build_app(bot: "KazperBot", secret: str) -> web.Application:
    @web.middleware
    async def auth(request: web.Request, handler):
        if request.path == "/health":
            return await handler(request)
        header = request.headers.get("Authorization", "")
        if not hmac.compare_digest(header.encode(), f"Bearer {secret}".encode()):
            return web.json_response({"error": "unauthorized"}, status=401)
        return await handler(request)

    async def body(request: web.Request) -> dict:
        try:
            data = await request.json()
        except Exception:
            raise web.HTTPBadRequest(text='{"error": "expected a JSON body"}', content_type="application/json")
        if not isinstance(data, dict):
            raise web.HTTPBadRequest(text='{"error": "expected a JSON object"}', content_type="application/json")
        return data

    async def health(_):
        return web.json_response({"ok": True, "ready": bot.brain is not None})

    async def chat(request: web.Request):
        text = str((await body(request)).get("text", "")).strip()
        if not text or len(text) > MAX_TEXT:
            return web.json_response({"error": f"text must be 1–{MAX_TEXT} characters"}, status=400)
        if text.startswith("!"):
            return web.json_response({"error": "commands are Discord-only; the app has buttons for them"}, status=400)
        return web.json_response(_turn_json(await bot.converse(text, kind="chat", channel="web")))

    async def brief(_):
        return web.json_response(_turn_json(await bot.converse(bot.on_demand_briefing(), kind="briefing", channel="web")))

    async def review(_):
        turn = await bot.review_turn(channel="web")
        if turn is None:
            return web.json_response({"reply": "No 👎, corrections or pushback in the last 7 days — nothing to review.",
                                      "exchange_id": None, "error": None, "kind": "review", "notes": [], "actions": [], "tools": [],
                                      "usage": None})
        return web.json_response(_turn_json(turn))

    async def feedback(request: web.Request):
        data = await body(request)
        kind = data.get("kind")
        correction = str(data.get("correction") or "").strip() or None
        try:
            exchange_id = int(data.get("exchange_id"))
        except (TypeError, ValueError):
            return web.json_response({"error": "exchange_id must be an integer"}, status=400)
        if kind not in FEEDBACK_KINDS or (kind == "correction" and not correction):
            return web.json_response({"error": "kind must be good, bad or correction (with correction text)"},
                                     status=400)
        note = await bot.record_feedback(exchange_id, kind, correction)
        if note is False:
            return web.json_response({"error": f"no exchange #{exchange_id}"}, status=404)
        return web.json_response({"ok": True, "note": note})

    async def undo(request: web.Request):
        try:
            action_id = int((await body(request)).get("action_id"))
        except (TypeError, ValueError):
            return web.json_response({"error": "action_id must be an integer"}, status=400)
        ok, message = await bot.undo_action(action_id)
        return web.json_response({"ok": ok, "message": message}, status=200 if ok else 409)

    async def calendar(request: web.Request):
        data = await body(request)
        try:
            days_ahead = max(1, min(int(data.get("days_ahead", 30)), 120))
            days_back = max(0, min(int(data.get("days_back", 7)), 60))
        except (TypeError, ValueError):
            return web.json_response({"error": "days_ahead/days_back must be integers"}, status=400)
        return web.json_response(await bot.calendar_view(days_ahead, days_back, bool(data.get("include_all"))))

    async def limits(_):
        return web.json_response({"providers": await bot.limits.snapshot()})

    app = web.Application(middlewares=[auth], client_max_size=64 * 1024)
    app.add_routes([
        web.get("/health", health),
        web.post("/v1/chat", chat),
        web.post("/v1/brief", brief),
        web.post("/v1/review", review),
        web.post("/v1/feedback", feedback),
        web.post("/v1/undo", undo),
        web.post("/v1/calendar", calendar),
        web.post("/v1/limits", limits),
    ])
    return app


async def start(bot: "KazperBot", secret: str) -> web.AppRunner | None:
    if not secret:
        log.info("KAZPER_API_SECRET unset; HTTP API off (Discord only)")
        return None
    runner = web.AppRunner(build_app(bot, secret), access_log=None)
    await runner.setup()
    port = int(os.getenv("PORT", "8080"))  # Railway injects PORT for services with a public domain
    await web.TCPSite(runner, "0.0.0.0", port).start()
    log.info("HTTP API listening on :%s", port)
    return runner
