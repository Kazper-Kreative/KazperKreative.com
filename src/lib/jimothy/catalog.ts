// Jimothy's Adventure store: what Racoins cost and what they buy.
//
// The server is the only place prices live. The game shows what /wallet
// returns and never sends a price, so a modified client cannot buy a skin for
// less than this file says.
//
// Starter table proposed 25 Oct 2026; packs and skins repriced by Kazper,
// 27 Oct 2026. To be signed off by Kazper and Tim before the sandbox is
// switched off. Prices are set in USD. A player paying in another currency is
// charged a price of his own (Kazper, 28 Oct 2026): a hand-set LOCAL_PRICES
// row if there is one, else regionalPrices() below -- today's exchange rate,
// scaled down by the square root of the World Bank's price level where money
// buys more (softened, Kazper 28 Oct 2026), rounded
// to a price that reads naturally there. Only when neither can be worked out
// is he charged USD, and Steam converts at finalize.
//
// This file imports nothing, so scripts/jimothy-regional-prices.mjs can run
// the same arithmetic under plain Node.

export interface RacoinPack {
  /** Our id, sent by the game. Matched without regard to case: the game holds
   *  it in an FName, which comes back in whatever case the engine registered
   *  the name first ("bag" arrives as "Bag", the component name). */
  id: string;
  /** The itemid Steam records against the purchase. Never reuse one. */
  itemId: number;
  racoins: number;
  /** USD cents. */
  priceCents: number;
  /** Shown in Steam's purchase dialog; at most 128 characters. */
  description: string;
}

export const RACOIN_PACKS: readonly RacoinPack[] = [
  { id: "pouch", itemId: 1001, racoins: 500, priceCents: 499, description: "500 Racoins" },
  // 1002 was 1,100 Racoins and 1003 was 2,400 until 27 Oct 2026; an item id
  // names what was sold, so the new amounts took new ids.
  { id: "bag", itemId: 1004, racoins: 1200, priceCents: 999, description: "1,200 Racoins (20% bonus)" },
  { id: "bin", itemId: 1005, racoins: 2500, priceCents: 1999, description: "2,500 Racoins (25% bonus)" },
];

/**
 * Each pack's price in the player's own currency, so the sign in the game and
 * Steam's dialog show the same round number (Kazper, 26 Oct 2026: Steam's
 * suggested prices). Amounts are in hundredths, as Steam takes them for every
 * currency -- JPY 1,100 is 110000 -- in RACOIN_PACKS order (pouch, bag, bin).
 *
 * Hand overrides: a row here wins over the computed regional price. Fill from
 * Steamworks > Pricing > Pricing Explorer (partner site, behind login) at
 * USD 4.99 / 9.99 / 19.99, or by hand. Each amount is checked against Steam's
 * increment rules by localPrice(); one that breaks them is ignored and that
 * pack falls back to the computed price.
 */
export const LOCAL_PRICES: Readonly<Record<string, readonly [number, number, number]>> = {};

/** Steam's minimum steps, in hundredths, for currencies without fractions
 *  (partner.steamgames.com/doc/store/pricing/currencies). Others take any. */
export const STEAM_STEP: Readonly<Record<string, number>> = {
  CLP: 100, COP: 100, CRC: 500, IDR: 100, INR: 100, JPY: 100, KRW: 1000,
  KZT: 100, TWD: 100, UAH: 100, UYU: 100, VND: 50000,
};

/** Every currency Steam takes for microtransactions. */
export const STEAM_CURRENCIES: ReadonlySet<string> = new Set([
  "AED", "AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "COP", "CRC", "EUR", "GBP", "HKD", "ILS",
  "IDR", "INR", "JPY", "KRW", "KWD", "KZT", "MXN", "MYR", "NOK", "NZD", "PEN", "PHP", "PLN",
  "QAR", "RUB", "SAR", "SGD", "THB", "TWD", "UAH", "USD", "UYU", "VND", "ZAR",
]);

export interface PackPrice {
  /** ISO 4217. */
  currency: string;
  /** Hundredths of the currency, as Steam takes it. */
  amount: number;
}

/** What a currency's market looks like today, for regionalPrices(). */
export interface Market {
  /** Units of the currency one US dollar buys (open.er-api.com, daily). */
  fxRate: number;
  /** The World Bank price level ratio for the currency's economy: PPP
   *  conversion factor (PA.NUS.PPP) / market exchange rate (PA.NUS.FCRF),
   *  unclamped. Undefined when there is no figure: a straight conversion. */
  priceLevel?: number;
}

