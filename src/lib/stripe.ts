// Server-side Stripe client. Lazily created and env-guarded so the app builds
// and runs even before Stripe keys exist — billing routes return 503 until set.
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // Pin the API version so webhook payload shapes stay stable across Stripe
  // dashboard changes (matches the stripe@18 SDK's pinned version).
  if (!_stripe) _stripe = new Stripe(key, { apiVersion: "2025-08-27.basil" });
  return _stripe;
}

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
