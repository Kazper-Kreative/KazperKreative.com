import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "The Study · Chess",
  robots: { index: false, follow: false },
};

// "The Study" — chess as its own platform (not one of the arcade games).
// This is the mode hub; the board itself is the Play mode at /lab/chess/play.
const MODES = [
  { href: "/lab/chess/play", glyph: "♟", name: "Play", desc: "Stockfish 18 across strength tiers, or a friend online. Every move graded and coached, with a full post-game report.", live: true },
  { href: "/lab/chess/profile", glyph: "◈", name: "Profile", desc: "Your account, rating, and game history.", live: true },
  { href: "", glyph: "✦", name: "Puzzles", desc: "Tactics trainer — solve, rate, repeat.", live: false },
  { href: "", glyph: "◍", name: "Analysis", desc: "Step through any game with the engine's eval at every move.", live: false },
];

function ModeTile({ href, glyph, name, desc, live }: { href: string; glyph: string; name: string; desc: string; live: boolean }) {
  const inner = (
    <>
      <div className="path-ic" aria-hidden>{glyph}</div>
      <h4 style={{ margin: 0 }}>
        {name}{!live && <span className="dim" style={{ fontWeight: 400 }}> · soon</span>}
      </h4>
      <p className="dim" style={{ margin: 0 }}>{desc}</p>
      {live ? (
        <span className="card-link" style={{ marginTop: "auto" }}>Open <span aria-hidden>→</span></span>
      ) : (
        <span className="dim" style={{ marginTop: "auto", fontSize: 13 }}>Coming soon</span>
      )}
    </>
  );
  if (live) {
    return <Link href={href} className="card path-card" style={{ textDecoration: "none" }}>{inner}</Link>;
  }
  return <div className="card path-card" style={{ opacity: 0.6 }}>{inner}</div>;
}

export default async function StudyHomePage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  // Honour old/shared invite links that pointed at /lab/chess?room=… .
  const sp = await searchParams;
  if (typeof sp.room === "string" && sp.room) redirect(`/lab/chess/play?room=${encodeURIComponent(sp.room)}`);

  return (
    <>
      <section className="section" style={{ paddingTop: "clamp(40px,7vw,84px)" }}>
        <div className="wrap">
          <span className="chip"><span className="dot"></span>The Study · Chess</span>
          <h1 style={{ margin: "18px 0 0", maxWidth: "16ch" }}>
            Your <span className="grad-text">chess</span> home.
          </h1>
          <p className="lead" style={{ marginTop: 18, maxWidth: "60ch" }}>
            Real Stockfish 18, every move graded and explained, a full post-game report, and online play —
            a serious chess platform in Kazper&rsquo;s own flavor.
          </p>
          <div className="hero-actions" style={{ marginTop: 22 }}>
            <Link href="/lab/chess/play" className="btn btn-primary">Play now</Link>
            <Link href="/lab/chess/profile" className="btn btn-ghost">Your profile</Link>
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">Modes</span>
          <div className="proj-grid two" style={{ marginTop: 22 }}>
            {MODES.map((m) => <ModeTile key={m.name} {...m} />)}
          </div>
        </div>
      </section>
    </>
  );
}
