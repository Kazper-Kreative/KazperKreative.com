"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AdminClient {
  id: string;
  name: string;
  contact_email: string | null;
}

type Result = Record<string, unknown> | null;

// Staff console: create clients, invite client emails, and issue invoices.
// All actions POST to /api/billing/admin (staff-gated + RLS-authorized).
export default function AdminBilling({ clients }: { clients: AdminClient[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  // per-form feedback so the confirmation appears right at the button you used
  const [fb, setFb] = useState<{ where: string; ok: boolean; text: string } | null>(null);

  // new client
  const [cName, setCName] = useState("");
  const [cContact, setCContact] = useState("");
  const [cEmail, setCEmail] = useState("");
  // new invoice
  const [iClient, setIClient] = useState(clients[0]?.id || "");
  const [iTitle, setITitle] = useState("");
  const [iAmount, setIAmount] = useState("");
  const [iDue, setIDue] = useState("");
  const [iDesc, setIDesc] = useState("");
  // invite
  const [vClient, setVClient] = useState(clients[0]?.id || "");
  const [vEmail, setVEmail] = useState("");

  const post = async (where: string, payload: Record<string, unknown>): Promise<Result> => {
    setFb(null);
    setBusy(true);
    try {
      const res = await fetch("/api/billing/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setBusy(false);
      if (!res.ok) {
        setFb({ where, ok: false, text: data.error || "Something went wrong." });
        return null;
      }
      router.refresh();
      return data;
    } catch {
      setBusy(false);
      setFb({ where, ok: false, text: "Network error — try again." });
      return null;
    }
  };

  const Feedback = ({ where }: { where: string }) =>
    fb && fb.where === where ? (
      <p style={{ margin: "8px 0 0", fontSize: 13, color: fb.ok ? "var(--good,#39d98a)" : "var(--bad,#ff5d6c)" }}>
        {fb.text}
      </p>
    ) : null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* New client */}
      <div className="card" style={{ padding: "clamp(18px,3vw,24px)" }}>
        <span className="kicker no-line" style={{ fontSize: 12 }}>New client</span>
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input placeholder="Client / company name" value={cName} onChange={(e) => setCName(e.target.value)} />
          <input placeholder="Contact name (optional)" value={cContact} onChange={(e) => setCContact(e.target.value)} />
          <input placeholder="Contact email (gets portal access)" value={cEmail} onChange={(e) => setCEmail(e.target.value)} />
          <button
            className="btn btn-fill"
            disabled={busy || !cName.trim()}
            onClick={async () => {
              const r = await post("client", { action: "createClient", name: cName, contactName: cContact, contactEmail: cEmail });
              if (r) {
                setFb({ where: "client", ok: true, text: `Created "${cName.trim()}".${cEmail.trim() ? " Contact invited to the portal." : ""}` });
                setCName(""); setCContact(""); setCEmail("");
              }
            }}
          >
            {busy ? "Working…" : "Create client"}
          </button>
          <Feedback where="client" />
        </div>
      </div>

      {/* New invoice */}
      <div className="card" style={{ padding: "clamp(18px,3vw,24px)" }}>
        <span className="kicker no-line" style={{ fontSize: 12 }}>New invoice</span>
        {clients.length === 0 ? (
          <p className="dim" style={{ marginTop: 12, marginBottom: 0 }}>Create a client first.</p>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <select value={iClient} onChange={(e) => setIClient(e.target.value)}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Title (e.g. June retainer)" value={iTitle} onChange={(e) => setITitle(e.target.value)} />
            <input placeholder="Amount in USD (e.g. 4000)" inputMode="decimal" value={iAmount} onChange={(e) => setIAmount(e.target.value)} />
            <input type="date" value={iDue} onChange={(e) => setIDue(e.target.value)} aria-label="Due date" />
            <input placeholder="Description (optional)" value={iDesc} onChange={(e) => setIDesc(e.target.value)} />
            <button
              className="btn btn-fill"
              disabled={busy || !iClient || !iTitle.trim() || !iAmount}
              onClick={async () => {
                const r = await post("invoice", { action: "createInvoice", clientId: iClient, title: iTitle, amountDollars: iAmount, dueDate: iDue, description: iDesc });
                if (r) {
                  const recips = Number(r.recipients || 0);
                  const emailed = Number(r.emailed || 0);
                  const note =
                    recips === 0 ? "no client email on file — share the /portal link"
                    : emailed > 0 ? `emailed ${emailed} contact${emailed === 1 ? "" : "s"}`
                    : "client not emailed (set RESEND_API_KEY to auto-notify)";
                  setFb({ where: "invoice", ok: true, text: `Invoice created and visible in their portal — ${note}.` });
                  setITitle(""); setIAmount(""); setIDue(""); setIDesc("");
                }
              }}
            >
              {busy ? "Working…" : "Create invoice"}
            </button>
            <Feedback where="invoice" />
          </div>
        )}
      </div>

      {/* Invite a client email */}
      <div className="card" style={{ padding: "clamp(18px,3vw,24px)" }}>
        <span className="kicker no-line" style={{ fontSize: 12 }}>Invite a client email</span>
        <p className="dim" style={{ margin: "6px 0 0", fontSize: 13 }}>
          Anyone who signs in with this email sees that client’s invoices.
        </p>
        {clients.length === 0 ? null : (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <select value={vClient} onChange={(e) => setVClient(e.target.value)}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="email@client.com" value={vEmail} onChange={(e) => setVEmail(e.target.value)} />
            <button
              className="btn"
              disabled={busy || !vClient || !vEmail.trim()}
              onClick={async () => {
                const r = await post("invite", { action: "addInvite", clientId: vClient, email: vEmail });
                if (r) {
                  setFb({ where: "invite", ok: true, text: `${vEmail.trim()} now has portal access.` });
                  setVEmail("");
                }
              }}
            >
              {busy ? "Working…" : "Add access"}
            </button>
            <Feedback where="invite" />
          </div>
        )}
      </div>
    </div>
  );
}
