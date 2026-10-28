import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Kazper's own Supabase project ("Kazper Mind", us-east-1), separate from the
// site's: his memory and the /kazper sign-in live there. Public anon key, safe
// to expose; RLS (is_kazper_owner) is what grants access. Server side is in
// ./supabase-server.ts.
export const KAZPER_SUPABASE_URL =
  process.env.NEXT_PUBLIC_KAZPER_SUPABASE_URL || "https://jvqxdnnnyoatgbqaebvt.supabase.co";
export const KAZPER_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_KAZPER_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cXhkbm5ueW9hdGdicWFlYnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNjM2MTYsImV4cCI6MjEwODczOTYxNn0.qmCDk5ks9ThXvhVywcbwebkThsSMqMKG4W33USejgZs";

let _client: SupabaseClient | null = null;

/** Browser client for /kazper (cookie-backed so the server sees the same session). Null on the server. */
export function getKazperSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!_client) _client = createBrowserClient(KAZPER_SUPABASE_URL, KAZPER_SUPABASE_ANON_KEY);
  return _client;
}
