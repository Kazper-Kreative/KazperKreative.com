import type { Metadata } from "next";
import Link from "next/link";
import { getLabAccess } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile · The Study",
  robots: { index: false, follow: false },
};

// Your top-level Lab account. Identity (email + membership) is real today via
// getLabAccess(); per-game stats (chess rating, game history) light up once the
// chess_accounts migration is applied and the Play mode starts recording.
export default async function StudyProfilePage() {
  const { email, entitled, member } = await getLabAccess();
  const status = member?.status ?? "none";
  const statusLabel =
    status === "comp" ? "Comped member" :
    status === "active" ? "Active member" :
    entitled ? "Member" : "No access";

  return (
    <section className="section" style={{ paddingTop: "clamp(40px,7vw,84px)" }}>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <Link href="/lab/chess" className="card-link" style={{ display: "inline-flex" }}>
          <span aria-hidden>←</span> The Study
        </Link>

        <h1 style={{ margin: "14px 0 0" }}>Your <span className="grad-text">profile</span></h1>

        <div className="card" style={{ marginTop: 22, padding: "clamp(20px,4vw,28px)" }}>
          <span className="kicker no-line" style={{ fontSize: 12 }}>Lab account</span>
          <h3 style={{ margin: "10px 0 4px", wordBreak: "break-word" }}>{email ?? "Signed in"}</h3>
          <span className="chip"><span className="dot"></span>{statusLabel}</span>
          <p className="dim" style={{ marginTop: 14, marginBottom: 0 }}>
            This is your single Lab account. Per-game stats hang off it — chess first.
          </p>
        </div>

        <div className="card" style={{ marginTop: 16, padding: "clamp(20px,4vw,28px)" }}>
          <span className="kicker no-line" style={{ fontSize: 12 }}>Chess</span>
          <div className="cap-grid g-4" style={{ marginTop: 14 }}>
            {[
              { k: "Rating", v: "—" },
              { k: "Played", v: "—" },
              { k: "W / L / D", v: "—" },
              { k: "Best accuracy", v: "—" },
            ].map((s) => (
              <div className="cap" key={s.k}>
                <span className="kicker no-line" style={{ fontSize: 11 }}>{s.k}</span>
                <h4 style={{ margin: "8px 0 0" }}>{s.v}</h4>
              </div>
            ))}
          </div>
          <p className="dim" style={{ marginTop: 16, marginBottom: 0 }}>
            Your rating and game history start tracking once accounts go live. Play a game to begin.
          </p>
          <div className="hero-actions" style={{ marginTop: 18 }}>
            <Link href="/lab/chess/play" className="btn btn-primary">Play a game</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
