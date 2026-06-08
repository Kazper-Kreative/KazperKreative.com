// Server-side billing identity. Mirrors getLabAccess() in shape: resolve who the
// signed-in user is and whether they're Kazper staff (admin). Client access to
// invoices is enforced by RLS via their email, so we don't need to resolve
// client links here — the portal just reads invoices (RLS scopes them).
import { createSupabaseServer } from "@/lib/supabase/server";

export interface BillingIdentity {
  userId: string | null;
  email: string | null;
  isStaff: boolean;
}

export async function getBillingIdentity(): Promise<BillingIdentity> {
  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { userId: null, email: null, isStaff: false };

  const { data } = await sb
    .from("app_staff")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? null, isStaff: !!data };
}

export interface InvoiceRow {
  id: string;
  client_id: string;
  number: string | null;
  title: string;
  description: string | null;
  amount_cents: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "void";
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export function formatMoney(cents: number, currency = "usd"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}
