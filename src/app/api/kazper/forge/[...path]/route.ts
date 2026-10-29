import { NextResponse } from "next/server";
import { getKazperOwner } from "@/lib/kazper/access";
import { callForge, forgeConfigured, forgeRouteAllowed } from "@/lib/kazper/forge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner-only proxy to Kazper's forge. Only the calls in forgeRouteAllowed exist; anything else 404s.
async function proxy(request: Request, params: Promise<{ path: string[] }>, method: "GET" | "POST") {
  const path = (await params).path.join("/");
  if (!forgeRouteAllowed(method, path)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { isOwner } = await getKazperOwner();
  if (!isOwner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!forgeConfigured()) {
    return NextResponse.json({ error: "The forge isn't connected (FORGE_URL / FORGE_API_SECRET)." }, { status: 503 });
  }

  const raw: unknown = method === "POST" ? await request.json().catch(() => ({})) : undefined;
  const body = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : undefined;
  try {
    const { status, data } = await callForge(method, path, { query: new URL(request.url).searchParams, body });
    return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the forge." }, { status: 502 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params, "GET");
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, params, "POST");
}
