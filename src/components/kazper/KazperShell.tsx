"use client";

import Link from "next/link";
import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getKazperSupabase } from "@/lib/kazper/supabase";

const TABS = [
  { href: "/kazper", label: "Chat", icon: "💬" },
  { href: "/kazper/calendar", label: "Calendar", icon: "📅" },
  { href: "/kazper/memory", label: "Memory", icon: "🧠" },
  { href: "/kazper/history", label: "History", icon: "🗂️" },
  { href: "/kazper/stats", label: "Stats", icon: "📈" },
];

// Kazper's app chrome: top bar on desktop, bottom tab bar on phones (and in the
// installed PWA), so it feels like an app rather than a page of the website.
export default function KazperShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const active = (href: string) => (href === "/kazper" ? path === "/kazper" : path.startsWith(href));

  // After sign-out the server layout re-renders as the login screen.
  const signOut = async () => {
    const sb = getKazperSupabase();
    if (sb) await sb.auth.signOut();
    router.replace("/kazper");
    router.refresh();
  };

  return (
    <div className="kz-shell">
      <header className="kz-bar">
        <Link href="/kazper" className="kz-brand">
          <img src="/assets/k-mark.png" alt="" />
          <span>Kazper</span>
        </Link>
        <nav className="kz-tabs" aria-label="Kazper">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={`kz-tab${active(t.href) ? " on" : ""}`}>
              <span className="kz-tab-icon" aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </nav>
        {/* The installed app has no browser reload: this re-fetches the current tab's data. */}
        <button
          className="btn btn-ghost kz-refresh"
          onClick={() => startRefresh(() => router.refresh())}
          disabled={refreshing}
          aria-label="Refresh"
          title="Refresh"
        >
          <span className={refreshing ? "kz-spin" : undefined} aria-hidden>↻</span>
        </button>
        <button className="btn btn-ghost kz-signout" onClick={() => void signOut()}>
          Sign out
        </button>
      </header>
      <main className="kz-main">{children}</main>
    </div>
  );
}
