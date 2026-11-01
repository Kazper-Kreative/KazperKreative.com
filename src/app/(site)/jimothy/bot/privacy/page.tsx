import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jimothy Bot Privacy Policy",
  description: "What the Jimothy bot reads from YouTube and TikTok, what it does with it, and how to switch it off.",
  alternates: { canonical: "/jimothy/bot/privacy" },
};

export default function JimothyBotPrivacyPage() {
  return (
    <>
      <section className="section subhero">
        <div className="wrap">
          <span className="kicker" data-reveal>
            Jimothy bot
          </span>
          <h1 className="display" data-reveal data-delay="1">
            Privacy policy
          </h1>
          <p className="lead" data-reveal data-delay="2">
            Last updated 1 November 2026.
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <h3>What this is</h3>
          <p>
            The Jimothy bot is an internal tool run by Kazper Kreative LLC (Kazper&apos;s Echo). It reads the
            performance numbers of our own studio channels on YouTube and TikTok, picks out the posts about our
            game Jimothy&apos;s Adventure, and reports them, with goals and tips, in a private Discord channel
            that only our admins can see. It is not offered to the public, and the only accounts it connects to
            are our own.
          </p>

          <h3>What it reads</h3>
          <ul>
            <li>
              <b>YouTube</b> (read-only, scopes <code>youtube.readonly</code> and{" "}
              <code>yt-analytics.readonly</code>): our channel&apos;s video titles, descriptions, publish dates
              and statistics such as views, likes, comments, watch time, average view duration and subscribers
              gained.
            </li>
            <li>
              <b>TikTok</b> (read-only, scopes <code>user.info.basic</code>, <code>user.info.stats</code> and{" "}
              <code>video.list</code>): our account&apos;s display name, follower and like counts, and each
              video&apos;s caption, date, views, likes, comments and shares.
            </li>
          </ul>
          <p>
            It cannot post, edit, delete or comment on anything, and it never reads viewers&apos; personal
            information: only totals for our own posts.
          </p>

          <h3>What it does with it</h3>
          <ul>
            <li>Posts the numbers, goals and milestones to our private Discord channel.</li>
            <li>
              Keeps a small history of those numbers on our private server so it can show progress over time.
            </li>
            <li>
              Once a week, sends that week&apos;s numbers and post titles to Anthropic&apos;s Claude API to write
              a short summary with tips for us. Anthropic processes it under its commercial terms and does not
              use it to train models.
            </li>
          </ul>
          <p>
            We never sell or share this data with anyone else, and never use it for advertising. The sign-in
            tokens are stored as encrypted secrets on our host (Railway) and are used only by the bot.
          </p>
          <p>
            The Jimothy bot&apos;s use and transfer of information received from Google APIs adheres to the{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. It uses YouTube API Services: see the{" "}
            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener">
              YouTube Terms of Service
            </a>{" "}
            and the{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">
              Google Privacy Policy
            </a>
            .
          </p>

          <h3>Switching it off</h3>
          <p>
            Access can be revoked at any time from{" "}
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener">
              Google account permissions
            </a>{" "}
            or TikTok&apos;s Settings → Security → Manage app permissions. Stored numbers are deleted on request
            and when the bot is retired.
          </p>

          <h3>Contact</h3>
          <p>
            <a href="mailto:kazper@kazperkreative.com">kazper@kazperkreative.com</a>
          </p>
        </div>
      </section>
    </>
  );
}