/** The regional factor never charges more than the straight conversion, nor
 *  less than 40% of it (Kazper, 28 Oct 2026). */
export const FACTOR_FLOOR = 0.4;
export const FACTOR_CEILING = 1;

/** How far rounding may land above the straight conversion: a natural price a
 *  hair over it reads better than an odd one under it, but only a hair. */
const ROUND_UP_ALLOWANCE = 1.02;

/**
 * The World Bank economy whose price level stands for each currency. EUR is
 * the euro area aggregate (EMU), whose ratio comes from GDP in US$ / GDP in
 * PPP$ because the Bank publishes no PPP factor for aggregates. USD is 1 by
 * definition. TWD has no row: Taiwan is not in the Bank's data, so it is a
 * straight conversion.
 */
export const CURRENCY_ECONOMY: Readonly<Record<string, string>> = {
  AED: "ARE", AUD: "AUS", BRL: "BRA", CAD: "CAN", CHF: "CHE", CLP: "CHL", CNY: "CHN",
  COP: "COL", CRC: "CRI", EUR: "EMU", GBP: "GBR", HKD: "HKG", ILS: "ISR", IDR: "IDN",
  INR: "IND", JPY: "JPN", KRW: "KOR", KWD: "KWT", KZT: "KAZ", MXN: "MEX", MYR: "MYS",
  NOK: "NOR", NZD: "NZL", PEN: "PER", PHP: "PHL", PLN: "POL", QAR: "QAT", RUB: "RUS",
  SAR: "SAU", SGD: "SGP", THB: "THA", UAH: "UKR", UYU: "URY", VND: "VNM", ZAR: "ZAF",
};

/** The square root of the price level, a softer discount than the ratio
 *  itself (euro area 0.74 -> 0.86, India 0.23 -> 0.48; Kazper, 28 Oct 2026),
 *  clamped to [FACTOR_FLOOR, FACTOR_CEILING]; 1 without a figure. */
export function regionalFactor(priceLevel: number | undefined): number {
  if (priceLevel === undefined || !Number.isFinite(priceLevel) || priceLevel <= 0) return 1;
  return Math.min(FACTOR_CEILING, Math.max(FACTOR_FLOOR, Math.sqrt(priceLevel)));
}

/**
 * How a price reads in each currency:
 *   round  whole, two significant figures: JPY 1,100, KRW 13,000, VND 52,000
 *   nine   whole units ending in 9: INR 449, RUB 399, CNY 39
 *   cents  the rest, ending .99 (.49 too under 10): CAD 5.99, EUR 4.49
 * Every whole style is also a multiple of Steam's step for that currency.
 */
const ROUND_CURRENCIES = new Set(["CLP", "COP", "CRC", "IDR", "JPY", "KRW", "UYU", "VND"]);
const NINE_CURRENCIES = new Set(["CNY", "HKD", "INR", "KZT", "PHP", "RUB", "THB", "TWD", "UAH"]);

/** Step and offset, in hundredths, of the natural prices in the decade that
 *  starts at `decade` units (1, 10, 100...). */
function grid(currency: string, decade: number): { step: number; offset: number } {
  if (ROUND_CURRENCIES.has(currency)) return { step: Math.max(1, decade / 10) * 100, offset: 0 };
  if (NINE_CURRENCIES.has(currency)) return { step: Math.max(10, decade / 10) * 100, offset: -100 };
  const units = decade < 10 ? 0.5 : decade < 100 ? 1 : decade < 1000 ? 5 : decade / 20;
  return { step: Math.round(units * 100), offset: -1 };
}

/** Every natural price for `currency` between lo and hi hundredths, ascending,
 *  that Steam's increment rule accepts. */
export function naturalPrices(currency: string, lo: number, hi: number): number[] {
  const steamStep = STEAM_STEP[currency] ?? 1;
  const out = new Set<number>();
  const first = Math.floor(Math.log10(Math.max(lo, 1) / 100));
  for (let d = first; Math.pow(10, d) * 100 <= hi; d++) {
    const decade = Math.pow(10, d);
    const { step, offset } = grid(currency, decade);
    const from = Math.ceil((decade * 100 - offset) / step);
    const to = Math.floor((decade * 1000 - offset) / step);
    for (let k = from; k <= to; k++) {
      const v = Math.round(k * step + offset);
      if (v > 0 && v >= lo && v <= hi && v % steamStep === 0) out.add(v);
    }
  }
  return [...out].sort((a, b) => a - b);
}

