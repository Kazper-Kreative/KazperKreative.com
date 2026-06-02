import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/site/NewsletterForm";

export const metadata: Metadata = {
  title: "Kazper's Echo · Game Studio",
  description:
    "Kazper's Echo is the in-house game studio of Kazper Kreative, building original worlds on Unreal Engine 5: MechaVerse, Vengeance: Beyond the Night, and Shadow of Beginnings.",
};

const WORKS = [
  {
    statusClass: "prealpha",
    status: "Pre-Alpha",
    art: "/assets/mechaverse.png",
    tags: [{ flag: false, label: "Roblox" }, { flag: false, label: "Mech" }, { flag: false, label: "Progression" }],
    title: "MechaVerse",
    desc: "Strap into a war-machine and earn your name. Pilot towering mechs, stake your claim, and climb the ranks of the intergalactic Confederation.",
    meta: ["Roblox", "After the Unreal slate"],
    link: { url: "https://www.roblox.com/games/7825844132", label: "View on Roblox" },
  },
  {
    statusClass: "dev",
    status: "In Development",
    art: "/assets/vengeance.png",
    tags: [{ flag: true, label: "Agency × Studio" }, { flag: false, label: "Steam" }, { flag: false, label: "Action" }],
    title: "Vengeance: Beyond the Night",
    desc: "One vigilante stands between the city and the rogue AI clawing through its night. Hunt it down, adapt, and hold the line until dawn.",
    meta: ["Steam · Windows", "Target: Jul 2026"],
  },
  {
    statusClass: "dev",
    status: "In Development",
    art: "/assets/sob.jpg",
    tags: [{ flag: false, label: "Steam" }, { flag: false, label: "Action RPG" }],
    title: "Shadow of Beginnings",
    desc: "An action-RPG of ruin and rebuilding. Gather what's left, brave the horrors beyond the walls, and bring the Town of Beginnings back from the dark.",
    meta: ["Steam · Windows", "Target: Oct 2026"],
  },
];

const PILLARS = [
  { ic: "◇", h: "World-first", p: "Places worth getting lost in. Atmosphere, lore and detail before everything else." },
  { ic: "◈", h: "Systems that surprise", p: "Mechanics that interact in ways even we didn't fully plan. Depth over spectacle." },
  { ic: "◆", h: "Built with players", p: "We share early and often. The community shapes the game as it grows." },
];

const DEVLOG = [
  { date: "2026 · 05", h: "Vengeance: wiring the rogue-AI threat system", p: "How enemies learn, swarm and adapt, building an AI that actually fights back." },
  { date: "2026 · 04", h: "Shadow of Beginnings: rebuilding the town", p: "First look at the gather-and-restore loop at the heart of the world." },
  { date: "2026 · 03", h: "MechaVerse enters pre-alpha on Roblox", p: "The mechs are walking. Here's where the Confederation goes next." },
];

export default function StudioPage() {
  return (
    <>
      <section className="section subhero">
        <div className="wrap studio-hero-grid">
          <div>
            <span className="kicker" data-reveal>
              Kazper&apos;s Echo · Game Studio
            </span>
            <h1 className="display" data-reveal data-delay="1">
              Original worlds,
              <br />
              built in <span className="grad-text">real time.</span>
            </h1>
            <p className="lead" data-reveal data-delay="2">
              Kazper&apos;s Echo is the in-house game studio of Kazper Kreative.
              We build our own worlds on Unreal Engine 5, and bring players
              along for every step of the journey.
            </p>
            <div className="hero-actions" data-reveal data-delay="3">
              <a href="#follow" className="btn btn-fill btn-lg">
                Follow the studio <span className="arrow">→</span>
              </a>
              <Link href="/join" className="btn btn-ghost btn-lg">
                Join the team
              </Link>
            </div>
          </div>
          <div className="studio-hero-art" data-reveal data-delay="2">
            <img className="echo-logo" src="/assets/echo.png" alt="Kazper's Echo logo" />
          </div>
        </div>
      </section>

      <section className="section-sm" id="in-the-works">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                In the works
              </span>
              <h2 data-reveal data-delay="1">
                Three worlds, in motion.
              </h2>
              <p className="lead" data-reveal data-delay="2">
                Our current slate, across Roblox and Steam, from pre-alpha to
                polish. Follow along as they take shape.
              </p>
            </div>
          </div>
          <div className="proj-grid">
            {WORKS.map((w, i) => (
              <article className="card proj-card" data-reveal data-delay={(i % 3).toString()} key={w.title}>
                <div className="proj-art">
                  <span className={`status ${w.statusClass}`}>{w.status}</span>
                  <img className="art-rect" src={w.art} alt={w.title} style={{ aspectRatio: "16 / 10" }} />
                </div>
                <div className="proj-body">
                  <div className="proj-tags">
                    {w.tags.map((t) => (
                      <span className={t.flag ? "flag" : "tag"} key={t.label}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                  <h3>{w.title}</h3>
                  <p className="dim">{w.desc}</p>
                  <div className="proj-meta">
                    {w.meta.map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                  {w.link && (
                    <a className="card-link" href={w.link.url} target="_blank" rel="noopener">
                      {w.link.label} <span className="arrow">→</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                Studio pillars
              </span>
              <h2 data-reveal data-delay="1">
                What we care about.
              </h2>
            </div>
          </div>
          <div className="grid g-3">
            {PILLARS.map((p, i) => (
              <div className="card path-card" data-reveal data-delay={(i % 3).toString()} key={p.h}>
                <div className="path-ic">{p.ic}</div>
                <h4>{p.h}</h4>
                <p className="dim">{p.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                Devlog
              </span>
              <h2 data-reveal data-delay="1">
                From the studio floor.
              </h2>
            </div>
          </div>
          <div className="grid" style={{ gap: 0 }}>
            {DEVLOG.map((d, i) => (
              <a href="#follow" className="devrow" data-reveal data-delay={(i % 3).toString()} key={d.date}>
                <span className="devdate">{d.date}</span>
                <div className="devbody">
                  <h4>{d.h}</h4>
                  <p className="dim">{d.p}</p>
                </div>
                <span className="arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="follow">
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <div className="cta-glow"></div>
            <span className="kicker no-line">Join the journey</span>
            <h2>Be there from the start.</h2>
            <p className="lead">
              Devlogs, early looks, playtests and drops, straight to your inbox
              and our community.
            </p>
            <NewsletterForm
              label="Follow"
              doneLabel="✓ In"
              style={{ maxWidth: 440, margin: "22px auto 14px" }}
            />
            <div className="hero-actions">
              <a href="https://discord.gg/ThqZ8wfzmC" target="_blank" rel="noopener" className="btn btn-ghost">
                Join the Discord
              </a>
              <Link href="/join" className="btn btn-ghost">
                Work at the studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
