"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getKazperSupabase } from "@/lib/kazper/supabase";

// Owner sign-in for /kazper. One email carries both a link and a 6-digit code.
// The code is what makes sign-in work inside the installed apps (desktop shell,
// iOS home-screen app): a link would open the default browser and leave the
// session there, but a code typed here signs in *this* window.
export default function KazperLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setErr("");
    const e = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return setErr("Enter a valid email address.");
    const sb = getKazperSupabase();
    if (!sb) return setErr("Sign-in is unavailable right now.");
    setBusy(true);
    const { error } = await sb.auth.signInWithOtp({
      email: e,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/kazper")}`,
        shouldCreateUser: false, // Kazper never creates accounts
      },
    });
    setBusy(false);
    // Same message whether or not the address exists, so this can't be used to probe accounts.
    if (error && !/signups not allowed|not found/i.test(error.message)) return setErr(error.message);
    setStage("code");
  };

  const verify = async () => {
    setErr("");
    const token = code.replace(/\D/g, "");
    if (token.length < 6) return setErr("Enter the code from the email.");
    setBusy(true);
    const { error } = await getKazperSupabase()!.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    setBusy(false);
    if (error) return setErr("That code didn't work. Check it, or send a new one.");
    router.refresh();
  };

  return (
    <div className="lock">
      <div className="lock-card" onKeyDown={(ev) => ev.key === "Enter" && void (stage === "email" ? send() : verify())}>
        <img src="/assets/k-mark.png" alt="Kazper" />
        <h3>Kazper</h3>
        {stage === "email" ? (
          <>
            <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>Owner sign-in. We&apos;ll email you a code.</p>
            <input type="email" placeholder="you@email.com" value={email} autoComplete="email"
              onChange={(ev) => setEmail(ev.target.value)} />
            <button className="btn btn-fill" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
              disabled={busy} onClick={() => void send()}>
              {busy ? "Sending…" : "Send code"}
            </button>
          </>
        ) : (
          <>
            <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
              If <b>{email}</b> is Kazper&apos;s owner, a code is on its way. Enter it here.
            </p>
            <input className="pin" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" autoFocus
              value={code} onChange={(ev) => setCode(ev.target.value)} />
            <button className="btn btn-fill" style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
              disabled={busy} onClick={() => void verify()}>
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button className="kz-link" style={{ marginTop: 14 }} onClick={() => { setStage("email"); setCode(""); }}>
              Use a different email or resend
            </button>
          </>
        )}
        <p className="lock-err">{err}</p>
        <p className="mode-tag">Kazper · private</p>
      </div>
    </div>
  );
}
