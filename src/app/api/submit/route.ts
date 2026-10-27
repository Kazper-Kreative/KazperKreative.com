import { NextResponse } from "next/server";
import { createSupabaseServerAnon } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendSubmissionEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/validation";

export const runtime = "nodejs";

const ALLOWED = new Set(["Contact", "Application", "Newsletter"]);

// Abuse caps for this public endpoint: the real forms send ~10 short fields.
const MAX_FIELDS = 40;
const MAX_KEY_CHARS = 100;
const MAX_VALUE_CHARS = 10_000;

function fieldsWithinLimits(fields: Record<string, unknown>): boolean {
  const entries = Object.entries(fields);
  return (
    entries.length <= MAX_FIELDS &&
    entries.every(
      ([k, v]) => k.length <= MAX_KEY_CHARS && typeof v === "string" && v.length <= MAX_VALUE_CHARS,
    )
  );
}

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
  if (!type || !ALLOWED.has(type) || !fields || typeof fields !== "object" || Array.isArray(fields)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!fieldsWithinLimits(fields)) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  // Honeypot tripped — pretend success, store nothing.
  if (hp) return NextResponse.json({ ok: true });

  // Server-side email validation backstop (covers direct API posts).
  const email = fields.Email ?? fields.email;
  if (email !== undefined && !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    return NextResponse.json({ error: "verification_failed" }, { status: 400 });
  }

  const supabase = createSupabaseServerAnon();
  const { error } = await supabase.from("submissions").insert({ type, fields });
  if (error) {
    return NextResponse.json({ error: "store_failed" }, { status: 500 });
  }

  // Best-effort notification; never blocks the response.
  await sendSubmissionEmail(type, fields);

  return NextResponse.json({ ok: true });
}
