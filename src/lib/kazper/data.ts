// Server-side reads for the /kazper app. They go through the owner's cookie
// session, so RLS (is_kazper_owner) is what actually grants access.
import { createKazperServer } from "@/lib/kazper/supabase-server";

export interface Exchange {
  id: number;
  created_at: string;
  kind: "chat" | "briefing" | "review";
  channel: "discord" | "web";
  user_text: string;
  reply_text: string;
  cost_usd: number | null;
}

export interface Fact {
  id: number;
  created_at: string;
  text: string;
  source: "owner" | "kazper";
}

export interface Pointer {
  id: number;
  created_at: string;
  text: string;
  exchange_id: number | null;
}

export interface ActionRow {
  id: number;
  created_at: string;
  kind: string;
  status: "done" | "undone" | "proposed" | "approved" | "rejected" | "failed";
  summary: string;
  destination: string | null;
}

const EXCHANGE_FIELDS = "id,created_at,kind,channel,user_text,reply_text,cost_usd";
const DATASET_GOAL = 500;

/** The newest `limit` exchanges, oldest first (chat order). */
export async function recentExchanges(limit = 40): Promise<Exchange[]> {
  const sb = await createKazperServer();
  const { data } = await sb.from("kazper_exchanges").select(EXCHANGE_FIELDS).order("id", { ascending: false }).limit(limit);
  return ((data ?? []) as Exchange[]).reverse();
}

export async function searchExchanges(q: string, beforeId?: number, limit = 25): Promise<Exchange[]> {
  const sb = await createKazperServer();
  let query = sb.from("kazper_exchanges").select(EXCHANGE_FIELDS).order("id", { ascending: false }).limit(limit);
  if (q.trim()) query = query.textSearch("search", q.trim(), { type: "websearch", config: "english" });
  if (beforeId) query = query.lt("id", beforeId);
  const { data } = await query;
  return (data ?? []) as Exchange[];
}

export async function memory(): Promise<{ facts: Fact[]; pointers: Pointer[] }> {
  const sb = await createKazperServer();
  const [facts, pointers] = await Promise.all([
    sb.from("kazper_facts").select("id,created_at,text,source").order("id"),
    sb.from("kazper_pointers").select("id,created_at,text,exchange_id").order("id", { ascending: false }),
  ]);
  return { facts: (facts.data ?? []) as Fact[], pointers: (pointers.data ?? []) as Pointer[] };
}

export interface Stats {
  cost7d: number;
  cost30d: number;
  replies30d: number;
  avgCost: number | null;
  exchanges: number;
  web: number;
  discord: number;
  facts: number;
  notes: number;
  pointers: number;
  good: number;
  bad: number;
  corrections: number;
  redirects: number;
  datasetGoal: number;
  daily: { day: string; cost: number; replies: number }[];
}

export async function stats(): Promise<Stats> {
  const sb = await createKazperServer();
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const count = async (table: string, filter?: [string, string]) => {
    let q = sb.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return (await q).count ?? 0;
  };
  const [rows, exchanges, web, facts, notes, pointers, good, bad, corrections, redirects] = await Promise.all([
    sb.from("kazper_exchanges").select("created_at,cost_usd").gte("created_at", since30),
    count("kazper_exchanges"),
    count("kazper_exchanges", ["channel", "web"]),
    count("kazper_facts", ["source", "owner"]),
    count("kazper_facts", ["source", "kazper"]),
    count("kazper_pointers"),
    count("kazper_feedback", ["kind", "good"]),
    count("kazper_feedback", ["kind", "bad"]),
    count("kazper_feedback", ["kind", "correction"]),
    count("kazper_feedback", ["kind", "redirect"]),
  ]);

  const costRows = (rows.data ?? []) as { created_at: string; cost_usd: number | string | null }[];
  const priced = costRows.filter((r) => r.cost_usd !== null).map((r) => Number(r.cost_usd));
  const byDay = new Map<string, { cost: number; replies: number }>();
  for (const r of costRows) {
    const day = r.created_at.slice(0, 10);
    const d = byDay.get(day) ?? { cost: 0, replies: 0 };
    d.cost += Number(r.cost_usd ?? 0);
    d.replies += 1;
    byDay.set(day, d);
  }

  return {
    cost7d: costRows.filter((r) => r.created_at >= since7).reduce((s, r) => s + Number(r.cost_usd ?? 0), 0),
    cost30d: priced.reduce((s, c) => s + c, 0),
    replies30d: costRows.length,
    avgCost: priced.length ? priced.reduce((s, c) => s + c, 0) / priced.length : null,
    exchanges,
    web,
    discord: exchanges - web,
    facts,
    notes,
    pointers,
    good,
    bad,
    corrections,
    redirects,
    datasetGoal: DATASET_GOAL,
    daily: [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, d]) => ({ day, ...d })),
  };
}

/** Kazper's most recent calendar changes, newest first. */
export async function recentActions(limit = 12): Promise<ActionRow[]> {
  const sb = await createKazperServer();
  const { data } = await sb
    .from("kazper_actions")
    .select("id,created_at,kind,status,summary,destination")
    .or("kind.like.deadline.*,kind.like.calendar.*")
    .order("id", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActionRow[];
}

export function usd(x: number): string {
  return x >= 1 ? `$${x.toFixed(2)}` : `$${x.toFixed(4)}`;
}
