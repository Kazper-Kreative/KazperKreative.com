// POST { pack, language? } -> { orderId }
//
// Starts buying a Racoin pack: records the order, then InitTxn, which makes
// Steam show the player its purchase dialog in the overlay. The game hears the
// player's answer as MicroTxnAuthorizationResponse_t and calls /finish.

import { NextResponse } from "next/server";
import { findPack } from "@/lib/jimothy/catalog";
import { sessionFrom } from "@/lib/jimothy/session";
import { initTxn, purchaseLanguage } from "@/lib/jimothy/steam";
import { createOrder, fail, markOrderFailed } from "@/lib/jimothy/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const steamId = sessionFrom(req);
  if (!steamId) return fail("unauthorized", 401);

  let body: { pack?: unknown; language?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400);
  }
  const pack = findPack(body.pack);
  if (!pack) return fail("no_such_pack", 400);

  let orderId: string;
  try {
    orderId = await createOrder(steamId, pack);
  } catch {
    return fail("unavailable", 503);
  }

  try {
    await initTxn(
      orderId,
      steamId,
      { itemId: pack.itemId, amountCents: pack.priceCents, description: pack.description },
      purchaseLanguage(body.language)
    );
  } catch (e) {
    await markOrderFailed(orderId);
    console.error("jimothy InitTxn failed", orderId, e);
    return fail("steam_refused", 502);
  }

  return NextResponse.json({ orderId });
}
