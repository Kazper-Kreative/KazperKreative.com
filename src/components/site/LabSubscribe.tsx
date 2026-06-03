"use client";

import { getSupabase } from "@/lib/supabase/client";

// Shown when a user is signed in but has no Lab entitlement. Phase 1: request
// access (the owner comps them). Phase 3 swaps the CTA for Stripe Checkout.
export default function LabSubscribe({ email }: { email: string | null }) {
  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    window.location.href = "/lab";
  };

  return (
    <div className="lock">
      <div className="lock-card">
        <img src="/assets/k-mark.png" alt="Kazper Kreative" />
        <h3>Lab access required</h3>
        <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
          You&rsquo;re signed in{email ? <> as <b>{email}</b></> : ""}, but this account doesn&rsquo;t
          have Lab access yet.
        </p>
        <a
          className="btn btn-fill"
          style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
          href="mailto:kazper@kazperkreative.com?subject=Lab%20access%20request"
        >
          Request access
        </a>
        <button
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
          onClick={() => void signOut()}
        >
          Sign out
        </button>
        <p className="mode-tag">Membership · subscription coming soon</p>
      </div>
    </div>
  );
}
