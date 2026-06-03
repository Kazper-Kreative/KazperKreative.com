"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

// Passwordless sign-in / sign-up for the Lab. Enter email → magic link.
// shouldCreateUser:true means a first-time email creates the account.
export default function LabLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setErr("");
    const e = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      setErr("Enter a valid email address.");
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setErr("Sign-in is unavailable right now.");
      return;
    }
    setBusy(true);
    const { error } = await sb.auth.signInWithOtp({
      email: e,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/lab`,
        shouldCreateUser: true,
      },
    });
    setBusy(false);
    if (error) {
      setErr(error.message || "Could not send the link. Try again.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="lock">
        <div className="lock-card">
          <img src="/assets/k-mark.png" alt="Kazper Kreative" />
          <h3>Check your email</h3>
          <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
            We sent a sign-in link to <b>{email}</b>. Open it on this device to enter the Lab.
          </p>
          <p className="mode-tag">Magic link · no password</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lock">
      <div
        className="lock-card"
        onKeyDown={(ev) => {
          if (ev.key === "Enter") void send();
        }}
      >
        <img src="/assets/k-mark.png" alt="Kazper Kreative" />
        <h3>The Lab</h3>
        <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
          Enter your email and we&rsquo;ll send a sign-in link. New here? It creates your account.
        </p>
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          autoComplete="email"
        />
        <button
          className="btn btn-fill"
          style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
          disabled={busy}
          onClick={() => void send()}
        >
          {busy ? "Sending…" : "Send sign-in link"}
        </button>
        <p className="lock-err">{err}</p>
        <p className="mode-tag">Private lab · members only</p>
      </div>
    </div>
  );
}
