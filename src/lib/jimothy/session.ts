// A short-lived token for the game, so it proves who it is to Steam once per
// session rather than on every request.
//
// "steamid.expiry.signature", signed with HMAC-SHA256 under a key derived from
// the publisher key: nobody without that key can mint one, and there is no
// extra secret to configure. Rotating the publisher key logs everyone out,
// which is the right thing to happen.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const LIFETIME_SECONDS = 6 * 60 * 60;

function signingKey(): Buffer {
  const key = process.env.STEAM_PUBLISHER_KEY;
  if (!key) throw new Error("STEAM_PUBLISHER_KEY is not set");
  return createHash("sha256").update("jimothy-session:" + key).digest();
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function issueSession(steamId: string, now = Date.now()): { token: string; expires: number } {
  const expires = Math.floor(now / 1000) + LIFETIME_SECONDS;
  const payload = `${steamId}.${expires}`;
  return { token: `${payload}.${sign(payload)}`, expires };
}

/** The Steam id a token was issued to, or null if it is forged or expired. */
export function readSession(token: unknown, now = Date.now()): string | null {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [steamId, expiresText, signature] = parts;
  if (!/^\d{1,20}$/.test(steamId) || !/^\d{1,12}$/.test(expiresText)) return null;

  const expected = Buffer.from(sign(`${steamId}.${expiresText}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(expiresText) * 1000 < now) return null;
  return steamId;
}

/** The session from "Authorization: Bearer <token>". */
export function sessionFrom(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  return readSession(header.startsWith("Bearer ") ? header.slice(7) : null);
}
