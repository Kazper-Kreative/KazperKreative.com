"""Discord sense: what Kazper noticed in the servers its bot is a member of.

The bot (bot.py) records mentions of you and watch-keyword hits as events;
this tool lets the model read them back. A bot can't see your personal DMs
or servers it hasn't been added to — reading those would mean logging in as
you, which Discord forbids.
"""

from . import Tool, Toolbox, schema


def register(box: Toolbox, memory) -> None:
    def discord_recent(hours: float = 24) -> list[dict]:
        return memory.recent_events("discord", hours)

    box.add(Tool(
        "discord_recent",
        "Discord messages from the last N hours (in servers Kazper is in) that mentioned me or "
        "matched my watch keywords. Each has the server, channel, author, text and a jump link.",
        schema({"hours": {"type": "number", "description": "Look-back window in hours (default 24)."}}),
        discord_recent,
    ))
    box.senses.append("Discord mentions/keywords in Kazper's servers")
