import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createSupabaseService } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Stripe webhook — the authoritative settlement step. On checkout.session.completed
// we mark the matching invoice paid using the service-role client (clients can
// never write invoices). Requires STRIPE_WEBHOOK_SECRET + SUPABASE_SERVICE_ROLE_KEY.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  const raw = await req.text(); // raw body required for signature verification
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "invalid";
    return NextResponse.json({ error: `Bad signature: ${msg}` }, { status: 400 });
  }

  // Only checkout.session.* carries an invoice to settle. Cards settle
  // synchronously (completed → "paid"); ACH settles async (completed →
  // "processing", then async_payment_succeeded/failed days later).
  if (!event.type.startsWith("checkout.session.")) {
    return NextResponse.json({ received: true });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const invoiceId = session.metadata?.invoice_id;
  if (!invoiceId) return NextResponse.json({ received: true });

  const common = {
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
  };

  // Each transition declares the statuses it's allowed to move FROM. Applying
  // the update with `.in("status", from)` makes it idempotent (a duplicate
  // event no-ops) and prevents moving a paid/voided invoice backward or
  // settling out of order — no event-id table needed.
  let target: { fields: Record<string, unknown>; from: string[] } | null = null;
  if (event.type === "checkout.session.async_payment_succeeded") {
    target = { fields: { status: "paid", paid_at: new Date().toISOString(), ...common }, from: ["sent", "processing"] };
  } else if (event.type === "checkout.session.async_payment_failed") {
    target = { fields: { status: "sent", ...common }, from: ["processing"] }; // only an in-flight debit reverts
  } else if (event.type === "checkout.session.completed") {
    if (session.payment_status === "paid") {
      target = { fields: { status: "paid", paid_at: new Date().toISOString(), ...common }, from: ["sent", "processing"] };
    } else if (session.payment_status !== "unpaid" && session.payment_status !== "no_payment_required") {
      target = { fields: { status: "processing", ...common }, from: ["sent"] }; // ACH clearing
    }
  }
  if (!target) return NextResponse.json({ received: true }); // nothing collected

  const svc = createSupabaseService();
  if (!svc) {
    // We cannot settle without the service-role key. Fail LOUDLY (non-2xx) so
    // Stripe retries later rather than treating a charged-but-unsettled
    // payment as done.
    console.error("[billing webhook] settlement event but no service-role key:", invoiceId);
    return NextResponse.json({ error: "Settlement temporarily unavailable." }, { status: 500 });
  }

  const { error } = await svc
    .from("invoices")
    .update(target.fields)
    .eq("id", invoiceId)
    .in("status", target.from);
  if (error) {
    console.error("[billing webhook] settlement write failed:", error.message);
    return NextResponse.json({ error: "Settlement write failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
