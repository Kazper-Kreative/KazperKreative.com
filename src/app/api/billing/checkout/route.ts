import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Create a Stripe Checkout Session for one invoice and return its hosted URL.
// RLS guarantees the signed-in user can only read (and therefore pay) invoices
// belonging to a client their email is invited to.
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
  }

  let body: { invoiceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const invoiceId = String(body.invoiceId || "");
  if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId." }, { status: 400 });

  const sb = await createSupabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: inv } = await sb
    .from("invoices")
    .select("id,title,amount_cents,currency,status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (!inv) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  if (inv.status === "paid") return NextResponse.json({ error: "Already paid." }, { status: 409 });
  if (inv.status === "void") return NextResponse.json({ error: "Invoice voided." }, { status: 409 });

  const origin = new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: inv.currency || "usd",
          product_data: { name: inv.title || "Invoice" },
          unit_amount: inv.amount_cents,
        },
        quantity: 1,
      },
    ],
    metadata: { invoice_id: inv.id },
    customer_email: user.email ?? undefined,
    success_url: `${origin}/portal?paid=1`,
    cancel_url: `${origin}/portal`,
  });

  return NextResponse.json({ url: session.url });
}
