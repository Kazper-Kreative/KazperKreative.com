"""Loads Kazper's settings from .env (locally) or the environment (Railway).

Required: Discord + LLM. Everything else is optional — each sense switches
on only when its credentials are present, so Kazper degrades gracefully.
"""

import os
from dataclasses import dataclass
from datetime import time
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
# override=True: Kazper's .env wins over same-named system variables
# (e.g. a global DISCORD_TOKEN belonging to another bot).
load_dotenv(ROOT / ".env", override=True)


def _require(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise SystemExit(f"Missing {name} (see .env.example)")
    return value


def _opt(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


@dataclass(frozen=True)
class Config:
    discord_token: str
    owner_id: int
    llm_base_url: str
    llm_api_key: str
    llm_model: str
    reasoning_effort: str
    deep_reasoning_effort: str
    provider_order: tuple[str, ...]
    recent_turns: int
    timezone: str
    briefing_time: time | None
    review_day: int | None  # 0 = Monday … 6 = Sunday
    review_time: time
    identity_path: Path
    data_dir: Path
    # memory
    supabase_url: str
    supabase_service_key: str
    # senses
    google_client_id: str
    google_client_secret: str
    google_refresh_token: str
    slack_user_token: str
    discord_watch_keywords: tuple[str, ...]
    # Servers Kazper may be in; he leaves any other. Empty = he stays put (and still ignores everyone else).
    discord_allowed_guilds: frozenset[int]
    # Off by default: no one but the owner can reach Kazper in any way. On = record others' messages
    # that mention the owner / watch keywords, in allowed servers only.
    discord_watch_others: bool
    cryptidkeep_url: str
    cryptidkeep_token: str
    # web app door (kazper/api.py); blank = Discord only
    api_secret: str
    railway_api_token: str


DAYS = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")


def _hhmm(raw: str) -> time:
    hour, minute = raw.split(":")
    return time(int(hour), int(minute))


def _briefing_time() -> time | None:
    raw = _opt("BRIEFING_TIME", "07:00")
    if raw.lower() in ("", "off", "none"):
        return None
    return _hhmm(raw)


def _review_day() -> int | None:
    raw = _opt("REVIEW_DAY", "sun").lower()[:3]
    if raw in ("", "off", "non"):
        return None
    if raw not in DAYS:
        raise SystemExit(f"REVIEW_DAY must be one of {', '.join(DAYS)} or off")
    return DAYS.index(raw)


def load_config() -> Config:
    data_dir = ROOT / "data"
    data_dir.mkdir(exist_ok=True)
    effort = _opt("LLM_REASONING_EFFORT")
    keywords = tuple(k.strip().lower() for k in _opt("DISCORD_WATCH_KEYWORDS").split(",") if k.strip())
    return Config(
        discord_token=_require("DISCORD_TOKEN"),
        owner_id=int(_require("OWNER_DISCORD_ID")),
        llm_base_url=_require("LLM_BASE_URL"),
        llm_api_key=_require("LLM_API_KEY"),
        llm_model=_require("LLM_MODEL"),
        reasoning_effort=effort,
        # Briefings and weekly reviews juggle several sources, so they get to think harder.
        deep_reasoning_effort=_opt("LLM_DEEP_REASONING_EFFORT", "medium" if effort else ""),
        provider_order=tuple(p.strip() for p in _opt("LLM_PROVIDER_ORDER").split(",") if p.strip()),
        recent_turns=int(_opt("RECENT_TURNS", "6")),
        timezone=_opt("TIMEZONE", "America/New_York"),
        briefing_time=_briefing_time(),
        review_day=_review_day(),
        review_time=_hhmm(_opt("REVIEW_TIME", "18:00")),
        identity_path=ROOT / "identity" / "kazper_identity.md",
        data_dir=data_dir,
        supabase_url=_opt("SUPABASE_URL").rstrip("/"),
        supabase_service_key=_opt("SUPABASE_SERVICE_ROLE_KEY"),
        google_client_id=_opt("GOOGLE_CLIENT_ID"),
        google_client_secret=_opt("GOOGLE_CLIENT_SECRET"),
        google_refresh_token=_opt("GOOGLE_REFRESH_TOKEN"),
        slack_user_token=_opt("SLACK_USER_TOKEN"),
        discord_watch_keywords=keywords,
        discord_watch_others=_opt("DISCORD_WATCH_OTHERS").lower() in ("on", "true", "1", "yes"),
        discord_allowed_guilds=frozenset(
            int(g) for g in _opt("DISCORD_ALLOWED_GUILDS").replace(" ", "").split(",") if g.isdigit()
        ),
        cryptidkeep_url=_opt("CRYPTIDKEEP_MCP_URL"),
        cryptidkeep_token=_opt("CRYPTIDKEEP_TOKEN"),
        api_secret=_opt("KAZPER_API_SECRET"),
        railway_api_token=_opt("RAILWAY_API_TOKEN"),
    )
