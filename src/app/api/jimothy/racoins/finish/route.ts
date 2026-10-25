// POST { orderId, authorized } -> { balance }
//
// The player answered Steam's dialog. Declined: the order is closed. Approved:
// FinalizeTxn takes the money and the pack is credited, once.
//
// Safe to repeat. If the response to an earlier call was lost and the game
// asks again, FinalizeTxn fails because the money already moved; QueryTxn
// confirms it, and the credit function returns the balance without adding the
// pack a second time.

import { NextResponse } from "next/server";
import { sessionFrom } from "@/lib/jimothy/session";
import { finalizeTxn, queryTxn } from "@/lib/jimothy/steam";
import { creditOrder, fail, findOrder, markOrderFailed, wallet } from "@/lib/jimothy/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const steamId = sessionFrom(req);
  if (!steamId) return fail("unauthorized", 401);

  let body: { orderId?: unknown; authorized?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400);
  }
  const orderId = typeof body.orderId === "string" && /^\d{1,20}$/.test(body.orderId) ? body.orderId : null;
  if (!orderId) return fail("bad_request", 400);

  const order = await findOrder(orderId).catch(() => null);
  // Someone else's order is no order of yours.
  if (!order || order.steam_id !== steamId) return fail("no_such_order", 404);

  if (order.status === "finalized") {
    return NextResponse.json({ balance: (await wallet(steamId)).balance });
  }
  if (body.authorized !== true) {
    await markOrderFailed(orderId);
    return NextResponse.json({ balance: (await wallet(steamId)).balance, declined: true });
  }

  let transId: string;
  try {
    transId = (await finalizeTxn(orderId)).transid;
  } catch (finalizeError) {
    try {
      const known = await queryTxn(orderId);
      if (known.status !== "Succeeded" || known.steamid !== steamId) throw finalizeError;
      transId = known.transid;
    } catch (e) {
      console.error("jimothy FinalizeTxn failed", orderId, e);
      return fail("steam_refused", 502);
    }
  }

  try {
    return NextResponse.json({ balance: await creditOrder(orderId, transId) });
  } catch (e) {
    // Paid but not credited: the order stays 'init' with the money taken.
    // Loud, because it needs a person; a retry of this call credits it.
    console.error("jimothy PAID BUT NOT CREDITED", orderId, transId, e);
    return fail("credit_pending", 503);
  }
}
