// Jimothy's Adventure store: what Racoins cost and what they buy.
//
// The server is the only place prices live. The game shows what /wallet
// returns and never sends a price, so a modified client cannot buy a skin for
// less than this file says.
//
// Starter table proposed 25 Oct 2026, to be signed off by Kazper and Tim
// before the sandbox is switched off. Prices are USD; Steam converts to the
// player's wallet currency at checkout.

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
