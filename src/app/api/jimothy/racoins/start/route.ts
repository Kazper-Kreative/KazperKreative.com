// POST { pack, language?, currency?, amount? } -> { orderId }
//
// Starts buying a Racoin pack: records the order, then InitTxn, which makes
// Steam show the player its purchase dialog in the overlay. The game hears the
// player's answer as MicroTxnAuthorizationResponse_t and calls /finish.
//
// currency and amount are optional: the price the game's sign showed, from
// /wallet. If sent and today's price differs (the day's exchange rates moved
// on between the two calls), nothing is charged and the answer is 409
// price_changed, so the game can fetch /wallet again. The server never charges
// what the game sends; it only refuses to charge something else.

import { NextResponse } from "next/server";
import { findPack } from "@/lib/jimothy/catalog";
import { playerPrice } from "@/lib/jimothy/pricing";
import { sessionFrom } from "@/lib/jimothy/session";
import { initTxn, purchaseLanguage, userCurrency } from "@/lib/jimothy/steam";
import { createOrder, fail, markOrderFailed } from "@/lib/jimothy/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const steamId = sessionFrom(req);
  if (!steamId) return fail("unauthorized", 401);

  let body: { pack?: unknown; language?: unknown; currency?: unknown; amount?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400);
  }
  const pack = findPack(body.pack);
  if (!pack) return fail("no_such_pack", 400);

  // The player's own currency, asked of Steam each time, priced from the same
  // day's rates as the sign /wallet showed him.
  const price = await playerPrice(pack, await userCurrency(steamId));
  if (
    (body.currency !== undefined && body.currency !== price.currency) ||
    (body.amount !== undefined && body.amount !== price.amount)
  ) {
    return fail("price_changed", 409);
  }

  let orderId: string;
  try {
    orderId = await createOrder(steamId, pack, price);
  } catch {
    return fail("unavailable", 503);
  }

  try {
    await initTxn(
      orderId,
      steamId,
      { itemId: pack.itemId, amountCents: price.amount, currency: price.currency, description: pack.description },
      purchaseLanguage(body.language)
    );
  } catch (e) {
    await markOrderFailed(orderId);
    console.error("jimothy InitTxn failed", orderId, e);
    return fail("steam_refused", 502);
  }

  return NextResponse.json({ orderId });
}
