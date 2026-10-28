// What each Racoin pack costs the player in front of us, in his own currency.
//
// /wallet (the sign in the game) and /racoins/start (what Steam charges) both
// price through playerPrices() here, from the same day's exchange rates, so
// the two agree. The arithmetic is regionalPrices() in catalog.ts; this file
// only supplies the market data:
//
//   exchange rates  open.er-api.com (ExchangeRate-API's free feed, no key),
//                   updated once a day; held in memory until the feed's own
//                   next update, and kept for a few days if a refresh fails.
//   price levels    the World Bank snapshot in price-levels.ts, refreshed by
//                   scripts/jimothy-regional-prices.mjs --write. The data is
//                   yearly, and a snapshot cannot time out or disagree
//                   between two server instances.
//
// Server-only. Without a rate the player is charged USD, as before.

import { localPrice, RACOIN_PACKS, STEAM_CURRENCIES, type Market, type PackPrice, type RacoinPack } from "./catalog";
import { PRICE_LEVELS } from "./price-levels";

const FX_URL = "https://open.er-api.com/v6/latest/USD";
const HOUR = 60 * 60 * 1000;
/** Keep serving the last good rates this long past their refresh time if the
 *  feed is down. */
const STALE_FOR = 3 * 24 * HOUR;
/** After a failed fetch, wait this long before trying again. */
const RETRY_AFTER = 5 * 60 * 1000;

interface FxCache {
  rates: Record<string, number>;
  /** When to fetch again. */
  refreshAt: number;
  /** When to stop using these rates if no fetch has worked. */
  staleAt: number;
}

let cache: FxCache | undefined;
let pending: Promise<void> | undefined;
let retryAt = 0;

async function refresh(now: number): Promise<void> {
  try {
    const res = await fetch(FX_URL, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const body = (await res.json()) as {
      result?: string;
      rates?: Record<string, unknown>;
      time_next_update_unix?: number;
    };
    if (body.result !== "success" || !body.rates) throw new Error("result " + body.result);
    const rates: Record<string, number> = {};
    for (const [code, rate] of Object.entries(body.rates)) {
      if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) rates[code] = rate;
    }
    // Refresh just after the feed's own next update, so every instance moves
    // to the new day's rates at about the same moment; within 1-24 hours.
    const next = typeof body.time_next_update_unix === "number"
      ? body.time_next_update_unix * 1000 + 10 * 60 * 1000 : now + 24 * HOUR;
    const refreshAt = Math.min(Math.max(next, now + HOUR), now + 24 * HOUR);
    cache = { rates, refreshAt, staleAt: refreshAt + STALE_FOR };
  } catch (e) {
    retryAt = now + RETRY_AFTER;
    console.error("jimothy exchange rates unavailable", e);
  }
}

/** Today's rates, units per US dollar; undefined if there are none to use. */
export async function fxRates(now = Date.now()): Promise<Record<string, number> | undefined> {
  if ((!cache || now >= cache.refreshAt) && now >= retryAt) {
    pending ??= refresh(now).finally(() => {
      pending = undefined;
    });
    await pending;
  }
  return cache && now < cache.staleAt ? cache.rates : undefined;
}

/** The market regionalPrices() needs for `currency`, if we have its rate. */
export async function marketFor(currency: string | undefined): Promise<Market | undefined> {
  if (!currency || currency === "USD" || !STEAM_CURRENCIES.has(currency)) return undefined;
  const rate = (await fxRates())?.[currency];
  return rate === undefined ? undefined : { fxRate: rate, priceLevel: PRICE_LEVELS[currency]?.level };
}

/** Every pack's price for a player paying in `currency`, RACOIN_PACKS order. */
export async function playerPrices(currency: string | undefined): Promise<PackPrice[]> {
  const market = await marketFor(currency);
  return RACOIN_PACKS.map((pack) => localPrice(pack, currency, market));
}

/** One pack's price for a player paying in `currency`. */
export async function playerPrice(pack: RacoinPack, currency: string | undefined): Promise<PackPrice> {
  return localPrice(pack, currency, await marketFor(currency));
}

/** Tests only: forget the cached rates. */
export function resetFxCacheForTests(): void {
  cache = undefined;
  pending = undefined;
  retryAt = 0;
}
