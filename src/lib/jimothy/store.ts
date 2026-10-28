// The Racoin store's database side. Every write goes through the service-role
// client, and every balance change through the two SQL functions in
// supabase/jimothy_store.sql, so it happens in one transaction.

import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";
import { RACOIN_PACKS, SKIN_PRICES, type PackPrice, type RacoinPack } from "./catalog";
import { playerPrices } from "./pricing";
import { isSandbox, userCurrency } from "./steam";

export function db() {
  const client = createSupabaseService();
  if (!client) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return client;
}

export function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function wallet(steamId: string) {
  const supabase = db();
  // Every wallet asks Steam for the player's currency, so the signs agree with
  // what /racoins/start will charge, after a purchase as much as before one.
  const [{ data: row }, { data: owned }, currency] = await Promise.all([
    supabase.from("jimothy_wallets").select("balance").eq("steam_id", steamId).maybeSingle(),
    supabase.from("jimothy_owned_skins").select("skin_id").eq("steam_id", steamId),
    userCurrency(steamId),
  ]);
  // The same prices /racoins/start charges: one currency lookup, one day's rates.
  const prices = await playerPrices(currency);
  return {
    balance: row?.balance ?? 0,
    owned: (owned ?? []).map((r) => r.skin_id as string),
    // priceCents stays USD for older builds; currency and amount are what the
    // player is charged, in hundredths.
    packs: RACOIN_PACKS.map((pack, i) => ({
      id: pack.id, racoins: pack.racoins, priceCents: pack.priceCents, ...prices[i],
    })),
    skins: Object.entries(SKIN_PRICES).map(([id, price]) => ({ id, price })),
    sandbox: isSandbox(),
  };
}

export async function createOrder(steamId: string, pack: RacoinPack, price: PackPrice): Promise<string> {
  const { data, error } = await db()
    .from("jimothy_orders")
    .insert({
      steam_id: steamId,
      pack_id: pack.id,
      item_id: pack.itemId,
      racoins: pack.racoins,
      amount_cents: price.amount,
      currency: price.currency,
      sandbox: isSandbox(),
    })
    .select("order_id")
    .single();
  if (error || !data) throw new Error("order_insert_failed: " + (error?.message ?? ""));
  return String(data.order_id);
}

export async function findOrder(orderId: string) {
  const { data } = await db()
    .from("jimothy_orders")
    .select("order_id,steam_id,status")
    .eq("order_id", orderId)
    .maybeSingle();
  return data as { order_id: number; steam_id: string; status: string } | null;
}

export async function markOrderFailed(orderId: string) {
  await db().from("jimothy_orders").update({ status: "failed" }).eq("order_id", orderId).eq("status", "init");
}

export async function creditOrder(orderId: string, transId: string): Promise<number> {
  const { data, error } = await db().rpc("jimothy_credit_order", {
    p_order_id: orderId,
    p_trans_id: transId,
  });
  if (error) throw new Error("credit_failed: " + error.message);
  return data as number;
}

/** Spend Racoins on a skin; the SQL function's own errors come back by name. */
export async function buySkin(
  steamId: string,
  skinId: string,
  price: number
): Promise<{ balance: number } | { error: "already_owned" | "insufficient" }> {
  const { data, error } = await db().rpc("jimothy_buy_skin", {
    p_steam_id: steamId,
    p_skin_id: skinId,
    p_price: price,
  });
  if (error) {
    if (error.message.includes("already_owned")) return { error: "already_owned" };
    if (error.message.includes("insufficient")) return { error: "insufficient" };
    throw new Error("buy_failed: " + error.message);
  }
  return { balance: data as number };
}
