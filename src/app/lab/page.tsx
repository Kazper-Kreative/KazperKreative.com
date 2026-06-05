import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Lab",
  robots: { index: false, follow: false },
};

// Fully visible (no [data-reveal]) — renders inside the gated lab layout.
// Chess ("The Study") is the flagship; everything else is the arcade.

const STEPS = [
  { n: "01", h: "Analyze", p: "Real Stockfish evaluates the position you actually played." },
  { n: "02", h: "Grade", p: "Every move scored against the engine's best — best to blunder." },
  { n: "03", h: "Coach", p: "Plain-language reasons and the stronger line, the moment you move." },
  { n: "04", h: "Report", p: "A full post-game accuracy report and your key turning points." },
];

// The arcade — checkers (still engine-coached) sits up front, then the classics.
const GAMES = [
  { slug: "checkers", glyph: "⛂", name: "The Crossing", game: "Checkers", tag: "Bot · 1v1", desc: "A tuned draughts engine that scores each move and calls the blunders." },
  { slug: "trine", glyph: "✕", name: "Trine", game: "Tic-Tac-Toe", tag: "Bot · 1v1", desc: "Three in a row against a flawless bot — or a friend." },
  { slug: "cascade", glyph: "◍", name: "Cascade", game: "Connect Four", tag: "Bot · 1v1", desc: "Drop four in a row. Alpha-beta bot or online duel." },
  { slug: "enclosure", glyph: "⊞", name: "Enclosure", game: "Dots & Boxes", tag: "Bot · 1v1", desc: "Close the most boxes. Mind the chains." },
  { slug: "bullseye", glyph: "◎", name: "Bullseye", game: "Darts", tag: "Bot · 1v1", desc: "Two-tap aim, one arrow a turn. Race down from 150 — hit the gold to win." },
  { slug: "serpent", glyph: "∿", name: "Serpent", game: "Snake", tag: "Solo", desc: "Chase the lights, grow the glow, don't bite yourself." },
  { slug: "phosphor", glyph: "⬡", name: "Phosphor", game: "Maze Paint", tag: "Solo", desc: "The orb flies wall-to-wall — paint every tile. 100 levels, simple to fiendish." },
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
            atmosphere — a serious chess platform, plus a ghostly arcade, all in our own flavor.
          </p>
        </div>
      </section>

      {/* Flagship — chess is its own thing */}
      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">Flagship · Chess</span>
          <div className="card" style={{ marginTop: 16, padding: "clamp(22px,4vw,36px)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
              <span className="path-ic" aria-hidden style={{ fontSize: 44 }}>♞</span>
              <h2 style={{ margin: 0 }}>
                The Study <span className="dim" style={{ fontWeight: 400, fontSize: ".6em" }}>· Chess</span>
              </h2>
            </div>
            <p className="lead" style={{ marginTop: 14, maxWidth: "62ch" }}>
              Our chess platform — real Stockfish 18, every move graded and explained, a full post-game
              report, move-list replay, and online play. Built to rival the best.
            </p>
            <div className="cap-grid g-4" style={{ marginTop: 20 }}>
              {STEPS.map((s) => (
                <div className="cap" key={s.n}>
                  <span className="kicker no-line" style={{ fontSize: 12 }}>{s.n}</span>
                  <h4 style={{ margin: "12px 0 8px" }}>{s.h}</h4>
                  <p className="dim" style={{ margin: 0 }}>{s.p}</p>
                </div>
              ))}
            </div>
            <div className="hero-actions" style={{ marginTop: 22 }}>
              <Link href="/lab/chess" className="btn btn-primary">Enter The Study <span aria-hidden>→</span></Link>
              <Link href="/lab/chess/play" className="btn btn-ghost">Quick play</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Everything else — just for fun */}
      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="kicker">Arcade · just for fun</span>
          <p className="dim" style={{ margin: "8px 0 0", maxWidth: "60ch" }}>
            Ghostly takes on the classics — quick to pick up, ours in flavor. Two-player games take a bot or a friend.
          </p>
          <div className="proj-grid" style={{ marginTop: 22 }}>
            {GAMES.map((g) => <Card key={g.slug} {...g} />)}
          </div>
        </div>
      </section>
    </>
  );
}
