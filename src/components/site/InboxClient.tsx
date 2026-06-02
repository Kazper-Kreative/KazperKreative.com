"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { inbox, type Submission } from "@/lib/supabase/submissions";

// PIN is only used in the localStorage fallback (when Supabase isn't
// configured). With Supabase connected, login uses a real email + password.
const INBOX_PIN = "2604";

function fmt(ts: number) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    ", " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

export default function InboxClient() {
  const configured = inbox.configured();
  const [unlocked, setUnlocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState<Submission[]>([]);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);

  const render = useCallback(async () => {
    try {
      const data = await inbox.fetchAll();
      setItems(data);
      setLoadError("");
    } catch (e) {
      setLoadError((e as Error)?.message || "Could not load submissions.");
    }
  }, []);

  const showApp = useCallback(() => {
    setUnlocked(true);
    void render();
  }, [render]);

  // Auto-open if already authenticated / unlocked.
  useEffect(() => {
    (async () => {
      if (configured) {
        if (await inbox.hasSession()) showApp();
      } else if (sessionStorage.getItem("kk_inbox_ok") === "1") {
        showApp();
      }
    })();
  }, [configured, showApp]);

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
        showApp();
      } catch {
        fail("Could not sign in. Check your connection.");
      }
    } else {
      if (pinRef.current?.value === INBOX_PIN) {
        sessionStorage.setItem("kk_inbox_ok", "1");
        showApp();
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
    setItems([]);
    setOpenIds(new Set());
  };

  const toggle = async (m: Submission) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(m.id)) next.delete(m.id);
      else next.add(m.id);
      return next;
    });
    if (!openIds.has(m.id) && !m.read) {
      setItems((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, read: true } : x))
      );
      try {
        await inbox.setRead(m.id, true);
      } catch {
        /* ignore */
      }
    }
  };

  const remove = async (id: string) => {
    await inbox.remove(id);
    void render();
  };

  const clear = async () => {
    if (confirm("Delete ALL submissions? This cannot be undone.")) {
      await inbox.clear();
      void render();
    }
  };

  const unread = items.filter((m) => !m.read).length;
  const countLabel =
    `${items.length} ${items.length === 1 ? "message" : "messages"}` +
    (unread ? ` · ${unread} unread` : "");

  if (!unlocked) {
    return (
      <div className={`lock${shake ? " err" : ""}`} id="lock">
        <div className="lock-card">
          <img src="/assets/k-mark.png" alt="Kazper Kreative" />
          <h3>Private Inbox</h3>
          <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
            {configured
              ? "Sign in with your account to view submissions."
              : "Enter your passcode to view submissions."}
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
            Unlock
          </button>
          <p className="lock-err">{err}</p>
          <p className="mode-tag">
            {configured
              ? "Shared inbox · Supabase"
              : "This-browser only · connect Supabase for a shared inbox"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      <div className="ibx-top">
        <Link className="brand" href="/">
          <img src="/assets/k-mark.png" alt="" />
          <span>
            Kazper Kreative <span className="dim" style={{ fontWeight: 400 }}>· Inbox</span>
          </span>
        </Link>
        <div className="ibx-actions">
          <span className="ibx-count">{countLabel}</span>
          <button className="btn btn-ghost" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => void render()}>
            Refresh
          </button>
          <button className="btn btn-ghost" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => void clear()}>
            Clear all
          </button>
          <button className="btn btn-ghost" style={{ padding: "9px 14px", fontSize: 13 }} onClick={() => void lock()}>
            Lock
          </button>
        </div>
      </div>
      <div className="ibx-wrap">
        <div className="ibx-note">
          {configured
            ? "Live shared inbox — submissions from any visitor land here, visible only to you."
            : "Submissions are stored on this browser only. Connect Supabase (env vars) for a real shared inbox."}
        </div>
        <div id="list">
          {loadError ? (
            <div className="ibx-empty">
              Could not load submissions.
              <br />
              {loadError}
            </div>
          ) : items.length === 0 ? (
            <div className="ibx-empty">
              No submissions yet.
              <br />
              Contact and application forms land here.
            </div>
          ) : (
            items.map((m) => {
              const f = m.fields || {};
              const keys = Object.keys(f);
              const who = f.Name || f.name || (keys.length ? f[keys[0]] : "Unknown");
              const email = f.Email || f.email || "";
              const isOpen = openIds.has(m.id);
              return (
                <div className={`msg ${m.read ? "" : "unread"}`} key={m.id}>
                  <div className="msg-head" onClick={() => void toggle(m)}>
                    <span className="dotu"></span>
                    <span className="msg-type">{m.type}</span>
                    <span className="who">{who}</span>
                    {email && <span className="em">{email}</span>}
                    <span className="when">{fmt(m.ts)}</span>
                  </div>
                  {isOpen && (
                    <div className="msg-body">
                      <dl>
                        {keys.map((k) => (
                          <div key={k} style={{ display: "contents" }}>
                            <dt>{k}</dt>
                            <dd>{f[k]}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="msg-tools">
                        {email && (
                          <a className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 13 }} href={`mailto:${email}`}>
                            Reply
                          </a>
                        )}
                        <button
                          className="btn btn-ghost"
                          style={{ padding: "8px 14px", fontSize: 13 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            void remove(m.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
