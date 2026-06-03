import type { Metadata } from "next";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/components/site/nav";

// Public, indexable "link in bio" — the one link to drop in social profiles.
// Standalone (no site chrome), like /inbox, but public. Background + fonts come
// from the root layout / globals.css.
export const metadata: Metadata = {
  title: "Kazper Kreative — start here",
  description:
    "Creative agency × game studio. Explore our work, start a project, join the network, and follow Kazper Kreative everywhere.",
  alternates: { canonical: "/hub" },
};

const DESTINATIONS: { href: string; label: string; sub: string; variant?: "primary" | "feature" }[] = [
  { href: "/contact", label: "Start a project", sub: "Tell us what you're building", variant: "primary" },
  { href: "/join", label: "Join the network", sub: "For artists, devs & creators" },
  { href: "/agency", label: "The Agency", sub: "Unreal Engine · real-time 3D · brand · web" },
  { href: "/studio", label: "Kazper's Echo", sub: "Our in-house game studio" },
  { href: "/work", label: "Our Work", sub: "Projects & case studies" },
  { href: "/lab", label: "Enter The Lab", sub: "Engine-powered training · early access", variant: "feature" },
];

export default function HubPage() {
  return (
    <main className="hub">
      <div className="hub-inner">
        <span className="hub-avatar">
          <img src="/assets/k-mark.png" alt="Kazper Kreative" />
        </span>
        <h1 className="hub-name">Kazper Kreative</h1>
        <p className="hub-tag">
          Creative agency × game studio. Unreal Engine, real-time 3D, brand &amp; web — and{" "}
          <strong>Kazper&rsquo;s Echo</strong>, our in-house studio.
        </p>

        <div className="hub-stack">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className={`hub-link${d.variant ? ` ${d.variant}` : ""}`}
            >
              <span>{d.label}</span>
              <span className="sub">{d.sub}</span>
            </Link>
          ))}
        </div>

        <div className="hub-divider">Follow</div>
        <div className="hub-socials">
          {SOCIAL_LINKS.map((s) => (
            <a key={s.href} className="hub-social" href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>

        <p className="hub-foot">
          <Link href="/">kazperkreative.com →</Link>
        </p>
      </div>
    </main>
  );
}
