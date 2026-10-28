"""Kazper's tools: functions the model can call to look things up.

v1 is Tier 0 (watch only): every tool here READS. Nothing sends, replies,
creates or edits — acting on your behalf arrives in v2 with approvals.
"""

import asyncio
import inspect
import json
import logging
from dataclasses import dataclass
from typing import Any, Callable

log = logging.getLogger("kazper.tools")

MAX_RESULT_CHARS = 12_000


@dataclass
class Tool:
    name: str
    description: str
    parameters: dict  # JSON schema for the arguments
    fn: Callable[..., Any]  # sync or async; returns anything JSON-serialisable


class Toolbox:
    def __init__(self):
        self.tools: dict[str, Tool] = {}
        self.senses: list[str] = []  # human-readable list of what's connected
        # How to reverse a logged action, by the prefix of its kind ("deadline" for "deadline.add").
        self.undo: dict[str, Callable[[dict], str]] = {}

    def add(self, tool: Tool) -> None:
        self.tools[tool.name] = tool

    def schemas(self) -> list[dict]:
        return [
            {"type": "function", "function": {"name": t.name, "description": t.description, "parameters": t.parameters}}
            for t in self.tools.values()
        ]

    async def run(self, name: str, arguments: str) -> str:
        tool = self.tools.get(name)
        if tool is None:
            return f"error: no tool named {name}"
        try:
            args = json.loads(arguments or "{}")
            if inspect.iscoroutinefunction(tool.fn):
                result = await tool.fn(**args)
            else:
                result = await asyncio.to_thread(tool.fn, **args)
        except Exception as e:
            log.exception("Tool %s failed", name)
            return f"error: {type(e).__name__}: {e}"
        text = result if isinstance(result, str) else json.dumps(result, ensure_ascii=False, default=str)
        if len(text) > MAX_RESULT_CHARS:
            text = text[:MAX_RESULT_CHARS] + "\n…(truncated)"
        # Fence it: mail/Slack/Discord/task text is written by other people (see brain.TIER_0_RULES).
        return f'<untrusted_data source="{name}">\n{text}\n</untrusted_data>'


def schema(properties: dict | None = None, required: list[str] | None = None) -> dict:
    return {"type": "object", "properties": properties or {}, "required": required or []}
