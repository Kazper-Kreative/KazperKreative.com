"""Kazper's Discord presence: your DM line to Kazper, its Discord sense, and its heartbeat.

- Talks only to its owner (DMs, or @mentions from the owner in a server).
- Watches the servers it's in for mentions of you / watch keywords (Tier 0: records, never replies).
- Sends the daily briefing at BRIEFING_TIME and a weekly self-review at REVIEW_DAY/REVIEW_TIME.

Commands (DM):
  !brief             briefing right now
  !senses            what Kazper is connected to
  !stats             cost, memory and how close the fine-tune dataset is
  !review            run the weekly self-review now
  !remember <fact>   save a permanent fact about you
  !facts             list saved facts
  !pointers          list Kazper's working notes to itself
  !forget <id|pN>    delete a fact (or pointer pN)
  !fix <better>      (as a Discord *reply* to a Kazper message) record what it should have said
  !help              show this list
React 👍 / 👎 on any Kazper message to rate it.
Kazper can save its own notes ("📝 Noted #id"); react 🗑️ on one to delete it.
"""

import asyncio
import json
import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import discord
from discord.ext import tasks

from . import api
from .brain import Brain
from .config import DAYS, Config
from .memory import open_memory
from .tools import Toolbox, cryptidkeep, deadlines, discord_watch, google, railway, recall, remember, slack

log = logging.getLogger("kazper")

DISCORD_LIMIT = 1900  # Discord caps messages at 2000 chars; leave headroom
GOOD, BAD, TRASH, UNDO = "👍", "👎", "🗑️", "↩️"
DATASET_GOAL = 500  # rated examples before a LoRA fine-tune is worth it

BRIEFING_PROMPT = (
    "[Scheduled] Morning briefing time. Use your tools to check: today's calendar, email from the last "
    "day that likely needs me, my Slack DMs, Discord mentions, my CryptidKeep tasks that are due "
    "soon or in progress, and Railway deploys that failed or crashed. Then give me a short, skimmable "
    "briefing in my voice: what needs me today, what can wait, and anything that looks off. Skip sources "
    "that aren't connected without fuss. Leave a pointer for anything I'll need to follow up on."
)

REVIEW_PROMPT = (
    "[Weekly review] Below is this week's feedback on your replies: 👎 ratings, corrections (what I said "
    "you should have said), and 'redirect' moments where I pushed back in chat (these can be false alarms). "
    "👍s show what to keep doing. Look for patterns in how you should behave differently. Save at most 3 "
    "lasting lessons with `remember`, phrased as instructions to yourself (e.g. 'Lead briefings with what "
    "needs action'), skipping anything already in your notes. Then reply with a short summary: what went "
    "wrong, what you saved, and anything you're unsure about.\n\n"
    '<untrusted_data source="feedback">\n{data}\n</untrusted_data>'
)

# You pushing back in plain chat ("no, I meant…") is an implicit correction of the previous reply.
REDIRECT = re.compile(
    r"^\s*(no\b|nope\b|nah\b|wrong\b|not (quite|really|what)\b|that'?s (not|wrong)\b|i meant\b|"
    r"you misunderstood\b|that isn'?t\b)", re.IGNORECASE,
)
NOT_REDIRECT = re.compile(r"^\s*no\b[,.!]?\s*(thanks|thank you|worries|problem|need|that'?s (all|it|fine))", re.IGNORECASE)
REDIRECT_WINDOW = timedelta(minutes=30)

HELP = (
    "**Kazper commands**\n"
    "`!brief` — briefing right now\n"
    "`!senses` — what I'm connected to\n"
    "`!stats` — what I cost and how much I've learned\n"
    "`!review` — review my 👎s and corrections now\n"
    "`!remember <fact>` — save a fact about you\n"
    "`!facts` — list saved facts\n"
    "`!pointers` — my working notes to myself\n"
    "`!forget <id>` / `!forget p<id>` — delete a fact / pointer\n"
    "`!fix <better reply>` — reply to one of my messages with what I should have said\n"
    f"React {GOOD} / {BAD} on my messages to rate them, {TRASH} on a 📝 note to delete it."
)


def _chunks(text: str) -> list[str]:
    chunks = []
    while len(text) > DISCORD_LIMIT:
        cut = text.rfind("\n", 0, DISCORD_LIMIT)
        if cut <= 0:
            cut = DISCORD_LIMIT
        chunks.append(text[:cut])
        text = text[cut:].lstrip("\n")
    chunks.append(text)
    return chunks


