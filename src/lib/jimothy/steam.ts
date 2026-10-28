// Steam's partner Web API, for the Jimothy store. Server-only: every call
// carries the publisher key, which must never reach a client.
//
//   STEAM_PUBLISHER_KEY  the Publisher Web API key (Microtransactions + General)
//   STEAM_APP_ID         5082200 unless set
//   STEAM_MTX_SANDBOX    purchases go to ISteamMicroTxnSandbox -- no money
//                        moves -- unless this is exactly "0", or it is past
//                        the go-live time
//   STEAM_MTX_LIVE_AT    the go-live time (ISO 8601); STORE_LIVE_AT unless set.
//                        Unreadable means the sandbox, never live by mistake.

const PARTNER = "https://partner.steam-api.com";

/** The identity string the game passes to GetAuthTicketForWebApi. Both sides
 *  must use the same one or Steam rejects the ticket. */
export const TICKET_IDENTITY = "jimothy-store";

export function steamAppId(): string {
  return process.env.STEAM_APP_ID || "5082200";
}

/** Release morning: Friday 30 Oct 2026, 8:00 ET (Kazper, 28 Oct). Real money
 *  from here on, with nobody having to flip anything. Pre-launch rows in the
 *  database are marked creator gifts against the same moment
 *  (supabase/jimothy_creator_gifts_2026-10-28.sql); move both together. */
export const STORE_LIVE_AT = "2026-10-30T12:00:00Z";

export function liveAt(): number {
  return Date.parse(process.env.STEAM_MTX_LIVE_AT || STORE_LIVE_AT);
}

export function isSandbox(now: number = Date.now()): boolean {
  if (process.env.STEAM_MTX_SANDBOX === "0") return false;
  const at = liveAt();
  return Number.isNaN(at) || now < at;
}

function publisherKey(): string {
  const key = process.env.STEAM_PUBLISHER_KEY;
  if (!key) throw new SteamError("not_configured", "STEAM_PUBLISHER_KEY is not set");
  return key;
}

export class SteamError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "SteamError";
  }
}

type SteamResponse<T> = {
  response?: {
    result?: string;
    params?: T;
    error?: { errorcode?: number | string; errordesc?: string };
  };
};

async function call<T>(
  iface: string,
  method: string,
  version: string,
  params: Record<string, string>,
  post: boolean
): Promise<T> {
  const query = new URLSearchParams({ key: publisherKey(), ...params });
  const url = `${PARTNER}/${iface}/${method}/${version}/`;
  const res = post
    ? await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: query.toString(),
        cache: "no-store",
      })
    : await fetch(`${url}?${query.toString()}`, { cache: "no-store" });

  if (!res.ok) {
    throw new SteamError("http_" + res.status, `${iface}/${method}: HTTP ${res.status}`);
  }
  const body = (await res.json()) as SteamResponse<T>;
  const r = body.response;
  // ISteamMicroTxn answers { result: "OK", params }; ISteamUserAuth answers
  // { params } with its result inside params. A missing top-level result is
  // not a failure; an error object or a result other than OK is.
  if (!r || !r.params || r.error || (r.result !== undefined && r.result !== "OK")) {
    const e = r?.error;
    throw new SteamError(
      String(e?.errorcode ?? "failure"),
      `${iface}/${method}: ${e?.errordesc ?? r?.result ?? "no response"}`
    );
  }
  return r.params;
}

function microTxn(sandbox: boolean = isSandbox()): string {
  return sandbox ? "ISteamMicroTxnSandbox" : "ISteamMicroTxn";
}

/** Verify a GetAuthTicketForWebApi ticket (hex) and return whose it is. */
export async function authenticateTicket(ticketHex: string): Promise<string> {
  if (!/^[0-9a-fA-F]{16,4096}$/.test(ticketHex)) {
    throw new SteamError("bad_ticket", "ticket is not hex");
  }
  const params = await call<{ steamid?: string; result?: string }>(
    "ISteamUserAuth",
    "AuthenticateUserTicket",
    "v1",
    { appid: steamAppId(), ticket: ticketHex, identity: TICKET_IDENTITY },
    false
  );
  if (params.result !== "OK" || !params.steamid) {
    throw new SteamError("bad_ticket", "ticket not accepted");
  }
  return params.steamid;
}

export interface InitTxnItem {
  itemId: number;
  /** Hundredths of `currency`. */
  amountCents: number;
  /** ISO 4217; USD unless the player's own currency is priced. */
  currency: string;
  description: string;
}

/** The player's wallet currency, from Steam; undefined if Steam will not say
 *  (the store then prices in USD and Steam converts). */
export async function userCurrency(steamId: string): Promise<string | undefined> {
  try {
    const params = await call<{ currency?: string }>(
      microTxn(), "GetUserInfo", "v2", { steamid: steamId, appid: steamAppId() }, false);
    return typeof params.currency === "string" && /^[A-Z]{3}$/.test(params.currency)
      ? params.currency : undefined;
  } catch {
    return undefined;
  }
}

/** Start a purchase. Steam shows the player its overlay dialog; the game hears
 *  the answer as MicroTxnAuthorizationResponse_t and then calls finalize. */
export async function initTxn(
  orderId: string,
  steamId: string,
  item: InitTxnItem,
  language: string,
  sandbox: boolean
): Promise<{ orderid: string; transid: string }> {
  return call(microTxn(sandbox), "InitTxn", "v3", {
    orderid: orderId,
    steamid: steamId,
    appid: steamAppId(),
    itemcount: "1",
    language,
    currency: item.currency,
    usersession: "client",
    "itemid[0]": String(item.itemId),
    "qty[0]": "1",
    "amount[0]": String(item.amountCents),
    "description[0]": item.description.slice(0, 128),
  }, true);
}

// An order is finished on the API it was started on: one started in the
// sandbox just before going live is unknown to the live API.
export async function finalizeTxn(
  orderId: string,
  sandbox: boolean
): Promise<{ orderid: string; transid: string }> {
  return call(microTxn(sandbox), "FinalizeTxn", "v2", { orderid: orderId, appid: steamAppId() }, true);
}

/** What Steam knows about an order: used when finalize fails because it
 *  already went through (a retry after a dropped response). */
export async function queryTxn(
  orderId: string,
  sandbox: boolean
): Promise<{ orderid: string; transid: string; steamid: string; status: string }> {
  return call(microTxn(sandbox), "QueryTxn", "v3", { orderid: orderId, appid: steamAppId() }, false);
}

/** Steam's own languages for the purchase dialog (ISO 639-1, the ones it takes). */
const LANGUAGES = new Set([
  "ar", "bg", "zh-CN", "zh-TW", "cs", "da", "nl", "en", "fi", "fr", "de", "el", "hu", "it",
  "ja", "ko", "no", "pl", "pt", "pt-BR", "ro", "ru", "es", "sv", "th", "tr", "uk", "vi",
]);

export function purchaseLanguage(requested: unknown): string {
  return typeof requested === "string" && LANGUAGES.has(requested) ? requested : "en";
}
