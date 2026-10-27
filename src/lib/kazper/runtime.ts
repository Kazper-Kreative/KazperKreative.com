// Server-only client for the Kazper runtime on Railway (kazper/kazper/api.py).
// The browser never talks to Railway: /api/kazper/* checks the owner session,
// then calls the runtime with the shared secret.

const RUNTIME_URL = process.env.KAZPER_RUNTIME_URL?.replace(/\/$/, "") ?? "";
const API_SECRET = process.env.KAZPER_API_SECRET ?? "";

export function runtimeConfigured(): boolean {
  return Boolean(RUNTIME_URL && API_SECRET);
}

export async function callRuntime(path: string, body: unknown): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${RUNTIME_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_SECRET}` },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
    // A turn can run several tool rounds; the route's maxDuration is the real ceiling.
    signal: AbortSignal.timeout(280_000),
  });
  const data = await res.json().catch(() => ({ error: `runtime returned ${res.status}` }));
  return { status: res.status, data };
}
