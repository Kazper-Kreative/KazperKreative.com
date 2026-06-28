import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Magic-link / PKCE callback: exchanges the `code` for a session (sets cookies),
// then sends the user to their intended destination (default /lab).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/lab";
  // Only allow same-origin relative redirects. Must start with a single "/"
  // and NOT "//" or "/\" — those resolve to a protocol-relative absolute URL
  // (e.g. //evil.com), which would be an open redirect for phishing.
  const dest = /^\/(?![/\\])/.test(next) ? next : "/lab";

  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(dest, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/lab?auth_error=1", url.origin));
}
