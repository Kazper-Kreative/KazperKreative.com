"""The money and limits Kazper runs on, for the app's Stats tab.

One read per provider, each independent (one failing never hides the others),
cached for a minute:
- OpenRouter: the prepaid balance every reply draws from, and this key's monthly cap.
- Railway: this billing period's projected resource use, priced at Railway's
  published rates, against the Hobby plan's included $5.
- Supabase (Kazper Mind): database size against the free plan's 500 MB.
Nothing here writes anywhere.
"""

import asyncio
import logging
import os
import time

import httpx

log = logging.getLogger("kazper.limits")

CACHE_SECONDS = 60
RAILWAY_API = "https://backboard.railway.com/graphql/v2"
# Railway's published container rates (docs.railway.com/pricing/plans, checked 2026-10-28).
# estimatedUsage reports CPU in vCPU-minutes, memory in GB-minutes and egress in GB.
RAILWAY_PRICES = {"CPU_USAGE": 0.000463, "MEMORY_USAGE_GB": 0.000231, "NETWORK_TX_GB": 0.05}
RAILWAY_INCLUDED_USD = 5.0  # Hobby
SUPABASE_FREE_DB_BYTES = 500 * 1024 * 1024

ESTIMATED_USAGE = """
query est($projectId: String!, $measurements: [MetricMeasurement!]!) {
  estimatedUsage(projectId: $projectId, measurements: $measurements) { measurement estimatedValue }
}"""


def openrouter(base_url: str, api_key: str) -> dict:
    headers = {"Authorization": f"Bearer {api_key}"}
    base = base_url.rstrip("/")
    with httpx.Client(timeout=15, headers=headers) as http:
        credits = http.get(f"{base}/credits").raise_for_status().json()["data"]
        key = http.get(f"{base}/key").raise_for_status().json()["data"]
    total, used = float(credits.get("total_credits") or 0), float(credits.get("total_usage") or 0)
    return {
        "provider": "openrouter", "ok": True,
        "balance_usd": round(total - used, 4), "purchased_usd": total, "used_usd": round(used, 4),
        "key_limit_usd": key.get("limit"), "key_remaining_usd": key.get("limit_remaining"),
        "key_resets": key.get("limit_reset"), "free_tier": bool(key.get("is_free_tier")),
    }


def railway(api_token: str, project_id: str) -> dict:
    resp = httpx.post(RAILWAY_API, timeout=20, headers={"Authorization": f"Bearer {api_token}"},
                      json={"query": ESTIMATED_USAGE,
                            "variables": {"projectId": project_id, "measurements": list(RAILWAY_PRICES)}})
    resp.raise_for_status()
    body = resp.json()
    if body.get("errors"):
        raise RuntimeError(body["errors"][0].get("message", "Railway API error"))
    usage = {u["measurement"]: float(u["estimatedValue"]) for u in body["data"]["estimatedUsage"]}
    cost = {m: round(usage.get(m, 0.0) * price, 4) for m, price in RAILWAY_PRICES.items()}
    total = round(sum(cost.values()), 2)
    log.info("Railway estimated usage this period: %s -> $%s", usage, total)
    return {
        "provider": "railway", "ok": True, "plan": "Hobby",
        "projected_usd": total, "included_usd": RAILWAY_INCLUDED_USD,
        "over_usd": round(max(0.0, total - RAILWAY_INCLUDED_USD), 2),
        "breakdown_usd": {"cpu": cost["CPU_USAGE"], "memory": cost["MEMORY_USAGE_GB"], "network": cost["NETWORK_TX_GB"]},
    }


def supabase(memory) -> dict:
    size = memory.db_size()
    return {"provider": "supabase", "ok": True, "project": "Kazper Mind", "plan": "Free",
            "db_bytes": size, "db_limit_bytes": SUPABASE_FREE_DB_BYTES}


class Limits:
    def __init__(self, cfg, memory):
        self.cfg, self.memory = cfg, memory
        self._cached: tuple[float, list[dict]] | None = None

    def _sources(self):
        cfg = self.cfg
        if "openrouter.ai" in cfg.llm_base_url:
            yield "openrouter", lambda: openrouter(cfg.llm_base_url, cfg.llm_api_key)
        project_id = os.getenv("RAILWAY_PROJECT_ID", "")  # Railway injects this into every service
        if cfg.railway_api_token and project_id:
            yield "railway", lambda: railway(cfg.railway_api_token, project_id)
        if hasattr(self.memory, "db_size"):
            yield "supabase", lambda: supabase(self.memory)

    async def snapshot(self) -> list[dict]:
        if self._cached and time.monotonic() - self._cached[0] < CACHE_SECONDS:
            return self._cached[1]
        sources = list(self._sources())
        names, fns = [n for n, _ in sources], [f for _, f in sources]
        results = await asyncio.gather(*(asyncio.to_thread(fn) for fn in fns), return_exceptions=True)
        out = []
        for name, result in zip(names, results):
            if isinstance(result, Exception):
                log.warning("Limits: %s unavailable (%s: %s)", name, type(result).__name__, result)
                out.append({"provider": name, "ok": False, "error": f"{type(result).__name__}: {str(result)[:160]}"})
            else:
                out.append(result)
        self._cached = (time.monotonic(), out)
        return out
