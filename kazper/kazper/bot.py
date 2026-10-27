"""Kazper's Discord presence: your DM line to Kazper, its Discord sense, and its heartbeat.

- Talks only to its owner (DMs, or @mentions from the owner in a server).
- Watches the servers it's in for mentions of you / watch keywords (Tier 0: records, never replies).
- Sends the daily briefing at BRIEFING_TIME.

Commands (DM):
  !brief             briefing right now
  !senses            what Kazper is connected to
  !remember <fact>   save a permanent fact about you
  !facts             list saved facts
  !forget <id>       delete a fact
  !fix <better>      (as a Discord *reply* to a Kazper message) record what it should have said
  !help              show this list
React 👍 / 👎 on any Kazper message to rate it.
Kazper can save its own notes ("📝 Noted #id"); react 🗑️ on one to delete it.
"""

import asyncio
import logging
from zoneinfo import ZoneInfo

import discord
from discord.ext import tasks

from .brain import Brain
from .config import Config
from .memory import open_memory
from .tools import Toolbox, cryptidkeep, discord_watch, google, railway, remember, slack

log = logging.getLogger("kazper")

DISCORD_LIMIT = 1900  # Discord caps messages at 2000 chars; leave headroom
GOOD, BAD, TRASH = "👍", "👎", "🗑️"

BRIEFING_PROMPT = (
    "[Scheduled] Morning briefing time. Use your tools to check: today's calendar, email from the last "
    "day that likely needs me, my Slack DMs, Discord mentions, my CryptidKeep tasks that are due "
    "soon or in progress, and Railway deploys that failed or crashed. Then give me a short, skimmable "
    "briefing in my voice: what needs me today, what can wait, and anything that looks off. Skip sources "
    "that aren't connected without fuss."
)

HELP = (
    "**Kazper commands**\n"
    "`!brief` — briefing right now\n"
    "`!senses` — what I'm connected to\n"
    "`!remember <fact>` — save a fact about you\n"
    "`!facts` — list saved facts\n"
    "`!forget <id>` — delete a fact\n"
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


async def build_toolbox(cfg: Config, memory) -> Toolbox:
    box = Toolbox()
    if cfg.google_client_id and cfg.google_client_secret and cfg.google_refresh_token:
        google.register(box, google.Google(cfg.google_client_id, cfg.google_client_secret,
                                           cfg.google_refresh_token, cfg.timezone))
    if cfg.slack_user_token:
        slack.register(box, slack.Slack(cfg.slack_user_token))
    if cfg.cryptidkeep_url and cfg.cryptidkeep_token:
        await cryptidkeep.register(box, cfg.cryptidkeep_url, cfg.cryptidkeep_token)
    if cfg.railway_api_token:
        railway.register(box, railway.Railway(cfg.railway_api_token))
    discord_watch.register(box, memory)
    remember.register(box, memory)
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

    async def setup_hook(self):
        tools = await build_toolbox(self.cfg, self.memory)
        self.brain = Brain(self.cfg, self.memory, tools)
        log.info("Memory: %s. Senses: %s", self.memory.backend, "; ".join(tools.senses) or "none")
        if self.cfg.briefing_time:
            self.daily_briefing.change_interval(
                time=self.cfg.briefing_time.replace(tzinfo=ZoneInfo(self.cfg.timezone))
            )
            self.daily_briefing.start()

    async def on_ready(self):
        log.info("Kazper is online as %s (id %s); owner id %s", self.user, self.user.id, self.cfg.owner_id)

    # --- heartbeat --------------------------------------------------------

    @tasks.loop(hours=24)  # real schedule set in setup_hook from BRIEFING_TIME
    async def daily_briefing(self):
        owner = await self.fetch_user(self.cfg.owner_id)
        await self.think_and_reply(owner.dm_channel or await owner.create_dm(), BRIEFING_PROMPT)

    @daily_briefing.before_loop
    async def _wait_until_ready(self):
        await self.wait_until_ready()

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

    async def think_and_reply(self, channel: discord.abc.Messageable, text: str):
        turn_notes: list[dict] = []
        remember.noted.set(turn_notes)
        async with channel.typing():
            try:
                reply, prompt_messages = await self.brain.respond(text)
            except Exception as e:
                log.exception("LLM call failed")
                await channel.send(f"⚠️ My brain didn't answer ({type(e).__name__}). Details are in the server logs.")
                await self.announce_notes(channel, turn_notes)
                return
        exchange_id = await asyncio.to_thread(self.memory.save_exchange, text, reply, prompt_messages)
        for chunk in _chunks(reply):
            sent = await channel.send(chunk, suppress_embeds=True)
            await asyncio.to_thread(self.memory.link_reply_message, sent.id, exchange_id)
        await self.announce_notes(channel, turn_notes)

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
            await self.think_and_reply(channel, BRIEFING_PROMPT.replace("[Scheduled] Morning", "[On demand]"))
        elif cmd == "!senses":
            senses = "\n".join(f"• {s}" for s in self.brain.tools.senses) or "• nothing yet"
            when = self.cfg.briefing_time.strftime("%H:%M") if self.cfg.briefing_time else "off"
            await channel.send(f"**Connected:**\n{senses}\nMemory: {mem.backend} · Daily briefing: {when} {self.cfg.timezone}")
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
        else:
            await channel.send(HELP)

    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        if payload.user_id != self.cfg.owner_id:
            return
        emoji = str(payload.emoji)
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
