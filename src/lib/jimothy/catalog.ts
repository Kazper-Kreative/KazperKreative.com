// Jimothy's Adventure store: what Racoins cost and what they buy.
//
// The server is the only place prices live. The game shows what /wallet
// returns and never sends a price, so a modified client cannot buy a skin for
// less than this file says.
//
// Starter table proposed 25 Oct 2026, to be signed off by Kazper and Tim
// before the sandbox is switched off. Prices are set in USD and, per currency,
// in LOCAL_PRICES below; a player whose currency has no row is charged USD and
// Steam converts at finalize.

export interface RacoinPack {
  /** Our id, sent by the game. */
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
  { id: "bag", itemId: 1002, racoins: 1100, priceCents: 999, description: "1,100 Racoins (10% bonus)" },
  { id: "bin", itemId: 1003, racoins: 2400, priceCents: 1999, description: "2,400 Racoins (20% bonus)" },
];

/**
 * Each pack's price in the player's own currency, so the sign in the game and
 * Steam's dialog show the same round number (Kazper, 26 Oct 2026: Steam's
 * suggested prices). Amounts are in hundredths, as Steam takes them for every
 * currency -- JPY 1,100 is 110000 -- in RACOIN_PACKS order (pouch, bag, bin).
 *
 * Fill from Steamworks > Pricing > Pricing Explorer (partner site, behind
 * login) at USD 4.99 / 9.99 / 19.99. Rows are checked against Steam's
 * increment rules by localPrice(); a row that breaks them is ignored (USD).
 */
export const LOCAL_PRICES: Readonly<Record<string, readonly [number, number, number]>> = {};

/** Steam's minimum steps, in hundredths, for currencies without fractions
 *  (partner.steamgames.com/doc/store/pricing/currencies). Others take any. */
const STEAM_STEP: Readonly<Record<string, number>> = {
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

/** What this pack costs a player paying in `currency`: their own price if the
 *  table has a valid one, else USD. */
export function localPrice(pack: RacoinPack, currency: string | undefined): PackPrice {
  const index = RACOIN_PACKS.findIndex((p) => p.id === pack.id);
  const row = currency ? LOCAL_PRICES[currency] : undefined;
  const amount = row && index >= 0 ? row[index] : undefined;
  const step = currency ? STEAM_STEP[currency] ?? 1 : 1;
  if (
    currency && currency !== "USD" && STEAM_CURRENCIES.has(currency) &&
    Number.isInteger(amount) && (amount as number) > 0 && (amount as number) % step === 0
  ) {
    return { currency, amount: amount as number };
  }
  return { currency: "USD", amount: pack.priceCents };
}

/**
 * Skins sold for Racoins, by the game's SkinId (UJimothySkin::SkinId).
 * A skin not listed here is not for sale: the free ones are found in the
 * world. The first two (Kazper, 26 Oct 2026), priced so the $4.99 pouch buys
 * Night Shift and the $9.99 bag buys both.
 */
export const SKIN_PRICES: Readonly<Record<string, number>> = {
  NightShift: 500,
  NeonAlley: 600,
};

export function findPack(id: unknown): RacoinPack | undefined {
  return typeof id === "string" ? RACOIN_PACKS.find((p) => p.id === id) : undefined;
}

export function skinPrice(id: unknown): number | undefined {
  if (typeof id !== "string") return undefined;
  const price = SKIN_PRICES[id];
  return Number.isInteger(price) && price > 0 ? price : undefined;
}
