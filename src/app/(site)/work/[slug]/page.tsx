import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PROJECTS, PROJECT_ORDER, type ProjectSlug } from "@/data/projects";

export function generateStaticParams() {
  return PROJECT_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS[slug as ProjectSlug];
  if (!project) return {};
  return {
    title: `${project.title} · Case Study`,
    description: project.caseLead,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = PROJECTS[slug as ProjectSlug];
  if (!project) notFound();

  const heroActions = project.link ? (
    <>
      <a className="btn btn-fill btn-lg" href={project.link.url} target="_blank" rel="noopener">
        {project.link.label} ↗
      </a>
      <Link className="btn btn-ghost btn-lg" href="/work">
        Back to work
      </Link>
    </>
  ) : (
    <span className="coming">Steam page coming soon</span>
  );

  return (
    <>
      <section className="section cs-hero" style={{ paddingTop: "clamp(36px,6vw,72px)" }}>
        <div className="wrap">
          <Link href="/work" className="cs-back">
            ← Back to work
          </Link>
          <div className="cs-hero-grid">
            <div>
              <div className="cs-badges">
                <span className={`status ${project.statusClass}`}>{project.status}</span>
                {project.flag && <span className="flag">{project.flag}</span>}
              </div>
              <h1 className="display cs-title" data-reveal>
                {project.title}
              </h1>
              <p className="lead" data-reveal data-delay="1">
                {project.caseLead}
              </p>
              <div className="fact-row">
                {project.facts.map((f) => (
                  <div className="fact" key={f.k}>
                    <div className="k">{f.k}</div>
                    <div className="v">{f.v}</div>
                  </div>
                ))}
              </div>
              <div className="hero-actions" data-reveal data-delay="2">
                {heroActions}
              </div>
            </div>
            <div className="cs-art" data-reveal data-delay="1">
              {project.clientLogo ? (
                <div className="client-panel">
                  <img className="client-logo" src={project.clientLogo} alt={project.title} />
                </div>
              ) : (
                <img
                  className="media-frame rounded"
                  src={project.art}
                  alt={`${project.title} key art`}
                  style={{ aspectRatio: "4 / 3" }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <hr className="glowline" />

      <section className="section">
        <div className="wrap" style={{ maxWidth: 880 }}>
          <span className="kicker" data-reveal>
            {project.overview.kicker}
          </span>
          <h2 data-reveal data-delay="1" style={{ margin: "14px 0 18px" }}>
            {project.overview.title}
          </h2>
          <p className="lead" data-reveal data-delay="2">
            {project.overview.lead}
          </p>
          <p className="dim" data-reveal data-delay="2" style={{ marginTop: 16, maxWidth: "70ch" }}>
            {project.overview.dim}
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap">
          <div className="sec-head">
            <div className="sec-head-text">
              <span className="kicker" data-reveal>
                {project.pillars.kicker}
              </span>
              <h2 data-reveal data-delay="1">
                {project.pillars.title}
              </h2>
            </div>
          </div>
          <div className="grid g-3">
            {project.pillars.items.map((p, i) => (
              <div className="card path-card" data-reveal data-delay={(i % 3).toString()} key={p.h}>
                <div className="path-ic">{p.ic}</div>
                <h4>{p.h}</h4>
                <p className="dim">{p.p}</p>
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
                {project.gallery.kicker}
              </span>
              <h2 data-reveal data-delay="1">
                {project.gallery.title}
              </h2>
            </div>
          </div>
          <div data-reveal>
            <div className="gallery">
              <div className="slot-ph">Screenshot</div>
              <div className="slot-ph">Screenshot</div>
              <div className="slot-ph">Screenshot</div>
            </div>
            <span className="coming">{project.gallery.note}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <div className="cta-glow"></div>
            <span className="kicker no-line">{project.cta.kicker}</span>
            <h2>{project.cta.title}</h2>
            <p className="lead">{project.cta.lead}</p>
            <div className="hero-actions">
              {project.cta.primary ? (
                <>
                  <a className="btn btn-fill btn-lg" href={project.cta.primary.url} target="_blank" rel="noopener">
                    {project.cta.primary.label}
                  </a>
                  <Link className="btn btn-ghost btn-lg" href="/work">
                    Back to work
                  </Link>
                </>
              ) : (
                <span className="coming">Steam page coming soon</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
