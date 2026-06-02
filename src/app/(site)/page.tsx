import Link from "next/link";

const MARQUEE = [
  "Unreal Engine 5",
  "Real-time 3D",
  "Game Design",
  "Brand Identity",
  "Web & Interactive",
  "Virtual Production",
  "Cinematics",
];

const CAPABILITIES = [
  { n: "01", h: "Unreal Engine Dev", p: "Real-time apps, configurators, and interactive builds in UE5, from prototype to ship." },
  { n: "02", h: "Game Design", p: "Systems, levels and mechanics. Concept through playable vertical slice." },
  { n: "03", h: "Real-time 3D & VFX", p: "Environments, characters, shaders and Niagara effects engineered for performance." },
  { n: "04", h: "Cinematics & VP", p: "Sequencer cinematics and virtual production for trailers and brand films." },
  { n: "05", h: "Brand & Identity", p: "Logos, visual systems and motion that carry the same charge as the work." },
  { n: "06", h: "Web & Interactive", p: "Sites and experiences that move as well as they look, built to convert." },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="section home-hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <span className="chip" data-reveal>
              <span className="dot"></span>Frontier-grade real-time creation
            </span>
            <h1 className="display" data-reveal data-delay="1">
              We build <span className="grad-text">worlds</span>, brands &amp;
              the people behind them.
            </h1>
            <p className="lead" data-reveal data-delay="2">
              Kazper Kreative is a creative agency and the home of{" "}
              <strong>Kazper&apos;s Echo</strong>, an Unreal Engine game studio.
              We engineer cutting-edge experiences and grow the network of
              agents who ship them.
            </p>
            <div className="hero-actions" data-reveal data-delay="3">
              <Link href="/work" className="btn btn-fill btn-lg">
                See our work <span className="arrow">→</span>
              </Link>
              <Link href="/join" className="btn btn-ghost btn-lg">
                Join the network
              </Link>
            </div>
            <div className="hero-meta" data-reveal data-delay="4">
              <div>
                <span className="grad-text num">Unreal&nbsp;Engine</span>
                <small>Real-time pipeline</small>
              </div>
              <div>
                <span className="grad-text num">Agency</span>
                <small>Brand · Web · Creative</small>
              </div>
              <div>
                <span className="grad-text num">Kazper&apos;s&nbsp;Echo</span>
                <small>Original games</small>
              </div>
            </div>
          </div>
          <div className="hero-art" data-reveal data-delay="2">
            <div className="orb-wrap">
              <div className="spin-ring r2"></div>
              <div className="spin-ring"></div>
              <div className="orb-glow"></div>
              <img
                className="orb-mark"
                src="/assets/k-mark.png"
                alt="Kazper Kreative iridescent K mark"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>

      {/* DUAL IDENTITY */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                Two engines, one frontier
              </span>
              <h2 data-reveal data-delay="1">
                One house. An agency that builds for others, and a studio that
                builds its own.
              </h2>
            </div>
          </div>
          <div className="grid g-2">
            <Link className="card identity-card" href="/agency" data-tilt data-reveal>
              <span className="tag">The Agency</span>
              <h3>
                Kazper Kreative
                <br />
                Agency
              </h3>
              <p className="dim">
                Unreal Engine services, real-time 3D, brand identity and web for
                studios and independent clients who need a cutting edge.
              </p>
              <span className="card-link">
                Explore services <span className="arrow">→</span>
              </span>
            </Link>
            <Link
              className="card identity-card echo"
              href="/studio"
              data-tilt
              data-reveal
              data-delay="1"
            >
              <img className="echo-watermark" src="/assets/echo.png" alt="" aria-hidden="true" />
              <span className="tag">The Studio</span>
              <h3>
                Kazper&apos;s Echo
                <br />
                Game Studio
              </h3>
              <p className="dim">
                Our in-house studio crafting original worlds and games, pushing
                real-time storytelling and building a community of players.
              </p>
              <span className="card-link">
                Enter the Echo <span className="arrow">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR PATH */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                Choose your path
              </span>
              <h2 data-reveal data-delay="1">
                Whoever you are, there&apos;s a way in.
              </h2>
              <p className="lead" data-reveal data-delay="2">
                We&apos;re building a network of talent, partners, and players.
                Pick the door that fits.
              </p>
            </div>
          </div>
          <div className="grid g-3">
            <div className="card path-card" data-reveal>
              <div className="path-ic">◇</div>
              <h4>Become an Agent</h4>
              <p className="dim">
                Designers, developers, artists and creators. Join the roster and
                get matched to frontier work.
              </p>
              <Link href="/join" className="card-link">
                Apply to the network <span className="arrow">→</span>
              </Link>
            </div>
            <div className="card path-card" data-reveal data-delay="1">
              <div className="path-ic">◈</div>
              <h4>Hire the studio</h4>
              <p className="dim">
                Game studios and brands needing Unreal Engine, real-time 3D, or
                full creative. Let&apos;s scope it.
              </p>
              <Link href="/agency" className="card-link">
                View capabilities <span className="arrow">→</span>
              </Link>
            </div>
            <div className="card path-card" data-reveal data-delay="2">
              <div className="path-ic">◆</div>
              <h4>Follow Kazper&apos;s Echo</h4>
              <p className="dim">
                Players and fans: get devlogs, early looks and drops from our
                original games as they grow.
              </p>
              <Link href="/studio" className="card-link">
                Enter the Echo <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                Capabilities
              </span>
              <h2 data-reveal data-delay="1">
                A full real-time creative pipeline.
              </h2>
            </div>
            <Link href="/agency" className="btn btn-ghost" data-reveal data-delay="2">
              All services <span className="arrow">→</span>
            </Link>
          </div>
          <div className="grid g-3 cap-grid">
            {CAPABILITIES.map((c, i) => (
              <div className="cap" data-reveal data-delay={(i % 3).toString()} key={c.n}>
                <span className="cap-n">{c.n}</span>
                <h4>{c.h}</h4>
                <p className="dim">{c.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED WORK */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                In the works
              </span>
              <h2 data-reveal data-delay="1">
                What we&apos;re building.
              </h2>
            </div>
            <Link href="/work" className="btn btn-ghost" data-reveal data-delay="2">
              Full portfolio <span className="arrow">→</span>
            </Link>
          </div>
          <div className="work-grid two">
            <Link className="work-item js-proj" data-proj="vengeance" href="/work" data-reveal>
              <div className="proj-art">
                <span className="status dev">In Development</span>
                <img
                  className="art-rounded" loading="lazy" decoding="async"
                  src="/assets/vengeance.jpg"
                  alt="Vengeance: Beyond the Night"
                  style={{ aspectRatio: "4 / 3" }}
                />
              </div>
              <div className="work-meta">
                <div>
                  <h4>Vengeance: Beyond the Night</h4>
                  <span className="dim">Steam · Action</span>
                </div>
                <span className="flag">Agency × Studio</span>
              </div>
            </Link>
            <Link className="work-item js-proj" data-proj="shadow" href="/work" data-reveal data-delay="2">
              <div className="proj-art">
                <span className="status dev">In Development</span>
                <img
                  className="art-rounded" loading="lazy" decoding="async"
                  src="/assets/sob.jpg"
                  alt="Shadow of Beginnings"
                  style={{ aspectRatio: "4 / 3" }}
                />
              </div>
              <div className="work-meta">
                <div>
                  <h4>Shadow of Beginnings</h4>
                  <span className="dim">Steam · Action RPG</span>
                </div>
                <span className="tag">Studio</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* KAZPER'S ECHO BAND */}
      <section className="echo-band">
        <div className="echo-bg"></div>
        <div className="wrap echo-grid">
          <div className="echo-copy" data-reveal>
            <span className="kicker no-line">Kazper&apos;s Echo</span>
            <h2>
              Step into worlds
              <br />
              built in-house.
            </h2>
            <p className="lead">
              Our studio is where Kazper Kreative builds for itself: original
              games, real-time worlds, and a growing community of players along
              for the ride.
            </p>
            <div className="hero-actions">
              <Link href="/studio" className="btn btn-fill btn-lg">
                Enter the studio <span className="arrow">→</span>
              </Link>
              <Link href="/join" className="btn btn-ghost btn-lg">
                Join the studio team
              </Link>
            </div>
          </div>
          <div className="echo-art" data-reveal data-delay="1">
            <img
              className="echo-logo"
              src="/assets/echo.png"
              alt="Kazper's Echo game studio logo"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section-sm">
        <div className="wrap stats-row">
          <div className="stat" data-reveal>
            <div className="n grad-text">UE5</div>
            <div className="l">Built on Unreal Engine 5</div>
          </div>
          <div className="stat" data-reveal data-delay="1">
            <div className="n grad-text">2&nbsp;in&nbsp;1</div>
            <div className="l">Agency + game studio under one roof</div>
          </div>
          <div className="stat" data-reveal data-delay="2">
            <div className="n grad-text">∞</div>
            <div className="l">A network of agents, always open</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <div className="cta-glow"></div>
            <span className="kicker no-line">Lead the frontier with us</span>
            <h2>
              Build the next thing
              <br />
              before it exists.
            </h2>
            <p className="lead">
              Whether you want to hire us, join the roster, or play what we make.
              This is the door.
            </p>
            <div className="hero-actions">
              <Link href="/contact" className="btn btn-fill btn-lg">
                Start a project <span className="arrow">→</span>
              </Link>
              <Link href="/join" className="btn btn-ghost btn-lg">
                Become an agent
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
