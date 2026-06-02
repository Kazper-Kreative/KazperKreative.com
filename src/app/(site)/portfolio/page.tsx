import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfolio · Mason",
  robots: { index: false, follow: false },
};

const CAPS = [
  { n: "01", h: "Game Development", p: "Unreal Engine and Roblox builds, from first prototype to shipped product." },
  { n: "02", h: "Game Design", p: "Systems, levels, progression, and the moment-to-moment feel of play." },
  { n: "03", h: "Real-time 3D", p: "Environments, characters, and effects engineered to hold frame-rate." },
  { n: "04", h: "QA & Dev", p: "Structured testing and hands-on development for clients like Sensor Ops." },
  { n: "05", h: "Creative Direction", p: "Brand, art direction, and the through-line that ties a project together." },
  { n: "06", h: "The Network", p: "Building and leading a roster of agents shipping frontier work." },
];

const WORK = [
  { proj: "mechaverse", status: "Pre-Alpha", statusClass: "prealpha", art: "/assets/mechaverse.jpg", title: "MechaVerse", label: "Roblox · Mech", badge: { flag: false, text: "Studio" } },
  { proj: "vengeance", status: "In Development", statusClass: "dev", art: "/assets/vengeance.jpg", title: "Vengeance: Beyond the Night", label: "Steam · Action", badge: { flag: true, text: "Agency × Studio" } },
  { proj: "shadow", status: "In Development", statusClass: "dev", art: "/assets/sob.jpg", title: "Shadow of Beginnings", label: "Steam · Action RPG", badge: { flag: false, text: "Studio" } },
  { proj: "synx", status: "Ongoing", statusClass: "dev", clientLogo: "/assets/sensorops-logo.svg", title: "SynX", label: "Sensor Ops · QA + Dev", badge: { flag: false, text: "Agency" } },
];

export default function PortfolioPage() {
  return (
    <>
      <section className="section" style={{ paddingTop: "clamp(36px,6vw,76px)" }}>
        <div className="wrap">
          <span className="chip" data-reveal>
            <span className="dot"></span>Personal portfolio · private link
          </span>
          <div className="pf-hero">
            <div className="pf-photo" data-reveal>
              <div className="media-frame">
                <img src="/assets/mason-hr.jpg" alt="Mason" style={{ aspectRatio: "1 / 1" }} />
              </div>
            </div>
            <div data-reveal data-delay="1">
              <h1 className="display" style={{ fontSize: "clamp(40px,6.5vw,80px)", marginBottom: 6 }}>
                Mason
              </h1>
              <p className="kicker no-line" style={{ margin: "0 0 18px" }}>
                Founder · Kazper Kreative &amp; Kazper&apos;s Echo
              </p>
              <p className="lead">
                Creative technologist building games, brands, and the studio
                behind them. I work across Unreal Engine, game design, QA and
                creative direction, and I lead a growing network of agents
                shipping frontier work.
              </p>
              <div className="hero-actions">
                <a href="mailto:masonbell929@gmail.com" className="btn btn-fill btn-lg">
                  Get in touch <span className="arrow">→</span>
                </a>
                <Link href="/" className="btn btn-ghost btn-lg">
                  Kazper Kreative ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="glowline" />

      <section className="section-sm">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                What I do
              </span>
              <h2 data-reveal data-delay="1">
                A builder across the stack.
              </h2>
            </div>
          </div>
          <div className="grid g-3 cap-grid">
            {CAPS.map((c, i) => (
              <div className="cap" data-reveal data-delay={(i % 3).toString()} key={c.n}>
                <span className="cap-n">{c.n}</span>
                <h4>{c.h}</h4>
                <p className="dim">{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                Selected work
              </span>
              <h2 data-reveal data-delay="1">
                Things I&apos;ve built.
              </h2>
            </div>
          </div>
          <div className="work-grid pf">
            {WORK.map((w, i) => (
              <a
                key={w.proj}
                className="work-item js-proj"
                data-proj={w.proj}
                href="#"
                data-reveal
                data-delay={(i % 3).toString()}
              >
                <div className={`proj-art${w.clientLogo ? " client-panel" : ""}`}>
                  <span className={`status ${w.statusClass}`}>{w.status}</span>
                  {w.clientLogo ? (
                    <img className="client-logo" src={w.clientLogo} alt={w.title} />
                  ) : (
                    <img className="art-rounded" loading="lazy" decoding="async" src={w.art} alt={w.title} style={{ aspectRatio: "16 / 10" }} />
                  )}
                </div>
                <div className="work-meta">
                  <div>
                    <h4>{w.title}</h4>
                    <span className="dim">{w.label}</span>
                  </div>
                  <span className={w.badge.flag ? "flag" : "tag"}>{w.badge.text}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="kicker" data-reveal>
            About
          </span>
          <h2 data-reveal data-delay="1" style={{ margin: "14px 0 16px" }}>
            A bit more about me.
          </h2>
          <p className="lead" data-reveal data-delay="2">
            I started Kazper Kreative to build at the frontier of interactive
            creation: an agency and a game studio under one roof. From piloting
            mechs in MechaVerse to keeping Sensor Ops&apos; SynX flight-ready, I
            move between making our own worlds and helping clients ship theirs.
          </p>
          <p className="dim" data-reveal data-delay="2" style={{ marginTop: 16, maxWidth: "70ch" }}>
            When I&apos;m not in the engine, I&apos;m growing the agent network
            and figuring out what we build next.
          </p>
          <span className="coming" data-reveal>
            Full bio &amp; résumé coming soon
          </span>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <div className="cta-glow"></div>
            <span className="kicker no-line">Let&apos;s talk</span>
            <h2>Work with me.</h2>
            <p className="lead">
              Hiring, collaborating, or just curious? The door&apos;s open.
            </p>
            <div className="hero-actions">
              <a href="mailto:masonbell929@gmail.com" className="btn btn-fill btn-lg">
                Email me <span className="arrow">→</span>
              </a>
              <Link href="/join" className="btn btn-ghost btn-lg">
                Join the network
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
