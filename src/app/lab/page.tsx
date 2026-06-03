import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Lab",
  robots: { index: false, follow: false },
};

// Fully visible (no [data-reveal]) — renders inside the gated lab layout.

const TRAINERS = [
  {
    slug: "chess",
    glyph: "♞",
    name: "The Study",
    game: "Chess",
    desc: "Strength-capped Stockfish 18 that grades every move and shows the line you missed. 1v1 online too.",
  },
  {
    slug: "checkers",
    glyph: "⛂",
    name: "The Crossing",
    game: "Checkers",
    desc: "A tuned draughts engine that scores each move and calls the blunders. 1v1 online too.",
  },
] as const;

const STEPS = [
  { n: "01", h: "Analyze", p: "A real engine evaluates the position you actually played." },
  { n: "02", h: "Grade", p: "Every move scored against the engine's best — brilliant to blunder." },
  { n: "03", h: "Coach", p: "Plain-language reasons and the stronger line, the moment you move." },
  { n: "04", h: "Master", p: "Hints, take-backs, rising difficulty — the loop that builds skill." },
];

const ARCADE = [
  { slug: "trine", glyph: "✕", name: "Trine", game: "Tic-Tac-Toe", tag: "Bot · 1v1", desc: "Three in a row against a flawless bot — or a friend." },
  { slug: "cascade", glyph: "◍", name: "Cascade", game: "Connect Four", tag: "Bot · 1v1", desc: "Drop four in a row. Alpha-beta bot or online duel." },
  { slug: "enclosure", glyph: "⊞", name: "Enclosure", game: "Dots & Boxes", tag: "Bot · 1v1", desc: "Close the most boxes. Mind the chains." },
  { slug: "bullseye", glyph: "◎", name: "Bullseye", game: "Darts", tag: "Bot · 1v1", desc: "501, double-or-nothing nerve. Throw against bot or friend." },
  { slug: "serpent", glyph: "∿", name: "Serpent", game: "Snake", tag: "Solo", desc: "Chase the lights, grow the glow, don't bite yourself." },
  { slug: "phosphor", glyph: "⬡", name: "Phosphor", game: "Maze", tag: "Solo", desc: "Light a path to the exit. Beat your best time." },
  { slug: "updraft", glyph: "▲", name: "Updraft", game: "Flappy", tag: "Solo", desc: "Tap to rise, thread the gaps, chase the high score." },
  { slug: "sapper", glyph: "✸", name: "Sapper", game: "Minesweeper", tag: "Solo", desc: "Sweep the field by logic alone. Three sizes." },
  { slug: "solitude", glyph: "♠", name: "Solitude", game: "Solitaire", tag: "Solo", desc: "Klondike, tap-to-move. Build the four suits home." },
] as const;

function Card({ slug, glyph, name, game, desc, tag }: { slug: string; glyph: string; name: string; game: string; desc: string; tag?: string }) {
  return (
    <div className="card path-card">
      <div className="path-ic" aria-hidden>{glyph}</div>
      <h4 style={{ margin: 0 }}>
        {name} <span className="dim" style={{ fontWeight: 400 }}>· {game}</span>
      </h4>
      <p className="dim" style={{ margin: 0 }}>{desc}</p>
      <Link href={`/lab/${slug}`} className="card-link" style={{ marginTop: "auto" }}>
        {tag ? <span className="dim" style={{ fontSize: 12, marginRight: "auto" }}>{tag}</span> : null}
        Enter <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

export default function LabPage() {
  return (
    <>
      <section className="section" style={{ paddingTop: "clamp(40px,7vw,84px)" }}>
        <div className="wrap">
          <span className="chip"><span className="dot"></span>The Lab · early access</span>
          <h1 style={{ margin: "18px 0 0", maxWidth: "18ch" }}>
            Train. Play. <span className="grad-text">Master.</span>
          </h1>
          <p className="lead" style={{ marginTop: 18 }}>
            Where <strong>Kazper Kreative</strong>&rsquo;s craft meets <strong>Kazper&rsquo;s Echo</strong>&rsquo;s
            atmosphere — engine-coached trainers and a ghostly arcade, all in our own flavor.
          </p>
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">Trainers</span>
          <p className="dim" style={{ margin: "8px 0 0", maxWidth: "60ch" }}>
            Real engines that analyze, grade, and coach — built to make you sharper.
          </p>
          <div className="proj-grid two" style={{ marginTop: 22 }}>
            {TRAINERS.map((t) => <Card key={t.slug} {...t} />)}
          </div>
          <div className="cap-grid g-4" style={{ marginTop: 22 }}>
            {STEPS.map((s) => (
              <div className="cap" key={s.n}>
                <span className="kicker no-line" style={{ fontSize: 12 }}>{s.n}</span>
                <h4 style={{ margin: "12px 0 8px" }}>{s.h}</h4>
                <p className="dim" style={{ margin: 0 }}>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">Arcade</span>
          <p className="dim" style={{ margin: "8px 0 0", maxWidth: "60ch" }}>
            Ghostly takes on the classics — quick to pick up, ours in flavor. Two-player games take a bot or a friend.
          </p>
          <div className="proj-grid" style={{ marginTop: 22 }}>
            {ARCADE.map((g) => <Card key={g.slug} {...g} />)}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap">
          <div className="cta-band">
            <span className="kicker">Early access</span>
            <h2>More in the forge.</h2>
            <p className="lead">New tools, new games, deeper analysis — the Lab keeps growing. You&rsquo;re early.</p>
            <div className="hero-actions">
              <Link href="/lab/chess" className="btn btn-primary">Open The Study</Link>
              <Link href="/lab/serpent" className="btn btn-ghost">Play Serpent</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
