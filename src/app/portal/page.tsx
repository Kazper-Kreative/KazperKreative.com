import { createSupabaseServer } from "@/lib/supabase/server";
import { getBillingIdentity, formatMoney, type InvoiceRow } from "@/lib/billing/access";
import PayButton from "@/components/billing/PayButton";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  paid: "var(--good,#39d98a)",
  sent: "var(--accent,#ff7a45)",
  draft: "var(--dim,#9aa)",
  void: "var(--dim,#9aa)",
};
const STATUS_LABEL: Record<string, string> = {
  paid: "Paid", sent: "Due", draft: "Draft", void: "Void",
};

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const sp = await searchParams;
  const { email } = await getBillingIdentity();
  const sb = await createSupabaseServer();
  const { data } = await sb
    .from("invoices")
    .select(
      "id,client_id,number,title,description,amount_cents,currency,status,due_date,paid_at,created_at"
    )
    .order("created_at", { ascending: false });
  const invoices = (data ?? []) as InvoiceRow[];
  const outstanding = invoices.filter((i) => i.status === "sent");
  const totalDue = outstanding.reduce((s, i) => s + i.amount_cents, 0);
  const currency = invoices[0]?.currency || "usd";

  return (
    <section className="section" style={{ paddingTop: "clamp(40px,7vw,84px)" }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <span className="kicker no-line" style={{ fontSize: 12 }}>Kazper Kreative</span>
        <h1 style={{ margin: "10px 0 0" }}>
          Your <span className="grad-text">invoices</span>
        </h1>
        <p className="dim" style={{ marginTop: 8 }}>
          Signed in as {email}. Pay securely by card — receipts are emailed by Stripe.
        </p>

        {sp.paid ? (
          <div
            className="card"
            style={{ marginTop: 18, padding: "16px 18px", borderColor: "var(--good,#39d98a)" }}
          >
            <strong style={{ color: "var(--good,#39d98a)" }}>Payment received</strong>
            <p className="dim" style={{ margin: "4px 0 0", fontSize: 14 }}>
              Thank you — it’ll show as Paid below once Stripe confirms (usually seconds).
            </p>
          </div>
        ) : null}

        {outstanding.length > 0 && (
          <div className="card" style={{ marginTop: 18, padding: "clamp(18px,4vw,26px)" }}>
            <span className="kicker no-line" style={{ fontSize: 11 }}>Outstanding balance</span>
            <h2 className="grad-text" style={{ margin: "8px 0 0" }}>{formatMoney(totalDue, currency)}</h2>
            <p className="dim" style={{ margin: "4px 0 0", fontSize: 14 }}>
              Across {outstanding.length} open invoice{outstanding.length === 1 ? "" : "s"}.
            </p>
          </div>
        )}

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          {invoices.length === 0 ? (
            <div className="card" style={{ padding: "clamp(20px,4vw,28px)" }}>
              <p className="dim" style={{ margin: 0 }}>
                No invoices yet. When Kazper Kreative bills your account, it’ll appear here.
              </p>
            </div>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="card"
                style={{ padding: "clamp(16px,3.5vw,22px)", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
              >
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <strong>{inv.title}</strong>
                    <span style={{ color: STATUS_TONE[inv.status], fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>
                      {STATUS_LABEL[inv.status] || inv.status}
                    </span>
                  </div>
                  <p className="dim" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    {inv.number ? inv.number + " · " : ""}
                    {inv.due_date ? `Due ${inv.due_date}` : "No due date"}
                    {inv.description ? ` · ${inv.description}` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <strong style={{ fontSize: 18 }}>{formatMoney(inv.amount_cents, inv.currency)}</strong>
                  {inv.status === "sent" ? <PayButton invoiceId={inv.id} /> : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
