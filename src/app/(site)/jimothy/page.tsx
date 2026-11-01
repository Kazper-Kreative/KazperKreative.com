import type { Metadata } from "next";
import Link from "next/link";

const STEAM = "https://store.steampowered.com/app/5082200/?utm_source=kazperkreative&utm_medium=site&utm_campaign=jimothy_home";

export const metadata: Metadata = {
  title: "Jimothy's Adventure",
  description:
    "A raccoon stealth comedy from Kazper's Echo. Raid trash cans, haul your loot home to the babies, and outsmart a suburb that escalates all the way to the FBI. Out now on Steam.",
  alternates: { canonical: "/jimothy" },
};

export default function JimothyPage() {
  return (
    <>
      <section className="section subhero">
        <div className="wrap">
          <span className="kicker" data-reveal>
            Kazper&apos;s Echo · out now on Steam
          </span>
          <h1 className="display" data-reveal data-delay="1">
            Jimothy&apos;s <span className="grad-text">Adventure</span>
          </h1>
          <p className="lead" data-reveal data-delay="2">
            One raccoon dad. One hungry family. Every agency in town. Raid trash cans, haul your loot home to the
            babies, and outsmart increasingly ridiculous patrols as one simple night of scavenging turns into an
            all-out raccoon hunt.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }} data-reveal data-delay="3">
            <a href={STEAM} target="_blank" rel="noopener" className="btn btn-primary btn-lg">
              Get it on Steam · $4.99
            </a>
            <a href="https://discord.gg/ThqZ8wfzmC" target="_blank" rel="noopener" className="btn btn-ghost btn-lg">
              Join the Discord
            </a>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <iframe
            src="https://store.steampowered.com/widget/5082200/"
            title="Jimothy's Adventure on Steam"
            loading="lazy"
            style={{ width: "100%", height: 190, border: 0 }}
          />
          <p className="dim" style={{ fontSize: 14, marginTop: 28 }}>
            Developed by Kazper&apos;s Echo · Published by Nexxverse Games ·{" "}
            <Link href="/jimothy/bot/privacy">Jimothy bot privacy</Link> ·{" "}
            <Link href="/jimothy/bot/terms">terms</Link>
          </p>
        </div>
      </section>
    </>
  );
}
