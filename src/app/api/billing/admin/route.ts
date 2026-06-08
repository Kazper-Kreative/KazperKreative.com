import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getBillingIdentity, formatMoney } from "@/lib/billing/access";
import { sendInvoiceEmail } from "@/lib/email";

export const runtime = "nodejs";

// Staff-only billing actions. Writes go through the normal cookie session —
// the app_staff RLS policies authorize them (no service-role key needed here).
export async function POST(req: Request) {
  const id = await getBillingIdentity();
  if (!id.userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!id.isStaff) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const sb = await createSupabaseServer();
  const action = String(body.action || "");

  if (action === "createClient") {
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Client name is required." }, { status: 400 });
    const { data, error } = await sb
      .from("clients")
      .insert({
        name,
        contact_name: str(body.contactName),
        contact_email: lower(body.contactEmail),
        created_by: id.userId,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // auto-invite the contact email so they can see invoices on first login
    const email = lower(body.contactEmail);
    if (email) {
      await sb.from("client_invites").insert({ client_id: data.id, email, created_by: id.userId });
    }
    return NextResponse.json({ id: data.id });
  }

  if (action === "addInvite") {
    const clientId = String(body.clientId || "");
    const email = lower(body.email);
    if (!clientId || !email)
      return NextResponse.json({ error: "Client and email are required." }, { status: 400 });
    const { error } = await sb
      .from("client_invites")
      .insert({ client_id: clientId, email, created_by: id.userId });
    if (error && !/duplicate|unique/i.test(error.message))
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (action === "createInvoice") {
    const clientId = String(body.clientId || "");
    const title = String(body.title || "").trim();
    const amountDollars = Number(body.amountDollars);
    if (!clientId || !title)
      return NextResponse.json({ error: "Client and title are required." }, { status: 400 });
    if (!Number.isFinite(amountDollars) || amountDollars <= 0)
      return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });

    const number =
      "KK-" + new Date().getFullYear() + "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    const amountCents = Math.round(amountDollars * 100);
    const { data, error } = await sb
      .from("invoices")
      .insert({
        client_id: clientId,
        number,
        title,
        description: str(body.description),
        amount_cents: amountCents,
        currency: "usd",
        status: "sent",
        due_date: str(body.dueDate),
        created_by: id.userId,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // notify everyone with portal access to this client (best-effort)
    const { data: invites } = await sb
      .from("client_invites")
      .select("email")
      .eq("client_id", clientId);
    const recipients = (invites ?? []).map((r) => r.email).filter(Boolean);
    let emailed = 0;
    for (const to of recipients) {
      if (await sendInvoiceEmail(to, { title, amountLabel: formatMoney(amountCents), number })) emailed++;
    }
    return NextResponse.json({
      id: data.id,
      number,
      recipients: recipients.length,
      emailed,
    });
  }

  if (action === "voidInvoice") {
    const invoiceId = String(body.invoiceId || "");
    if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId." }, { status: 400 });
    const { error } = await sb.from("invoices").update({ status: "void" }).eq("id", invoiceId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

function str(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s || null;
}
function lower(v: unknown): string | null {
  const s = String(v ?? "").trim().toLowerCase();
  return s || null;
}