@dataclass
class Turn:
    """One answered message, whichever door it came through (Discord or the web app)."""
    kind: str
    reply: str | None = None
    error: str | None = None
    exchange_id: int | None = None
    notes: list[dict] = field(default_factory=list)  # 📝 facts Kazper saved this turn
    actions: list[dict] = field(default_factory=list)  # things he did this turn (undoable)
    tools: list[str] = field(default_factory=list)   # tools it called, in order
    usage: dict | None = None


def _parse_ts(value: str) -> datetime:
    ts = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    return ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)


async def build_toolbox(cfg: Config, memory) -> Toolbox:
    box = Toolbox()
    if cfg.google_client_id and cfg.google_client_secret and cfg.google_refresh_token:
        g = google.Google(cfg.google_client_id, cfg.google_client_secret, cfg.google_refresh_token, cfg.timezone)
        google.register(box, g)
        deadlines.register(box, deadlines.Deadlines(g, memory, cfg.timezone))
    if cfg.slack_user_token:
        slack.register(box, slack.Slack(cfg.slack_user_token))
    if cfg.cryptidkeep_url and cfg.cryptidkeep_token:
        await cryptidkeep.register(box, cfg.cryptidkeep_url, cfg.cryptidkeep_token)
    if cfg.railway_api_token:
        railway.register(box, railway.Railway(cfg.railway_api_token))
    discord_watch.register(box, memory)
    remember.register(box, memory)
    recall.register(box, memory)
    return box


