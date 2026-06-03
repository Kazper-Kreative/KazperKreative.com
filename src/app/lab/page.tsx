import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Lab",
  robots: { index: false, follow: false },
};

// NOTE: kept fully visible (no [data-reveal]) — the hub renders inside the
// gated lab layout; simplest to not depend on scroll-reveal timing here.

const TOOLS = [
  {
    slug: "chess",
    glyph: "♞",
    name: "The Study",
    game: "Chess",
    desc: "Face a strength-capped Stockfish 18 while the same engine, at full power, grades every move you make and reveals the line you missed.",
    live: true,
  },
  {
    slug: "checkers",
    glyph: "⛂",
    name: "The Crossing",
    game: "Checkers",
    desc: "English draughts against a tuned alpha-beta engine that scores each move, calls out the blunders, and shows the capture you should have taken.",
    live: true,
  },
] as const;

const STEPS = [
  { n: "01", h: "Analyze", p: "A real engine evaluates the position you actually played — no canned lessons." },
  { n: "02", h: "Grade", p: "Every move is scored against the engine's best, from brilliant to blunder." },
  { n: "03", h: "Coach", p: "Plain-language reasons and the stronger line, surfaced the moment you move." },
  { n: "04", h: "Master", p: "Hints, take-backs, and rising difficulty turn the loop into real improvement." },
];

export default function LabPage() {
  return (
    <>
      <section className="section" style={{ paddingTop: "clamp(40px,7vw,84px)" }}>
        <div className="wrap">
          <span className="chip">
            <span className="dot"></span>The Lab · early access
          </span>
          <h1 style={{ margin: "18px 0 0", maxWidth: "16ch" }}>
            Train. Analyze. <span className="grad-text">Master.</span>
          </h1>
          <p className="lead" style={{ marginTop: 18 }}>
            Cutting-edge training tools where <strong>Kazper Kreative</strong>&rsquo;s craft meets{" "}
            <strong>Kazper&rsquo;s Echo</strong>&rsquo;s atmosphere — real engines, honest feedback, and
            a quiet, otherworldly place to get sharp.
          </p>
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">Tools</span>
          <div className="proj-grid" style={{ marginTop: 24 }}>
            {TOOLS.map((t) => (
              <div className="card path-card" key={t.slug}>
                <div className="path-ic" aria-hidden>
                  {t.glyph}
                </div>
                <h4 style={{ margin: 0 }}>
                  {t.name} <span className="dim" style={{ fontWeight: 400 }}>· {t.game}</span>
                </h4>
                <p className="dim" style={{ margin: 0 }}>
                  {t.desc}
                </p>
                <Link href={`/lab/${t.slug}`} className="card-link">
                  Enter <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
            <div className="card path-card" aria-disabled style={{ opacity: 0.6 }}>
              <div className="path-ic" aria-hidden>
                ✦
              </div>
              <h4 style={{ margin: 0 }}>
                In the forge <span className="dim" style={{ fontWeight: 400 }}>· soon</span>
              </h4>
              <p className="dim" style={{ margin: 0 }}>
                New disciplines, deeper analysis, and members-only access to the frontier training tech we&rsquo;re building next.
              </p>
              <span className="card-link" style={{ color: "var(--text-faint)", cursor: "default" }}>
                Coming soon
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">How it works</span>
          <div className="cap-grid g-4" style={{ marginTop: 24 }}>
            {STEPS.map((s) => (
              <div className="cap" key={s.n}>
                <span className="kicker no-line" style={{ fontSize: 12 }}>
                  {s.n}
                </span>
                <h4 style={{ margin: "12px 0 8px" }}>{s.h}</h4>
                <p className="dim" style={{ margin: 0 }}>
                  {s.p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap">
          <div className="cta-band">
            <span className="kicker">Early access</span>
            <h2>Built to be paid for — yours free while it&rsquo;s young.</h2>
            <p className="lead">
              The Lab is where we prototype cutting-edge training technology. Get in now, shape what we
              build, and keep your edge as it grows.
            </p>
            <div className="hero-actions">
              <Link href="/lab/chess" className="btn btn-primary">
                Open The Study
              </Link>
              <Link href="/lab/checkers" className="btn btn-ghost">
                Open The Crossing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
