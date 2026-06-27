import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfolio · Mason",
  robots: { index: false, follow: false },
};

const CAPS = [
  { n: "01", h: "Game Development", p: "Unreal Engine builds, from first prototype to shipped product." },
  { n: "02", h: "Game Design", p: "Systems, levels, progression, and the moment-to-moment feel of play." },
  { n: "03", h: "Real-time 3D", p: "Environments, characters, and effects engineered to hold frame-rate." },
  { n: "04", h: "QA & Dev", p: "Structured testing and hands-on development for clients like Sensor Ops." },
  { n: "05", h: "Creative Direction", p: "Brand, art direction, and the through-line that ties a project together." },
  { n: "06", h: "The Network", p: "Building and leading a roster of agents shipping frontier work." },
];

const WORK = [
  { proj: "vengeance", status: "In Development", statusClass: "dev", art: "/assets/vengeance.jpg", title: "Vengeance: Beyond the Night", label: "Steam · Action", badge: { flag: true, text: "Agency × Studio" } },
  { proj: "shadow", status: "In Development", statusClass: "dev", art: "/assets/sob.jpg", title: "Shadows of Beginnings", label: "Steam · Action RPG", badge: { flag: false, text: "Studio" } },
  { proj: "synx", status: "Ongoing", statusClass: "dev", clientLogo: "/assets/sensorops-logo.svg", title: "SynX", label: "Sensor Ops · QA + Dev", badge: { flag: false, text: "Agency" } },
];

const SUMMARY =
  "I architect the pipelines, manage the backend data, and fine-tune the microscopic details that make an experience feel incredible. As a highly versatile UE5 developer, I adapt to exactly what the project demands — from bespoke C++ features and overarching gameplay logic to complete technical QA stabilization. Whether building specialized systems from scratch, tuning flight physics to perfection, or architecting massive CI/CD pipelines, I bring the technical discipline to guarantee a flawless, release-ready end-user experience.";

const EXPERIENCE = [
  {
    company: "Kazper Kreative LLC",
    role: "CEO & Founder",
    bullets: [
      "Execute end-to-end development, handling every aspect of a project from initial prototype to final deployment and storefront management for commercial Steam releases.",
      "Set up server hosting logistics, manage DNS, and deploy custom data tracking via platforms like Railway, Vercel, and Cloudflare.",
      "Architect bulletproof CI/CD workflows, Steamworks deployment pipelines, and reliable branching strategies.",
      "Manage massive 500GB+ Git LFS repositories, optimizing storage for distributed teams.",
    ],
  },
  {
    company: "SensorOps",
    role: "QA Engineer",
    bullets: [
      "Meticulously fine-tune flight dynamics, sub-T/FPV models, and complex hardware integrations for high-fidelity military simulations.",
      "Optimize physics collisions, stabilize frame rates, and identify critical memory bottlenecks.",
      "Design “Cold Install” protocols, White-Box QA strategies, and comprehensive smoke tests to stabilize chaotic release cycles.",
      "Streamline task tracking and team workflows using Jira, Confluence, and Trello.",
    ],
  },
  {
    company: "Team Nebula",
    role: "Gameplay & Backend Developer",
    note: "Shadows of Beginnings",
    bullets: [
      "Architect complex backend data systems, database integrations, and overarching gameplay logic.",
      "Develop robust “Game Feel,” complex inventory economies, town restoration loops, and highly scalable data architectures designed for easy iteration.",
      "Bridge the gap between design and functionality by engineering responsive, modular interfaces using UMG and Slate C++.",
    ],
  },
];

const STACK = [
  { cat: "Core Engineering", items: "Unreal Engine 5, C++, Blueprints, Multiplayer Data Architecture" },
  { cat: "UI/UX & Systems", items: "UMG, Slate C++, “Game Feel” Development, Inventory Economies" },
  { cat: "Infrastructure", items: "Railway, Vercel, Cloudflare, CI/CD Workflows, Steamworks Deployment" },
  { cat: "Version Control & PM", items: "Git LFS, Jira, Confluence, Trello" },
  { cat: "Audio Integration", items: "24-bit / 48 kHz Recording Standards, FL Studio, Audio Production" },
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
                <a
                  href="/assets/mason-bell-resume.pdf"
                  download="Mason-Lee-Bell-Resume.pdf"
                  className="btn btn-ghost btn-lg"
                >
                  Download résumé <span className="arrow">↓</span>
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

      <hr className="glowline" />

      <section className="section-sm" id="resume">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span className="kicker" data-reveal>
            Bio &amp; résumé
          </span>
          <h2 data-reveal data-delay="1" style={{ margin: "14px 0 4px" }}>
            Mason Lee Bell
          </h2>
          <p className="kicker no-line" data-reveal data-delay="1" style={{ margin: "0 0 18px" }}>
            Austin, Texas · Full-Stack Unreal Engine Developer · Systems Engineer &amp; Lead QA
          </p>
          <p className="lead" data-reveal data-delay="2">
            {SUMMARY}
          </p>
          <div className="hero-actions" data-reveal data-delay="2" style={{ marginTop: 20 }}>
            <a
              href="/assets/mason-bell-resume.pdf"
              download="Mason-Lee-Bell-Resume.pdf"
              className="btn btn-fill"
            >
              Download résumé (PDF) <span className="arrow">↓</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <span className="kicker" data-reveal>
            Experience
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
            {EXPERIENCE.map((job, i) => (
              <div
                className="card"
                data-reveal
                data-delay={(i % 3).toString()}
                key={job.company}
                style={{ padding: "clamp(18px,3.5vw,26px)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <h4 style={{ margin: 0 }}>
                    {job.company}
                    {job.note ? <span className="dim" style={{ fontWeight: 400 }}> · {job.note}</span> : null}
                  </h4>
                  <span className="tag">{job.role}</span>
                </div>
                <ul className="dim" style={{ margin: "12px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8, lineHeight: 1.55 }}>
                  {job.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="grid g-2" style={{ alignItems: "start" }}>
            <div data-reveal>
              <span className="kicker">Education</span>
              <div className="card" style={{ marginTop: 16, padding: "clamp(18px,3.5vw,26px)" }}>
                <h4 style={{ margin: 0 }}>Full Sail University</h4>
                <p className="dim" style={{ margin: "6px 0 0" }}>
                  Bachelor of Science in Game Development
                </p>
                <p className="dim" style={{ margin: "6px 0 0" }}>
                  Expected graduation: June 2026
                </p>
              </div>
            </div>
            <div data-reveal data-delay="1">
              <span className="kicker">Technical stack &amp; expertise</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                {STACK.map((s) => (
                  <div className="card" key={s.cat} style={{ padding: "14px 18px" }}>
                    <span className="kicker no-line" style={{ fontSize: 11 }}>{s.cat}</span>
                    <p style={{ margin: "6px 0 0", fontSize: 14 }}>{s.items}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
