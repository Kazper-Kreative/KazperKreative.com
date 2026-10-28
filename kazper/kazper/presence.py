"""Live activity for the app's Presence tab: what Kazper is doing, as he does it.

Each step of a turn (heard you, thinking, a tool call, replying, an error) is
appended to kazper_activity, and the Presence tab polls it. Writes go through a
single background thread so they land in order and never slow a reply down; if
the table is missing or Supabase is unreachable, the step is dropped and logged.
Only the Supabase memory has the table, so with SQLite this does nothing.
"""

import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

log = logging.getLogger("kazper.presence")

KINDS = {"heard", "thinking", "tool", "speaking", "error"}
KEEP = timedelta(days=2)
PRUNE_EVERY = 200  # steps between clean-ups

_memory = None
_pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix="kazper-presence")
_writes = 0
_warned = False


def attach(memory) -> None:
    global _memory
    _memory = memory if hasattr(memory, "add_activity") else None
    if _memory is not None:
        _pool.submit(_prune)


def emit(kind: str, text: str = "") -> None:
    """Record one step. Never raises, never blocks."""
    if _memory is None or kind not in KINDS:
        return
    _pool.submit(_write, kind, " ".join(text.split())[:300])


def _write(kind: str, text: str) -> None:
    global _writes, _warned
    try:
        _memory.add_activity(kind, text)
    except Exception as e:
        if not _warned:
            log.warning("Presence activity not recorded (%s: %s); the Presence tab will lag behind", type(e).__name__, e)
            _warned = True
        return
    _writes += 1
    if _writes % PRUNE_EVERY == 0:
        _prune()


def _prune() -> None:
    try:
        _memory.prune_activity((datetime.now(timezone.utc) - KEEP).isoformat())
    except Exception:
        log.debug("Activity prune failed", exc_info=True)
