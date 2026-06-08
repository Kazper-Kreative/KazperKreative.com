import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/billing/access";
import AdminBilling, { type AdminClient } from "@/components/billing/AdminBilling";

export const dynamic = "force-dynamic";

interface AdminInvoice {
  id: string;
  number: string | null;
  title: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
  clients: { name: string } | { name: string }[] | null;
}

const clientName = (c: AdminInvoice["clients"]): string =>
  Array.isArray(c) ? c[0]?.name ?? "—" : c?.name ?? "—";

export default async function AdminBillingPage() {
  const sb = await createSupabaseServer();
  const [clientsRes, invoicesRes] = await Promise.all([
    sb.from("clients").select("id,name,contact_email").order("created_at", { ascending: false }),
    sb
      .from("invoices")
      .select("id,number,title,amount_cents,currency,status,created_at,clients(name)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  const clients = (clientsRes.data ?? []) as AdminClient[];
  const invoices = (invoicesRes.data ?? []) as unknown as AdminInvoice[];

  return (
    <section className="section" style={{ paddingTop: "clamp(40px,7vw,84px)" }}>
      <div className="wrap" style={{ maxWidth: 880 }}>
        <span className="kicker no-line" style={{ fontSize: 12 }}>Kazper Kreative · Admin</span>
        <h1 style={{ margin: "10px 0 0" }}>
          Billing <span className="grad-text">console</span>
        </h1>
        <p className="dim" style={{ marginTop: 8 }}>
          Create clients, grant portal access by email, and issue invoices. Clients pay at{" "}
          <Link href="/portal" className="card-link" style={{ display: "inline-flex" }}>/portal</Link>.
        </p>

        <div style={{ display: "grid", gap: 22, marginTop: 22, gridTemplateColumns: "minmax(0,1fr)" }}>
          <AdminBilling clients={clients} />

          <div className="card" style={{ padding: "clamp(18px,3vw,24px)" }}>
            <span className="kicker no-line" style={{ fontSize: 12 }}>Recent invoices</span>
            {invoices.length === 0 ? (
              <p className="dim" style={{ marginTop: 12, marginBottom: 0 }}>No invoices yet.</p>
            ) : (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {invoices.map((inv, i) => (
                  <div
                    key={inv.id}
                    style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, padding: "8px 0", borderTop: i ? "1px solid var(--panel-edge,#222)" : "none" }}
                  >
                    <span style={{ minWidth: 0, flex: "1 1 auto" }}>
                      <strong>{inv.title}</strong>
                      <span className="dim"> · {clientName(inv.clients)}</span>
                    </span>
                    <span className="dim" style={{ textTransform: "uppercase", fontSize: 11, letterSpacing: ".04em" }}>{inv.status}</span>
                    <strong style={{ minWidth: 90, textAlign: "right" }}>{formatMoney(inv.amount_cents, inv.currency)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
