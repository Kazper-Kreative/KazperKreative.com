"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { inbox } from "@/lib/supabase/submissions";

// Same soft gate as /inbox: with Supabase configured, sign in with the owner
// account; otherwise a local passcode. The session is shared with the inbox,
// so unlocking either one unlocks the other in this browser.
const GATE_PIN = "2604";

export default function LabChessClient() {
  const configured = inbox.configured();
  const [unlocked, setUnlocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [err, setErr] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  // Auto-open if already authenticated / unlocked (shared with the inbox).
  useEffect(() => {
    (async () => {
      if (configured) {
        if (await inbox.hasSession()) setUnlocked(true);
      } else if (sessionStorage.getItem("kk_inbox_ok") === "1") {
        setUnlocked(true);
      }
    })();
  }, [configured]);

  const fail = (msg: string) => {
    setErr(msg);
    setShake(true);
    window.setTimeout(() => setShake(false), 450);
  };

  const unlock = async () => {
    setErr("");
    if (configured) {
      const email = emailRef.current?.value.trim() || "";
      const pw = pwRef.current?.value || "";
      try {
        const r = await inbox.signIn(email, pw);
        if ((r as { error?: unknown }).error) {
          fail("Incorrect email or password.");
          return;
        }
        setUnlocked(true);
      } catch {
        fail("Could not sign in. Check your connection.");
      }
    } else {
      if (pinRef.current?.value === GATE_PIN) {
        sessionStorage.setItem("kk_inbox_ok", "1");
        setUnlocked(true);
      } else {
        fail("Wrong passcode.");
        if (pinRef.current) pinRef.current.value = "";
      }
    }
  };

  const lock = async () => {
    if (configured) {
      try {
        await inbox.signOut();
      } catch {
        /* ignore */
      }
    } else {
      sessionStorage.removeItem("kk_inbox_ok");
    }
    setUnlocked(false);
  };

  if (!unlocked) {
    return (
      <div className={`lock${shake ? " err" : ""}`} id="lock">
        <div className="lock-card">
          <img src="/assets/k-mark.png" alt="Kazper Kreative" />
          <h3>The Study</h3>
          <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
            {configured
              ? "Sign in with your account to enter the lab."
              : "Enter your passcode to enter the lab."}
          </p>
          <div
            onKeyDown={(e) => {
              if (e.key === "Enter") void unlock();
            }}
          >
            {configured ? (
              <>
                <input ref={emailRef} type="email" placeholder="email" autoComplete="username" />
                <input ref={pwRef} type="password" placeholder="password" autoComplete="current-password" />
              </>
            ) : (
              <input
                ref={pinRef}
                className="pin"
                type="password"
                inputMode="numeric"
                placeholder="passcode"
                autoComplete="off"
              />
            )}
          </div>
          <button
            className="btn btn-fill"
            style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
            onClick={() => void unlock()}
          >
            Enter
          </button>
          <p className="lock-err">{err}</p>
          <p className="mode-tag">
            {configured ? "Private lab · Stockfish 18" : "This-browser only · connect Supabase for the shared gate"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "var(--ink)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid var(--line)",
          flex: "0 0 auto",
        }}
      >
        <Link
          href="/"
          className="brand"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 600 }}
        >
          <img src="/assets/k-mark.png" alt="" style={{ width: 26, height: 26, borderRadius: 6 }} />
          <span>
            Kazper Kreative <span className="dim" style={{ fontWeight: 400 }}>· The Study</span>
          </span>
        </Link>
        <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }} onClick={() => void lock()}>
          Lock
        </button>
      </div>
      <iframe
        src="/lab/chess/app.html"
        title="The Study — Stockfish chess trainer"
        style={{ flex: "1 1 auto", width: "100%", border: 0 }}
      />
    </div>
  );
}
