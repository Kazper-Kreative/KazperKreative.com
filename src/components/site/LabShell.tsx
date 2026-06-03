"use client";

import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";

const LAB_BAR_H = 56;

// Lab chrome for entitled members: slim sticky top bar + the page content.
// (Replaces the old client LabGate; gating now happens server-side in the layout.)
export default function LabShell({ children }: { children: React.ReactNode }) {
  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="lab-shell" style={{ ["--lab-bar" as string]: `${LAB_BAR_H}px` }}>
      <header className="lab-bar">
        <Link href="/lab" className="brand">
          <img src="/assets/k-mark.png" alt="" />
          <span className="lab-brand-full">
            Kazper Kreative <span className="dim" style={{ fontWeight: 400 }}>· The Lab</span>
          </span>
          <span className="lab-brand-short">The Lab</span>
        </Link>
        <div className="lab-bar-actions">
          <Link className="btn btn-ghost lab-bar-btn" href="/">
            Exit
          </Link>
          <button className="btn btn-ghost lab-bar-btn" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </header>
      <main className="lab-main">{children}</main>
    </div>
  );
}
