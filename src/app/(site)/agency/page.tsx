import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Agency",
  description:
    "Real-time creative, engineered to a frontier standard. Unreal Engine development, game design, real-time 3D, cinematics, brand and web from Kazper Kreative.",
  alternates: { canonical: "/agency" },
};

const CAPS = [
  { n: "01", h: "Unreal Engine Dev", p: "Real-time apps, configurators, simulations and interactive builds in UE5, prototype to production." },
  { n: "02", h: "Game Design", p: "Systems, levels, mechanics and economy design. Concept through playable vertical slice." },
  { n: "03", h: "Real-time 3D & VFX", p: "Environments, characters, materials and Niagara effects engineered to hold frame-rate." },
  { n: "04", h: "Cinematics & Virtual Production", p: "Sequencer cinematics, in-camera VFX and virtual production for trailers and brand films." },
  { n: "05", h: "Brand & Identity", p: "Logos, visual systems, motion and guidelines that carry the same charge as the work." },
  { n: "06", h: "Web & Interactive", p: "Marketing sites, WebGL and interactive experiences built to look sharp and convert." },
];

const STEPS = [
  { n: "STEP 01", h: "Discover", p: "We pressure-test the goal, scope, and technical constraints before a line of code." },
  { n: "STEP 02", h: "Design", p: "Look, feel, and systems. Prototypes early so we're aligned on the real thing." },
  { n: "STEP 03", h: "Build", p: "Production in UE5 with weekly playable builds: you see progress, not promises." },
  { n: "STEP 04", h: "Ship", p: "Optimise, polish, and deliver, with the docs and support to keep it alive." },
];

const ENGAGEMENTS = [
  { tag: "Per project", h: "Project", p: "Fixed scope, fixed outcome. Ideal for a defined build, trailer, or launch." },
  { tag: "Most popular", h: "Embedded Agent", p: "Drop a Kazper agent (or a pod) into your team for real-time expertise on demand." },
  { tag: "Ongoing", h: "Retainer", p: "A standing creative + engineering partner for studios shipping continuously." },
];

export default function AgencyPage() {
  return (
    <>
      <section className="section subhero">
        <div className="wrap">
          <span className="kicker" data-reveal>
            Kazper Kreative · Agency
          </span>
          <h1 className="display" data-reveal data-delay="1">
            Real-time creative, engineered to a{" "}
            <span className="grad-text">frontier</span> standard.
          </h1>
          <p className="lead" data-reveal data-delay="2">
            We partner with studios and independent clients who need Unreal
            Engine power, real-time 3D, and creative that actually ships. One
            team, full pipeline, no hand-offs lost in translation.
          </p>
          <div className="hero-actions" data-reveal data-delay="3">
            <Link href="/contact" className="btn btn-fill btn-lg">
              Start a project <span className="arrow">→</span>
            </Link>
            <Link href="/work" className="btn btn-ghost btn-lg">
              See the work
            </Link>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                What we do
              </span>
              <h2 data-reveal data-delay="1">
                Capabilities, end to end.
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
                How we work
              </span>
              <h2 data-reveal data-delay="1">
                A tight loop from idea to ship.
              </h2>
            </div>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div className="step" data-reveal data-delay={(i % 4).toString()} key={s.n}>
                <div className="sn">{s.n}</div>
                <h4>{s.h}</h4>
                <p className="dim">{s.p}</p>
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
                Engagements
              </span>
              <h2 data-reveal data-delay="1">
                Work with us, your way.
              </h2>
            </div>
          </div>
          <div className="grid g-3">
            {ENGAGEMENTS.map((e, i) => (
              <div className="card" data-tilt data-reveal data-delay={(i % 3).toString()} key={e.h}>
                <span className="tag">{e.tag}</span>
                <h3 style={{ margin: "14px 0 10px", fontSize: 26 }}>{e.h}</h3>
                <p className="dim">{e.p}</p>
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
                Client work
              </span>
              <h2 data-reveal data-delay="1">
                Recent builds.
              </h2>
            </div>
            <Link href="/work" className="btn btn-ghost" data-reveal data-delay="2">
              Full portfolio <span className="arrow">→</span>
            </Link>
          </div>
          <div
            className="work-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,340px))" }}
          >
            <a className="work-item js-proj" data-proj="synx" href="https://sensorops.io/syndojo/" data-reveal>
              <div className="proj-art client-panel">
                <span className="status dev">Ongoing</span>
                <img className="client-logo" src="/assets/sensorops-logo.svg" alt="Sensor Ops" />
              </div>
              <div className="work-meta">
                <div>
                  <h4>SynX</h4>
                  <span className="dim">Sensor Ops · QA + Dev</span>
                </div>
                <span className="tag">Agency</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <div className="cta-glow"></div>
            <span className="kicker no-line">Have something in mind?</span>
            <h2>Let&apos;s scope it.</h2>
            <p className="lead">
              Tell us about the build. We&apos;ll come back with an approach, a
              timeline, and a number.
            </p>
            <div className="hero-actions">
              <Link href="/contact" className="btn btn-fill btn-lg">
                Start a project <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
