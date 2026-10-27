// Server-side gate for /kazper. Kazper is private to its owner: a dedicated
// kazper_owners table (seeded by SQL only), deliberately separate from billing
// staff. RLS on the kazper_* tables uses the same is_kazper_owner() check, so
// the page and the database agree on who's allowed.
import { createSupabaseServer } from "@/lib/supabase/server";

export interface KazperOwner {
  userId: string | null;
  email: string | null;
  isOwner: boolean;
}

export async function getKazperOwner(): Promise<KazperOwner> {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { userId: null, email: null, isOwner: false };

  const { data } = await sb
    .from("kazper_owners")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? null, isOwner: !!data };
}
