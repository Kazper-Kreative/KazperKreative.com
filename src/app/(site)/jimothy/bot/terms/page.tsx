import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jimothy Bot Terms of Service",
  description: "The terms for the Jimothy bot, Kazper's Echo's internal YouTube and TikTok reporting tool.",
  alternates: { canonical: "/jimothy/bot/terms" },
};

export default function JimothyBotTermsPage() {
  return (
    <>
      <section className="section subhero">
        <div className="wrap">
          <span className="kicker" data-reveal>
            Jimothy bot
          </span>
          <h1 className="display" data-reveal data-delay="1">
            Terms of service
          </h1>
          <p className="lead" data-reveal data-delay="2">
            Last updated 1 November 2026.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <p>
            The Jimothy bot is an internal reporting tool operated by Kazper Kreative LLC (Kazper&apos;s Echo). It
            connects only to accounts we own, reads their performance numbers read-only, and reports them in a
            private Discord channel. It is not available for anyone else to sign in to or use.
          </p>
          <p>
            By connecting an account to it, the account owner (us) allows it to read the data described in the{" "}
            <a href="/jimothy/bot/privacy">privacy policy</a>, and can revoke that at any time. Use of YouTube data
            is also subject to the{" "}
            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener">
              YouTube Terms of Service
            </a>
            , and use of TikTok data to TikTok&apos;s terms.
          </p>
          <p>
            The tool is provided as is, with no warranty. Questions:{" "}
            <a href="mailto:kazper@kazperkreative.com">kazper@kazperkreative.com</a>.
          </p>
        </div>
      </section>
    </>
  );
}
