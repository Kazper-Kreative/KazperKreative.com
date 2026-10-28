// Server-side client for Kazper Mind (see ./supabase.ts), reading the owner's
// /kazper session from cookies. Server-only.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { KAZPER_SUPABASE_ANON_KEY, KAZPER_SUPABASE_URL } from "./supabase";

export async function createKazperServer() {
  const cookieStore = await cookies();
  return createServerClient(KAZPER_SUPABASE_URL, KAZPER_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Throws in a Server Component render (read-only cookies); the proxy refresh handles writes.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* ignore */
        }
      },
    },
  });
}
