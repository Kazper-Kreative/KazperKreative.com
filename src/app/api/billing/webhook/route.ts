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

  // All three events carry a Checkout Session. Cards settle synchronously
  // (completed → payment_status "paid"); ACH settles asynchronously
  // (completed → "processing", then async_payment_succeeded/failed days later).
  if (event.type.startsWith("checkout.session.")) {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id;
    if (invoiceId) {
      const common = {
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      };

      let fields: Record<string, unknown> | null = null;
      if (event.type === "checkout.session.async_payment_succeeded") {
        fields = { status: "paid", paid_at: new Date().toISOString(), ...common };
      } else if (event.type === "checkout.session.async_payment_failed") {
        fields = { status: "sent", ...common }; // bank debit failed → payable again
      } else if (event.type === "checkout.session.completed") {
        if (session.payment_status === "paid") {
          fields = { status: "paid", paid_at: new Date().toISOString(), ...common };
        } else if (session.payment_status === "unpaid" || session.payment_status === "no_payment_required") {
          fields = null; // nothing collected yet
        } else {
          fields = { status: "processing", ...common }; // e.g. ACH clearing
        }
      }

      if (fields) {
        const svc = createSupabaseService();
        if (svc) await svc.from("invoices").update(fields).eq("id", invoiceId);
        else console.error("[billing webhook] settlement event but no service-role key:", invoiceId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
