// Email-on-new-submission via the Resend REST API (no SDK dependency).
// No-ops cleanly when RESEND_API_KEY / EMAIL_TO are not configured.

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Kazper Kreative <onboarding@resend.dev>";
const TO = process.env.EMAIL_TO;

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
