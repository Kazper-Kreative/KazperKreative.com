import type { Metadata } from "next";
import ApplicationForm from "@/components/site/ApplicationForm";

export const metadata: Metadata = {
  title: "Join the Network",
  description:
    "Kazper Kreative runs on a network of agents: creators, engineers and artists matched to frontier work across the agency and the studio. Apply to the roster.",
};

const DISCIPLINES = [
  { h: "Unreal Engine Devs", p: "Gameplay, tools and systems programmers fluent in UE5 and C++/Blueprints." },
  { h: "3D & Environment Artists", p: "Worlds, props and characters built for real-time performance." },
  { h: "Game Designers", p: "Systems, levels and narrative designers who can prototype an idea fast." },
  { h: "Tech Artists", p: "Shaders, pipelines and the glue between art and engineering." },
  { h: "Brand & Web Designers", p: "Identity, motion and front-end for the agency side of the house." },
  { h: "Producers", p: "People who keep frontier projects on the rails and on time." },
];

const STEPS = [
  { n: "01", h: "Apply", p: "Send us your discipline, your portfolio, and what you want to build." },
  { n: "02", h: "Portfolio review", p: "We look at real work: shipped things over résumés, every time." },
  { n: "03", h: "Get matched", p: "Join the roster and we connect you to projects that fit your strengths." },
  { n: "04", h: "Ship work", p: "Build on real projects, grow your reel, and stay in the network." },
];

export default function JoinPage() {
  return (
    <>
      <section className="section subhero">
        <div className="wrap">
          <span className="kicker" data-reveal>
            Agents · Roster · Studio team
          </span>
          <h1 className="display" data-reveal data-delay="1">
            Join the network.
            <br />
            Build the <span className="grad-text">frontier.</span>
          </h1>
          <p className="lead" data-reveal data-delay="2">
            Kazper Kreative runs on a network of agents: creators, engineers and
            artists we match to frontier work across the agency and the studio.
            If you build cutting-edge things, we want to know you.
          </p>
          <div className="hero-actions" data-reveal data-delay="3">
            <a href="#apply" className="btn btn-fill btn-lg">
              Apply now <span className="arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                Disciplines
              </span>
              <h2 data-reveal data-delay="1">
                Who we&apos;re looking for.
              </h2>
            </div>
          </div>
          <div className="grid g-3 cap-grid">
            {DISCIPLINES.map((d, i) => (
              <div className="cap" data-reveal data-delay={(i % 3).toString()} key={d.h}>
                <span className="cap-n">◇</span>
                <h4>{d.h}</h4>
                <p className="dim">{d.p}</p>
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
                How it works
              </span>
              <h2 data-reveal data-delay="1">
                From application to your first build.
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

      <section className="section-sm" id="apply">
        <div className="wrap join-apply">
          <div data-reveal>
            <span className="kicker">Apply to the network</span>
            <h2 style={{ margin: "14px 0 14px" }}>Tell us what you build.</h2>
            <p className="dim">
              We read every application. If there&apos;s a fit, you&apos;ll hear
              from us, usually within a week.
            </p>
            <div className="apply-note">
              <span className="dot"></span> Open to remote agents worldwide.
            </div>
          </div>
          <ApplicationForm />
        </div>
      </section>
    </>
  );
}
