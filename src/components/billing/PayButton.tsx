"use client";

import { useState } from "react";

// Starts Stripe Checkout for one invoice and redirects to the hosted payment page.
export default function PayButton({ invoiceId, label = "Pay now" }: { invoiceId: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pay = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setErr(data.error || "Couldn’t start checkout.");
        setBusy(false);
        return;
      }
      window.location.href = data.url; // Stripe-hosted checkout
    } catch {
      setErr("Network error — try again.");
      setBusy(false);
    }
  };

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button className="btn btn-fill" disabled={busy} onClick={() => void pay()}>
        {busy ? "Starting…" : label}
      </button>
      {err ? <span style={{ color: "var(--bad,#ff5d6c)", fontSize: 12 }}>{err}</span> : null}
    </span>
  );
}
