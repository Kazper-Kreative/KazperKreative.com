import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import { SOCIAL_LINKS } from "./nav";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <Link className="brand" href="/">
              <img src="/assets/k-mark.png" alt="" />
              <span>
                <b>KAZPER KREATIVE</b>
                <span className="sub">Agency × Studio</span>
              </span>
            </Link>
            <p>
              A creative agency and the home of Kazper&apos;s Echo. We build
              worlds, brands, and the network behind them.
            </p>
          </div>
          <div className="footer-col">
            <h5>Studio</h5>
            <Link href="/agency">Agency</Link>
            <Link href="/studio">Kazper&apos;s Echo</Link>
            <Link href="/work">Work</Link>
            <Link href="/agency">Capabilities</Link>
          </div>
          <div className="footer-col">
            <h5>Connect</h5>
            <Link href="/join">Join the network</Link>
            <Link href="/contact">Contact</Link>
            {SOCIAL_LINKS.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener">
                {s.label}
              </a>
            ))}
          </div>
          <div className="footer-col">
            <h5>Echo dispatch</h5>
            <p className="dim" style={{ fontSize: 14, marginBottom: 4 }}>
              Devlogs, early looks &amp; drops.
            </p>
            <NewsletterForm />
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Kazper Kreative LLC</span>
          <span>Built on the frontier · Unreal Engine 5</span>
        </div>
      </div>
    </footer>
  );
}
