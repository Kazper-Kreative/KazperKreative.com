// POST { skin } -> { balance, owned }
//
// Spends Racoins on a skin at the price in catalog.ts. The client never sends
// a price. The main menu calls this; the den does not (Tim: no buying
// mid-night), but that is the game's rule, not the server's.

import { NextResponse } from "next/server";
import { findSkin } from "@/lib/jimothy/catalog";
import { sessionFrom } from "@/lib/jimothy/session";
import { buySkin, fail, wallet } from "@/lib/jimothy/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const steamId = sessionFrom(req);
  if (!steamId) return fail("unauthorized", 401);

  let skin: unknown;
  try {
    ({ skin } = await req.json());
  } catch {
    return fail("bad_request", 400);
  }
  const forSale = findSkin(skin);
  if (!forSale) return fail("not_for_sale", 400);

  try {
    const result = await buySkin(steamId, forSale.id, forSale.price);
    if ("error" in result) return fail(result.error, 409);
    const { owned } = await wallet(steamId);
    return NextResponse.json({ balance: result.balance, owned });
  } catch {
    return fail("unavailable", 503);
  }
}
