// GET -> { balance, owned, packs, skins, sandbox }
//
// Everything the wardrobe shows: the player's Racoins, the skins he has bought,
// and the price list, which lives only here.

import { NextResponse } from "next/server";
import { sessionFrom } from "@/lib/jimothy/session";
import { fail, wallet } from "@/lib/jimothy/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const steamId = sessionFrom(req);
  if (!steamId) return fail("unauthorized", 401);
  try {
    return NextResponse.json(await wallet(steamId));
  } catch {
    return fail("unavailable", 503);
  }
}
