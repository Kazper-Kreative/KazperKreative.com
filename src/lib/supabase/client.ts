import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public anon key — safe to expose; access is gated by Row Level Security.
// Reads from env first, falling back to the project's known public values so
// the site works out of the box (mirrors the static site's supabase-config.js).
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lenbcecnvjaylhigtlfl.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbmJjZWNudmpheWxoaWd0bGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTY2OTUsImV4cCI6MjA5NTkzMjY5NX0.ShfgNYlLAXicgIkJSTw0m6ZJXRbCLEdyIlPBBtl1yBg";

let _client: SupabaseClient | null = null;

/** True when valid (non-placeholder) Supabase credentials are present. */
export function isSupabaseConfigured(): boolean {
  return (
    !!SUPABASE_URL &&
    !!SUPABASE_ANON_KEY &&
    !/PASTE_/.test(SUPABASE_URL) &&
    !/PASTE_/.test(SUPABASE_ANON_KEY)
  );
}

/** Lazily-created browser Supabase client (or null when unconfigured). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}
