import { NextResponse } from "next/server";
import { getKazperOwner } from "@/lib/kazper/access";
import { callRuntime, runtimeConfigured } from "@/lib/kazper/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Kazper may run several tool rounds (search history, read mail, …) before answering.
export const maxDuration = 300;

// Owner-only proxy to the Kazper runtime. Only these actions exist; anything else 404s.
const ACTIONS: Record<string, string> = {
  chat: "/v1/chat",
  brief: "/v1/brief",
  review: "/v1/review",
  feedback: "/v1/feedback",
};

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const path = ACTIONS[action];
  if (!path) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { isOwner } = await getKazperOwner();
  if (!isOwner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!runtimeConfigured()) {
    return NextResponse.json({ error: "Kazper's runtime isn't connected (KAZPER_RUNTIME_URL / KAZPER_API_SECRET)." },
      { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  try {
    const { status, data } = await callRuntime(path, body);
    return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "TimeoutError";
    return NextResponse.json(
      { error: timedOut ? "Kazper took too long to answer." : "Couldn't reach Kazper's runtime." },
      { status: 502 },
    );
  }
}
