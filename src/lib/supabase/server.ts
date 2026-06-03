// Server-side Supabase clients (cookie-based SSR auth + service role + anon).
// Browser client lives in ./client.ts. This module is server-only.

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isEntitled, type LabMember } from "@/lib/lab/access";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://lenbcecnvjaylhigtlfl.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbmJjZWNudmpheWxoaWd0bGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTY2OTUsImV4cCI6MjA5NTkzMjY5NX0.ShfgNYlLAXicgIkJSTw0m6ZJXRbCLEdyIlPBBtl1yBg";

/** Cookie-aware server client (reads the signed-in user in RSC / route handlers). */
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Throws in a Server Component render (read-only cookies) — the
        // middleware refresh handles writes, so swallow it here.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* ignore */
        }
      },
    },
  });
}

/** Plain anon client for server-side anon work (e.g. the /api/submit insert). */
export function createSupabaseServerAnon() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Service-role client (bypasses RLS) for admin grants + the Stripe webhook.
 *  Returns null when SUPABASE_SERVICE_ROLE_KEY isn't set (degrades gracefully). */
export function createSupabaseService() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface LabAccess {
  userId: string | null;
  email: string | null;
  entitled: boolean;
  member: LabMember | null;
}

/** Resolve the current user's Lab entitlement (server-side). */
export async function getLabAccess(): Promise<LabAccess> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, email: null, entitled: false, member: null };

  const { data } = await supabase
    .from("lab_members")
    .select("status,current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    entitled: isEntitled(data),
    member: data ?? null,
  };
}
