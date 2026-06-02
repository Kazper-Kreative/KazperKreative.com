import type { Metadata } from "next";
import Link from "next/link";
import WorkFilter from "@/components/site/WorkFilter";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected work from Kazper Kreative: builds from the agency and worlds from the studio, across Roblox and Steam.",
};

export default function WorkPage() {
  return (
    <>
      <section className="section subhero">
        <div className="wrap">
          <span className="kicker" data-reveal>
            Portfolio
          </span>
          <h1 className="display" data-reveal data-delay="1">
            Selected <span className="grad-text">work.</span>
          </h1>
          <p className="lead" data-reveal data-delay="2">
            Builds from the agency and worlds from the studio. Explore what
            we&apos;re making across the network.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap">
          <WorkFilter />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="cta-band" data-reveal>
            <div className="cta-glow"></div>
            <span className="kicker no-line">Like what you see?</span>
            <h2>Let&apos;s make the next one.</h2>
            <div className="hero-actions">
              <Link href="/contact" className="btn btn-fill btn-lg">
                Start a project <span className="arrow">→</span>
              </Link>
              <Link href="/join" className="btn btn-ghost btn-lg">
                Join the roster
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
