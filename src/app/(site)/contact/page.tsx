import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us about your project: a game, a real-time build, a brand, a site. We'll come back with a way forward.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="section subhero">
        <div className="wrap">
          <span className="kicker" data-reveal>
            Contact
          </span>
          <h1 className="display" data-reveal data-delay="1">
            Let&apos;s build something
            <br />
            on the <span className="grad-text">frontier.</span>
          </h1>
          <p className="lead" data-reveal data-delay="2">
            Tell us about your project: a game, a real-time build, a brand, a
            site. We&apos;ll come back with a way forward.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap contact-grid">
          <ContactForm />
          <aside className="contact-aside" data-reveal data-delay="1">
            <div className="card" style={{ padding: 26, marginBottom: 18 }}>
              <h4 style={{ marginBottom: 14 }}>What happens next</h4>
              <ol className="next">
                <li>
                  <span>1</span> We read your inquiry and confirm fit.
                </li>
                <li>
                  <span>2</span> A short call to align on scope.
                </li>
                <li>
                  <span>3</span> You get an approach, timeline &amp; quote.
                </li>
              </ol>
            </div>
            <div className="card" style={{ padding: 26 }}>
              <h4 style={{ marginBottom: 12 }}>Other ways in</h4>
              <p className="dim" style={{ fontSize: 15, marginBottom: 14 }}>
                Prefer to talk, or want to build with us?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="mailto:kazper@kazperkreative.com" className="card-link">
                  kazper@kazperkreative.com
                </a>
                <a href="https://discord.gg/ThqZ8wfzmC" target="_blank" rel="noopener" className="card-link">
                  Join our Discord <span className="arrow">→</span>
                </a>
                <Link href="/join" className="card-link">
                  Apply to the roster <span className="arrow">→</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
