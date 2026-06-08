// Email via the Resend REST API (no SDK dependency).
// No-ops cleanly when RESEND_API_KEY / EMAIL_TO are not configured.

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Kazper Kreative <onboarding@resend.dev>";
const TO = process.env.EMAIL_TO;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://kazperkreative.com";

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)
  );
}

export async function sendSubmissionEmail(
  type: string,
  fields: Record<string, string>
): Promise<void> {
  if (!KEY || !TO) return;
  const rows = Object.entries(fields)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#65667A;font-family:monospace;text-transform:uppercase;font-size:12px;vertical-align:top">${esc(
          k
        )}</td><td style="padding:6px 12px;white-space:pre-wrap">${esc(v)}</td></tr>`
    )
    .join("");
  const html = `<div style="font-family:system-ui,sans-serif"><h2 style="margin:0 0 12px">New ${esc(
    type
  )} submission</h2><table style="border-collapse:collapse">${rows}</table></div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `New ${type} — Kazper Kreative`,
        html,
      }),
    });
  } catch {
    /* notifications are best-effort; never block the submission */
  }
}

// Notify a client that they have a new invoice, with a link to the portal.
// Returns true if an email was actually dispatched (KEY set + Resend accepted).
export async function sendInvoiceEmail(
  to: string,
  inv: { title: string; amountLabel: string; number?: string | null }
): Promise<boolean> {
  if (!KEY || !to) return false;
  const portal = `${SITE}/portal`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:480px">
    <h2 style="margin:0 0 6px">You have a new invoice</h2>
    ${inv.number ? `<p style="margin:0 0 6px;color:#65667A;font-family:monospace;font-size:12px">${esc(inv.number)}</p>` : ""}
    <p style="font-size:18px;margin:8px 0"><strong>${esc(inv.title)}</strong> — ${esc(inv.amountLabel)}</p>
    <p style="margin:18px 0"><a href="${portal}" style="background:#ff7a45;color:#0b0b0e;padding:11px 20px;border-radius:8px;text-decoration:none;font-weight:600">View &amp; pay invoice</a></p>
    <p style="color:#65667A;font-size:13px">Sign in at ${esc(portal)} with this email address to view and pay securely. — Kazper Kreative</p>
  </div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: `Invoice from Kazper Kreative — ${inv.title}`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
