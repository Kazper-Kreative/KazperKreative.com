// Server-only client for Kazper's forge (forge/ in the private Kazper-Kreative/Dyvynyty repo; its own
// Railway project). The browser never talks to the forge: /api/kazper/forge/* checks the owner session,
// then calls it with the shared secret. FORGE_URL and FORGE_API_SECRET live only in Vercel's env.

const FORGE_URL = process.env.FORGE_URL?.replace(/\/$/, "") ?? "";
const FORGE_SECRET = process.env.FORGE_API_SECRET ?? "";

export function forgeConfigured(): boolean {
  return Boolean(FORGE_URL && FORGE_SECRET);
}

// The only forge calls the app may make. Job ids are the forge's own (e.g. 20261029-211112-8b14).
const ALLOWED: [string, RegExp][] = [
  ["GET", /^status$/],
  ["GET", /^jobs$/],
  ["POST", /^jobs$/],
  ["GET", /^jobs\/[\w-]+$/],
  ["GET", /^jobs\/[\w-]+\/logs$/],
  ["POST", /^jobs\/[\w-]+\/(stop|approve|deny)$/],
  ["POST", /^halt$/],
  ["GET", /^audit$/],
  ["GET", /^exam$/],
  ["POST", /^exam$/],
];
const QUERY_KEYS = ["limit", "job_id"];

export function forgeRouteAllowed(method: string, path: string): boolean {
  return ALLOWED.some(([m, re]) => m === method && re.test(path));
}

export async function callForge(
  method: "GET" | "POST",
  path: string,
  { query, body }: { query?: URLSearchParams; body?: Record<string, unknown> } = {},
): Promise<{ status: number; data: unknown }> {
  const qs = new URLSearchParams();
  for (const key of QUERY_KEYS) {
    const value = query?.get(key);
    if (value) qs.set(key, value);
  }
  const res = await fetch(`${FORGE_URL}/v1/${path}${qs.size ? `?${qs}` : ""}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${FORGE_SECRET}` },
    // Whatever the browser sends, every action is recorded as Mason's.
    body: method === "POST" ? JSON.stringify({ ...(body ?? {}), by: "mason" }) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const data = await res.json().catch(() => ({ error: `forge returned ${res.status}` }));
  return { status: res.status, data };
}

// Shapes the forge returns (forge/forge/jobs.py and api.py).
export type JobStatus =
  | "queued" | "running" | "pr_open" | "reviewing" | "merged" | "changes_requested" | "closed"
  | "awaiting_approval" | "done" | "failed" | "stopped" | "denied";

export interface ForgeJob {
  id: string;
  repo: string;
  task: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  branch: string;
  pr_url: string;
  summary: string;
  error: string;
  cost_usd: number;
  steps: number;
  gates: string[];
  approved_at: string;
  parent_id?: string;
  round?: number;
  review?: { verdict: "ship" | "fix"; reasons: string; lesson: string; at: string; model: string };
  merged_at?: string;
}

export interface ForgeStatus {
  halted: string | null;
  budget: { spent_usd: number; cap_usd: number; left_usd: number };
  queued: number;
  running: ForgeJob | null;
  instructor?: { mode: "every" | "sample" | "off"; clean_streak: number; goal: number; exam_passed: boolean;
    exam_score?: number | null; reviewed: number; setting: string };
}

export interface ExamStatus {
  running: { started_at: string; done: number; total: number; passed: number; cost_usd: number } | null;
  latest: { at: string; score: number; passed: boolean; cost_usd: number; model: string;
    tasks: { name: string; passed: boolean }[] } | null;
  pass_mark: number;
  tasks: number;
}

export interface AuditEntry {
  at: string;
  kind: string;
  job_id: string | null;
  detail: Record<string, unknown>;
}