/**
 * The three packs' prices in `currency`, in hundredths, RACOIN_PACKS order:
 * USD price x exchange rate x regional factor (see regionalFactor), moved to the nearest natural
 * price no more than 2% over the straight conversion and, where one exists,
 * no less than 40% of it. A bigger pack is never dearer per Racoin than a
 * smaller one: where rounding would make it so, the bigger pack steps down,
 * below the 40% line only if nothing above it is fair. Undefined when it
 * cannot be worked out (no rate, not a Steam currency): the caller charges USD.
 */
export function regionalPrices(currency: string, market: Market | undefined): number[] | undefined {
  if (!market || currency === "USD" || !STEAM_CURRENCIES.has(currency)) return undefined;
  const { fxRate } = market;
  if (!Number.isFinite(fxRate) || fxRate <= 0) return undefined;
  const factor = regionalFactor(market.priceLevel);

  const amounts: number[] = [];
  for (let i = 0; i < RACOIN_PACKS.length; i++) {
    const pack = RACOIN_PACKS[i];
    const straight = pack.priceCents * fxRate;
    const target = straight * factor;
    const floor = straight * FACTOR_FLOOR;
    const options = naturalPrices(currency, target * 0.5, Math.min(target * 1.5, straight * ROUND_UP_ALLOWANCE));
    const before = amounts[i - 1];
    const prev = RACOIN_PACKS[i - 1];
    // Dearer than the smaller pack, but per Racoin no dearer (cross-multiplied).
    const fair = (x: number) => i === 0 || (x > before && x * prev.racoins <= before * pack.racoins);
    const nearest = (xs: number[]) =>
      xs.reduce<number | undefined>((best, x) =>
        best === undefined || Math.abs(x - target) < Math.abs(best - target) ? x : best, undefined);
    const amount =
      nearest(options.filter((x) => x >= floor && fair(x))) ?? nearest(options.filter(fair));
    if (amount === undefined) return undefined;
    amounts.push(amount);
  }
  return amounts;
}

function validAmount(currency: string, amount: number | undefined): amount is number {
  return Number.isInteger(amount) && (amount as number) > 0 && (amount as number) % (STEAM_STEP[currency] ?? 1) === 0;
}

/** What this pack costs a player paying in `currency`: the LOCAL_PRICES row if
 *  it has a valid one, else the regional price from `market`, else USD. */
export function localPrice(pack: RacoinPack, currency: string | undefined, market?: Market): PackPrice {
  const usd = { currency: "USD", amount: pack.priceCents };
  if (!currency || currency === "USD" || !STEAM_CURRENCIES.has(currency)) return usd;
  const index = RACOIN_PACKS.findIndex((p) => p.id === pack.id);
  if (index < 0) return usd;
  const override = LOCAL_PRICES[currency]?.[index];
  if (validAmount(currency, override)) return { currency, amount: override };
  const computed = regionalPrices(currency, market)?.[index];
  if (validAmount(currency, computed)) return { currency, amount: computed };
  return usd;
}

/**
 * Skins sold for Racoins, by the game's SkinId (UJimothySkin::SkinId).
 * A skin not listed here is not for sale: the free ones are found in the
 * world. Kazper, 27 Oct 2026: the $4.99 pouch buys Night Shift, the $9.99
 * bag buys Neon Alley or Undercover, and the $19.99 bin buys all three.
 */
export const SKIN_PRICES: Readonly<Record<string, number>> = {
  NightShift: 500,
  Undercover: 800,
  NeonAlley: 1200,
};

/** The pack the game asked for, by id in any case (see RacoinPack.id). */
export function findPack(id: unknown): RacoinPack | undefined {
  if (typeof id !== "string") return undefined;
  const wanted = id.toLowerCase();
  return RACOIN_PACKS.find((p) => p.id.toLowerCase() === wanted);
}

/** A skin for sale, by SkinId in any case (it is an FName in the game too),
 *  with the id spelled as this file spells it, for the database. */
export function findSkin(id: unknown): { id: string; price: number } | undefined {
  if (typeof id !== "string") return undefined;
  const wanted = id.toLowerCase();
  const key = Object.keys(SKIN_PRICES).find((k) => k.toLowerCase() === wanted);
  const price = key ? SKIN_PRICES[key] : undefined;
  return key && Number.isInteger(price) && (price as number) > 0 ? { id: key, price: price as number } : undefined;
}

export function skinPrice(id: unknown): number | undefined {
  return findSkin(id)?.price;
}
