import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase/client";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendSubmissionEmail } from "@/lib/email";

export const runtime = "nodejs";

const ALLOWED = new Set(["Contact", "Application", "Newsletter"]);

export async function POST(req: Request) {
  let body: {
    type?: string;
    fields?: Record<string, string>;
    token?: string;
    hp?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { type, fields, token, hp } = body;
  if (!type || !ALLOWED.has(type) || !fields || typeof fields !== "object") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot tripped — pretend success, store nothing.
  if (hp) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    return NextResponse.json({ error: "verification_failed" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("submissions").insert({ type, fields });
    if (error) {
      return NextResponse.json({ error: "store_failed" }, { status: 500 });
    }
  }

  // Best-effort notification; never blocks the response.
  await sendSubmissionEmail(type, fields);

  return NextResponse.json({ ok: true });
}
