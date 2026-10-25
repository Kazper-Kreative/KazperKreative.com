// POST { ticket } -> { token, expires, steamId, sandbox }
//
// The game's first call: a GetAuthTicketForWebApi("jimothy-store") ticket,
// hex-encoded, checked with Steam. Every other /api/jimothy route takes the
// token this returns as "Authorization: Bearer <token>".

import { NextResponse } from "next/server";
import { issueSession } from "@/lib/jimothy/session";
import { authenticateTicket, isSandbox, SteamError } from "@/lib/jimothy/steam";
import { fail } from "@/lib/jimothy/store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let ticket: unknown;
  try {
    ({ ticket } = await req.json());
  } catch {
    return fail("bad_request", 400);
  }
  if (typeof ticket !== "string") return fail("bad_request", 400);

  try {
    const steamId = await authenticateTicket(ticket);
    const { token, expires } = issueSession(steamId);
    return NextResponse.json({ token, expires, steamId, sandbox: isSandbox() });
  } catch (e) {
    if (e instanceof SteamError && e.code === "not_configured") return fail("not_configured", 503);
    return fail("bad_ticket", 401);
  }
}