class KazperBot(discord.Client):
    def __init__(self, cfg: Config):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(intents=intents)
        self.cfg = cfg
        self.memory = open_memory(cfg)
        self.brain: Brain | None = None
        self.note_messages: dict[int, int] = {}  # Discord message id of a 📝 note -> fact id (for 🗑️)
        self.action_messages: dict[int, int] = {}  # Discord message id of a reported action -> action id (for ↩️)
        self.api_runner = None

    async def setup_hook(self):
        tools = await build_toolbox(self.cfg, self.memory)
        self.brain = Brain(self.cfg, self.memory, tools)
        log.info("Memory: %s. Senses: %s", self.memory.backend, "; ".join(tools.senses) or "none")
        tz = ZoneInfo(self.cfg.timezone)
        if self.cfg.briefing_time:
            self.daily_briefing.change_interval(time=self.cfg.briefing_time.replace(tzinfo=tz))
            self.daily_briefing.start()
        if self.cfg.review_day is not None:
            self.weekly_review.change_interval(time=self.cfg.review_time.replace(tzinfo=tz))
            self.weekly_review.start()
        self.api_runner = await api.start(self, self.cfg.api_secret)

    async def close(self):
        if self.api_runner is not None:
            await self.api_runner.cleanup()
        await super().close()

    async def on_ready(self):
        log.info("Kazper is online as %s (id %s); owner id %s", self.user, self.user.id, self.cfg.owner_id)

    # --- heartbeat --------------------------------------------------------

    async def owner_dm(self) -> discord.abc.Messageable:
        owner = await self.fetch_user(self.cfg.owner_id)
        return owner.dm_channel or await owner.create_dm()

    @tasks.loop(hours=24)  # real schedule set in setup_hook from BRIEFING_TIME
    async def daily_briefing(self):
        await self.think_and_reply(await self.owner_dm(), BRIEFING_PROMPT, kind="briefing")

    @staticmethod
    def on_demand_briefing() -> str:
        return BRIEFING_PROMPT.replace("[Scheduled] Morning", "[On demand]")

    @tasks.loop(hours=24)  # fires daily at REVIEW_TIME; only acts on REVIEW_DAY
    async def weekly_review(self):
        if datetime.now(ZoneInfo(self.cfg.timezone)).weekday() != self.cfg.review_day:
            return
        await self.run_review(await self.owner_dm(), quiet_if_empty=True)

    @daily_briefing.before_loop
    @weekly_review.before_loop
    async def _wait_until_ready(self):
        await self.wait_until_ready()

    async def review_turn(self, channel: str) -> "Turn | None":
        """The weekly self-review as a turn, or None when there's nothing to learn from (no model call)."""
        feedback = await asyncio.to_thread(self.memory.feedback_since, 7)
        if not any(f["kind"] != "good" for f in feedback):
            return None
        items = [
            {"kind": f["kind"], "correction_or_pushback": f["correction"], "exchange_id": f["exchange"]["id"],
             "you_were_asked": f["exchange"]["user_text"][:1500], "you_replied": f["exchange"]["reply_text"][:1500]}
            for f in feedback
        ]
        data = json.dumps(items, ensure_ascii=False, indent=1)
        return await self.converse(REVIEW_PROMPT.format(data=data), kind="review", channel=channel)

    async def run_review(self, channel: discord.abc.Messageable, quiet_if_empty: bool = False):
        async with channel.typing():
            turn = await self.review_turn(channel="discord")
        if turn is None:
            if not quiet_if_empty:
                await channel.send("No 👎, corrections or pushback in the last 7 days — nothing to review.")
            return
        await self.deliver(channel, turn)

    # --- messages ---------------------------------------------------------

    async def on_message(self, message: discord.Message):
        if message.author.id == self.user.id:
            return
        if message.author.id != self.cfg.owner_id:
            if message.guild is not None:
                await self.notice(message)
            return
        # The owner: DMs always; in servers only when they @mention Kazper.
        if message.guild is not None and self.user not in message.mentions:
            return

        text = message.content.replace(self.user.mention, "").strip()
        if not text:
            log.warning("Owner message had no text; is Message Content Intent enabled in the Developer Portal?")
            return
        # Replies can contain private data (mail, calendar, Slack), so they only ever go to a DM.
        channel = message.channel
        if message.guild is not None:
            channel = message.author.dm_channel or await message.author.create_dm()
            await message.add_reaction("📬")
        if text.startswith("!"):
            await self.handle_command(message, text, channel)
            return
        await self.think_and_reply(channel, text)

    async def note_redirect(self, text: str):
        """If you push back on Kazper's last reply in plain chat, log it as feedback for the weekly review."""
        if not REDIRECT.match(text) or NOT_REDIRECT.match(text):
            return
        last = await asyncio.to_thread(self.memory.recent_exchanges, 1)
        if last and datetime.now(timezone.utc) - _parse_ts(last[0]["created_at"]) < REDIRECT_WINDOW:
            await asyncio.to_thread(self.memory.add_feedback, last[0], "redirect", text[:1000])

    async def converse(self, text: str, kind: str = "chat", channel: str = "discord") -> Turn:
        """Run one message through the brain and save it. Shared by Discord and the web app."""
        turn = Turn(kind=kind)
        turn_pointers: list[int] = []
        remember.noted.set(turn.notes)
        recall.left.set(turn_pointers)
        deadlines.done.set(turn.actions)
        if kind == "chat":
            await self.note_redirect(text)
        try:
            reply, prompt_messages, usage = await self.brain.respond(text, kind, channel)
        except Exception as e:
            log.exception("LLM call failed")
            turn.error = f"My brain didn't answer ({type(e).__name__}). Details are in the server logs."
            return turn
        turn.reply, turn.usage = reply, usage
        turn.tools = [c["function"]["name"] for m in prompt_messages for c in m.get("tool_calls") or []]
        turn.exchange_id = await asyncio.to_thread(
            self.memory.save_exchange, text, reply, prompt_messages, kind, usage, channel
        )
        log.info("Exchange #%s (%s via %s): %s calls, %s in (%s cached) / %s out tokens, $%s via %s",
                 turn.exchange_id, kind, channel, usage["llm_calls"], usage["prompt_tokens"],
                 usage["cached_tokens"], usage["completion_tokens"], usage["cost_usd"], usage["providers"])
        await asyncio.to_thread(self.memory.link_pointers, turn_pointers, turn.exchange_id)
        await asyncio.to_thread(self.memory.link_actions, [a["id"] for a in turn.actions], turn.exchange_id)
        return turn

    async def think_and_reply(self, channel: discord.abc.Messageable, text: str, kind: str = "chat"):
        async with channel.typing():
            turn = await self.converse(text, kind, "discord")
        await self.deliver(channel, turn)

    async def deliver(self, channel: discord.abc.Messageable, turn: Turn):
        if turn.error:
            await channel.send(f"⚠️ {turn.error}")
        else:
            for chunk in _chunks(turn.reply):
                sent = await channel.send(chunk, suppress_embeds=True)
                await asyncio.to_thread(self.memory.link_reply_message, sent.id, turn.exchange_id)
        await self.announce_notes(channel, turn.notes)
        for action in turn.actions:
            sent = await channel.send(f"🗓️ {action['summary']}  ·  react {UNDO} to undo")
            self.action_messages[sent.id] = action["id"]

    async def calendar_view(self, days_ahead: int, days_back: int, include_all: bool) -> dict:
        """His calendar (and optionally all of yours) for the app's Calendar tab. Read-only."""
        calendar = self.brain.tools.calendar
        if calendar is None:
            return {"connected": False}
        try:
            view = await asyncio.to_thread(calendar.view, days_ahead, days_back, include_all)
        except Exception as e:
            log.exception("Calendar view failed")
            return {"connected": True, "error": f"{type(e).__name__}: {e}"}
        return {"connected": True, **view}

    async def undo_action(self, action_id: int) -> tuple[bool, str]:
        """Reverse one logged action (Discord ↩️ or the app's Undo). Returns (ok, message)."""
        action = await asyncio.to_thread(self.memory.get_action, action_id)
        if action is None:
            return False, f"No action #{action_id}."
        if action["status"] != "done":
            return False, f"Action #{action_id} is already {action['status']}."
        undoer = self.brain.tools.undo.get(action["kind"].split(".")[0])
        if undoer is None:
            return False, f"I don't know how to undo a {action['kind']}."
        try:
            result = await asyncio.to_thread(undoer, action)
        except Exception as e:
            log.exception("Undo of action #%s failed", action_id)
            return False, f"Couldn't undo #{action_id} ({type(e).__name__}: {e})."
        await asyncio.to_thread(self.memory.update_action, action_id, status="undone",
                                decided_at=datetime.now(timezone.utc).isoformat())
        return True, f"Undid #{action_id}: {action['summary']} ({result})."

    async def record_feedback(self, exchange_id: int, kind: str, correction: str | None = None):
        """Feedback from the web app. Returns the 📝 lesson saved from a correction, None, or False if no such exchange."""
        found = await asyncio.to_thread(self.memory.get_exchanges, [exchange_id])
        if not found:
            return False
        await asyncio.to_thread(self.memory.add_feedback, found[0], kind, correction)
        if kind == "correction" and correction:
            return await self.lesson_from_fix(found[0], correction)
        return None

    async def announce_notes(self, channel: discord.abc.Messageable, notes: list[dict]):
        """Show the owner every fact Kazper saved this turn, so nothing lands in memory unseen."""
        for note in notes:
            sent = await channel.send(f"📝 Noted #{note['id']}: {note['text']}  ·  react {TRASH} to delete")
            self.note_messages[sent.id] = note["id"]

    async def notice(self, message: discord.Message):
        """Discord sense: record (never answer) mentions of the owner and keyword hits."""
        mentioned = any(u.id == self.cfg.owner_id for u in message.mentions)
        content = message.content.lower()
        keyword = next((k for k in self.cfg.discord_watch_keywords if k in content), None)
        if not (mentioned or keyword):
            return
        reason = "mentioned you" if mentioned else f"keyword '{keyword}'"
        summary = f"[{message.guild} #{message.channel}] {message.author.display_name} ({reason}): {message.content[:500]}"
        data = {"jump_url": message.jump_url, "guild": str(message.guild), "channel": str(message.channel)}
        await asyncio.to_thread(self.memory.add_event, "discord", summary, data)

    async def handle_command(self, message: discord.Message, text: str, channel: discord.abc.Messageable):
        cmd, _, arg = text.partition(" ")
        arg = arg.strip()
        mem = self.memory

        if cmd == "!help":
            await channel.send(HELP)
        elif cmd == "!brief":
            await self.think_and_reply(channel, self.on_demand_briefing(), kind="briefing")
        elif cmd == "!review":
            await self.run_review(channel)
        elif cmd == "!senses":
            senses = "\n".join(f"• {s}" for s in self.brain.tools.senses) or "• nothing yet"
            when = self.cfg.briefing_time.strftime("%H:%M") if self.cfg.briefing_time else "off"
            review = (f"{DAYS[self.cfg.review_day].title()} {self.cfg.review_time.strftime('%H:%M')}"
                      if self.cfg.review_day is not None else "off")
            await channel.send(f"**Connected:**\n{senses}\nMemory: {mem.backend} · Daily briefing: {when} · "
                               f"Weekly review: {review} ({self.cfg.timezone})")
        elif cmd == "!stats":
            await channel.send(self.format_stats(await asyncio.to_thread(mem.stats)))
        elif cmd == "!remember" and arg:
            fact_id = await asyncio.to_thread(mem.add_fact, arg)
            await channel.send(f"Got it — fact #{fact_id} saved.")
        elif cmd == "!facts":
            facts = await asyncio.to_thread(mem.list_facts)
            body = "\n".join(
                f"`#{f['id']}` {'📝 ' if f.get('source') == 'kazper' else ''}{f['text']}" for f in facts
            ) or "I don't have any saved facts yet."
            if any(f.get("source") == "kazper" for f in facts):
                body += "\n📝 = noted by me, not told by you"
            for chunk in _chunks(body):
                await channel.send(chunk)
        elif cmd == "!pointers":
            pointers = await asyncio.to_thread(mem.recent_pointers, 50)
            body = "\n".join(
                f"`p{p['id']}` {p['text']}" + (f" (#{p['exchange_id']})" if p.get("exchange_id") else "")
                for p in pointers
            ) or "No pointers right now."
            for chunk in _chunks(body):
                await channel.send(chunk)
        elif cmd == "!forget" and arg.lower().startswith("p") and arg[1:].isdigit():
            ok = await asyncio.to_thread(mem.forget_pointer, int(arg[1:]))
            await channel.send("Pointer cleared." if ok else f"No pointer {arg}.")
        elif cmd == "!forget" and arg.isdigit():
            ok = await asyncio.to_thread(mem.forget_fact, int(arg))
            await channel.send("Forgotten." if ok else f"No fact #{arg}.")
        elif cmd == "!fix" and arg:
            ref = message.reference.message_id if message.reference else None
            exchange = await asyncio.to_thread(mem.exchange_for_message, ref) if ref else None
            if exchange is None:
                await channel.send("Use `!fix` as a Discord reply to one of my messages.")
                return
            await asyncio.to_thread(mem.add_feedback, exchange, "correction", arg)
            await channel.send("Noted — I'll learn from that.")
            await self.learn_from_fix(channel, exchange, arg)
        else:
            await channel.send(HELP)

    async def lesson_from_fix(self, exchange: dict, correction: str) -> dict | None:
        """Distil a correction into a lasting 📝 note right away, instead of waiting for a fine-tune."""
        try:
            lesson = await self.brain.distil_lesson(exchange, correction)
        except Exception:
            log.exception("Lesson distillation failed")
            return None
        if not lesson:
            return None
        fact_id = await asyncio.to_thread(self.memory.add_fact, lesson, "kazper")
        return {"id": fact_id, "text": lesson}

    async def learn_from_fix(self, channel: discord.abc.Messageable, exchange: dict, correction: str):
        note = await self.lesson_from_fix(exchange, correction)
        if note:
            await self.announce_notes(channel, [note])

    @staticmethod
    def format_stats(s: dict) -> str:
        def usd(x: float) -> str:
            return f"${x:.2f}" if x >= 1 else f"${x:.4f}"

        examples = s["rated_good"] + s["corrections"]
        avg = usd(s["avg_cost_per_reply_usd"]) if s["avg_cost_per_reply_usd"] is not None else "n/a yet"
        return (
            "**Kazper stats**\n"
            f"Cost: {usd(s['cost_7d_usd'])} last 7 days · {usd(s['cost_30d_usd'])} last 30 days "
            f"({s['replies_30d']} replies, avg {avg} each)\n"
            f"Memory: {s['exchanges']} exchanges · {s['facts']} facts from you · {s['kazper_notes']} 📝 notes · "
            f"{s['pointers']} pointers\n"
            f"Feedback: {s['rated_good']} {GOOD} · {s['rated_bad']} {BAD} · {s['corrections']} corrections · "
            f"{s['redirects']} pushbacks\n"
            f"Fine-tune dataset: {examples}/{DATASET_GOAL} examples ({100 * examples // DATASET_GOAL}%)"
        )

    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        if payload.user_id != self.cfg.owner_id:
            return
        emoji = str(payload.emoji)
        if emoji.rstrip("\ufe0f") == UNDO.rstrip("\ufe0f") and payload.message_id in self.action_messages:
            ok, message = await self.undo_action(self.action_messages.pop(payload.message_id))
            channel = self.get_channel(payload.channel_id) or await self.fetch_channel(payload.channel_id)
            await channel.send(message if ok else f"⚠️ {message}")
            return
        # Discord may send 🗑 with or without the emoji variation selector, so compare the base character.
        if emoji.rstrip("️") == TRASH.rstrip("️") and payload.message_id in self.note_messages:
            fact_id = self.note_messages.pop(payload.message_id)
            ok = await asyncio.to_thread(self.memory.forget_fact, fact_id)
            channel = self.get_channel(payload.channel_id) or await self.fetch_channel(payload.channel_id)
            await channel.send(f"Deleted note #{fact_id}." if ok else f"Note #{fact_id} was already gone.")
            return
        if emoji not in (GOOD, BAD):
            return
        exchange = await asyncio.to_thread(self.memory.exchange_for_message, payload.message_id)
        if exchange is not None:
            await asyncio.to_thread(self.memory.add_feedback, exchange, "good" if emoji == GOOD else "bad")
