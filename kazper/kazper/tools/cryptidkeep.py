"""CryptidKeep, read-only, through its MCP server.

Kazper connects as an MCP client, so this same bridge can plug any MCP
server into Kazper later. Only the read tools below are exposed (Tier 0);
CryptidKeep's write tools are deliberately left out.
"""

import logging

from mcp import ClientSession
from mcp.client.streamable_http import create_mcp_http_client, streamable_http_client

from . import Tool, Toolbox

log = logging.getLogger("kazper.cryptidkeep")

READ_ONLY_TOOLS = {
    "whoami", "list_projects", "get_project_summary", "list_tasks", "get_task",
    "list_notes", "get_note", "search", "list_my_recent_changes",
}
PREFIX = "cryptidkeep_"


class McpServer:
    def __init__(self, url: str, token: str):
        self.url = url
        self.headers = {"Authorization": f"Bearer {token}"}

    async def _session_call(self, fn):
        # One short-lived session per call: simple, and survives server restarts.
        async with create_mcp_http_client(headers=self.headers) as http:
            async with streamable_http_client(self.url, http_client=http) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    return await fn(session)

    async def list_tools(self):
        return await self._session_call(lambda s: s.list_tools())

    async def call(self, name: str, arguments: dict) -> str:
        result = await self._session_call(lambda s: s.call_tool(name, arguments))
        parts = [getattr(c, "text", None) for c in (getattr(result, "content", None) or [])]
        text = "\n".join(p for p in parts if p) or str(getattr(result, "structured_content", "") or "")
        if getattr(result, "is_error", False):
            return f"error: {text}"
        return text


async def register(box: Toolbox, url: str, token: str) -> None:
    server = McpServer(url, token)
    try:
        listing = await server.list_tools()
    except Exception as e:
        log.warning("CryptidKeep unavailable, skipping: %s", e)
        return

    added = 0
    for t in listing.tools:
        if t.name not in READ_ONLY_TOOLS:
            continue

        async def call(_name=t.name, **kwargs):
            return await server.call(_name, kwargs)

        box.add(Tool(
            PREFIX + t.name,
            f"[CryptidKeep, my project-management tool] {t.description or t.name}",
            t.input_schema or {"type": "object", "properties": {}},
            call,
        ))
        added += 1
    if added:
        box.senses.append(f"CryptidKeep ({added} read-only tools)")
