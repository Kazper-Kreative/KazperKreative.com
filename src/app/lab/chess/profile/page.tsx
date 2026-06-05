import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile · The Study",
  robots: { index: false, follow: false },
};

type Stats = { rating: number; played: number; wins: number; losses: number; draws: number; best_accuracy: number | null };
type Game = { created_at: string; result: string | null; accuracy: number | null; level: string | null; color: string | null; rating_after: number | null };

// Your top-level Lab account + chess stats. Reads game_stats / chess_games
// server-side (RLS scopes them to you). Empty until you finish a game.
export default async function StudyProfilePage() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  let stats: Stats | null = null;
  let games: Game[] = [];
  if (user) {
    const [s, g] = await Promise.all([
      sb.from("game_stats").select("rating,played,wins,losses,draws,best_accuracy").eq("user_id", user.id).eq("game", "chess").maybeSingle(),
      sb.from("chess_games").select("created_at,result,accuracy,level,color,rating_after").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    ]);
    stats = (s.data as Stats) ?? null;
    games = (g.data as Game[]) ?? [];
  }

  const wld = stats ? `${stats.wins} / ${stats.losses} / ${stats.draws}` : "—";
  const cards = [
    { k: "Rating", v: stats ? String(stats.rating) : "1200", accent: true },
    { k: "Played", v: stats ? String(stats.played) : "0" },
    { k: "W / L / D", v: wld },
    { k: "Best accuracy", v: stats?.best_accuracy != null ? `${Math.round(stats.best_accuracy)}%` : "—" },
  ];

  return (
    <section className="section" style={{ paddingTop: "clamp(40px,7vw,84px)" }}>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <Link href="/lab/chess" className="card-link" style={{ display: "inline-flex" }}>
          <span aria-hidden>←</span> The Study
        </Link>

        <h1 style={{ margin: "14px 0 0" }}>Your <span className="grad-text">profile</span></h1>

        <div className="card" style={{ marginTop: 22, padding: "clamp(20px,4vw,28px)" }}>
          <span className="kicker no-line" style={{ fontSize: 12 }}>Lab account</span>
          <h3 style={{ margin: "10px 0 0", wordBreak: "break-word" }}>{user?.email ?? "Signed in"}</h3>
          <p className="dim" style={{ marginTop: 8, marginBottom: 0 }}>
            One Lab account, per-game stats hanging off it — chess first.
          </p>
        </div>

        <div className="card" style={{ marginTop: 16, padding: "clamp(20px,4vw,28px)" }}>
          <span className="kicker no-line" style={{ fontSize: 12 }}>Chess</span>
          <div className="cap-grid g-4" style={{ marginTop: 14 }}>
            {cards.map((c) => (
              <div className="cap" key={c.k}>
                <span className="kicker no-line" style={{ fontSize: 11 }}>{c.k}</span>
                <h4 className={c.accent ? "grad-text" : undefined} style={{ margin: "8px 0 0", fontSize: c.accent ? 26 : undefined }}>{c.v}</h4>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: 16, padding: "clamp(20px,4vw,28px)" }}>
          <span className="kicker no-line" style={{ fontSize: 12 }}>Recent games</span>
          {games.length === 0 ? (
            <p className="dim" style={{ marginTop: 12, marginBottom: 0 }}>
              No games yet. <Link href="/lab/chess/play" className="card-link" style={{ display: "inline-flex" }}>Play one →</Link>
            </p>
          ) : (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {games.map((g, i) => {
                const tone = g.result === "win" ? "var(--good)" : g.result === "loss" ? "var(--bad)" : "var(--warn)";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, padding: "8px 0", borderTop: i ? "1px solid var(--panel-edge)" : "none" }}>
                    <span style={{ color: tone, fontWeight: 600, textTransform: "capitalize", minWidth: 44 }}>{g.result ?? "—"}</span>
                    <span className="dim">{g.color === "b" ? "Black" : "White"} · {g.level ?? "bot"}</span>
                    <span className="dim" style={{ marginLeft: "auto" }}>
                      {g.accuracy != null ? `${Math.round(g.accuracy)}%` : "—"}{g.rating_after != null ? ` · ${g.rating_after}` : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="hero-actions" style={{ marginTop: 22 }}>
          <Link href="/lab/chess/play" className="btn btn-primary">Play a game</Link>
        </div>
      </div>
    </section>
  );
}
