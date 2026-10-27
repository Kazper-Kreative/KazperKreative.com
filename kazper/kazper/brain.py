"""Kazper's brain: builds the prompt, calls the LLM, and runs the tool loop.

Uses the OpenAI-compatible chat API, which OpenRouter, Together, Fireworks,
vLLM and Ollama all speak — switching from a pay-per-token host to your own
rented GPU is just a change of LLM_BASE_URL.
"""

import asyncio
from datetime import datetime
from zoneinfo import ZoneInfo

from openai import AsyncOpenAI

from .config import Config
from .tools import Toolbox

MAX_TOOL_ROUNDS = 8

TIER_0_RULES = """## What you can do right now (Tier 0 — watch only)
You can READ my calendar, email, Slack, Discord mentions and CryptidKeep through your tools.
You cannot send, reply, post, accept, create or change anything yet — if I ask you to, say so
plainly and offer a draft I can send myself. Use tools whenever a question depends on my real
data instead of guessing. If a tool errors, say which source failed and carry on with the rest."""


class Brain:
    def __init__(self, cfg: Config, memory, tools: Toolbox):
        self.cfg = cfg
        self.memory = memory
        self.tools = tools
        self.client = AsyncOpenAI(base_url=cfg.llm_base_url, api_key=cfg.llm_api_key)

    def system_prompt(self, facts: list[dict]) -> str:
        # Re-read on every message so edits to the identity file apply without a restart.
        identity = self.cfg.identity_path.read_text(encoding="utf-8")
        facts_block = "\n".join(f"- {f['text']}" for f in facts) or "- (nothing yet)"
        senses = "\n".join(f"- {s}" for s in self.tools.senses) or "- (none connected)"
        now = datetime.now(ZoneInfo(self.cfg.timezone)).strftime("%A, %B %d, %Y %I:%M %p %Z")
        return (
            f"{identity}\n\n"
            f"## Things you've been told to remember\n{facts_block}\n\n"
            f"{TIER_0_RULES}\n\nConnected senses:\n{senses}\n\n"
            f"## Right now\nIt is {now}. You are talking with your human over Discord DM."
        )

    async def build_messages(self, user_text: str) -> list[dict]:
        facts, history = await asyncio.gather(
            asyncio.to_thread(self.memory.list_facts),
            asyncio.to_thread(self.memory.recent_exchanges, self.cfg.history_limit),
        )
        messages = [{"role": "system", "content": self.system_prompt(facts)}]
        for ex in history:
            messages.append({"role": "user", "content": ex["user_text"]})
            messages.append({"role": "assistant", "content": ex["reply_text"]})
        messages.append({"role": "user", "content": user_text})
        return messages

    async def respond(self, user_text: str) -> tuple[str, list[dict]]:
        """Returns the reply and the full message list (including tool calls) for logging."""
        messages = await self.build_messages(user_text)
        tools = self.tools.schemas()
        extra_body = {}
        if self.cfg.reasoning_effort:
            # OpenRouter's reasoning control; leave LLM_REASONING_EFFORT blank for providers without it.
            extra_body["reasoning"] = {"effort": self.cfg.reasoning_effort}

        for _ in range(MAX_TOOL_ROUNDS):
            kwargs = {"model": self.cfg.llm_model, "messages": messages, "extra_body": extra_body or None}
            if tools:
                kwargs["tools"] = tools
            completion = await self.client.chat.completions.create(**kwargs)
            msg = completion.choices[0].message
            if not msg.tool_calls:
                reply = (msg.content or "").strip()
                return reply or "(I came up blank — try again?)", messages

            messages.append({
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {"id": c.id, "type": "function", "function": {"name": c.function.name, "arguments": c.function.arguments}}
                    for c in msg.tool_calls
                ],
            })
            results = await asyncio.gather(
                *(self.tools.run(c.function.name, c.function.arguments) for c in msg.tool_calls)
            )
            for call, result in zip(msg.tool_calls, results):
                messages.append({"role": "tool", "tool_call_id": call.id, "content": result})

        return "(I got lost looking things up — ask me again, maybe more specifically?)", messages
