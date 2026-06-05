import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

// Chess accounts: record a finished vs-bot game and move the player's Elo.
// Rating math lives here (server-side) so it can't be tampered with from the
// client. Writes go through the cookie session → RLS attributes rows to the
// signed-in user. GET returns current stats (for the in-app rating badge).

const GAME = "chess";

const expected = (r: number, opp: number) => 1 / (1 + Math.pow(10, (opp - r) / 400));
const kFactor = (played: number, rating: number) => (played < 15 ? 40 : rating >= 2100 ? 16 : 24);

export async function GET() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ signedIn: false });
  const { data } = await sb
    .from("game_stats")
    .select("rating,played,wins,losses,draws,best_accuracy")
    .eq("user_id", user.id).eq("game", GAME).maybeSingle();
  return NextResponse.json({
    signedIn: true,
    stats: data ?? { rating: 1200, played: 0, wins: 0, losses: 0, draws: 0, best_accuracy: null },
  });
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ saved: false, reason: "not-signed-in" });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ saved: false, reason: "bad-json" }, { status: 400 }); }

  const result = body.result;
  if (result !== "win" && result !== "loss" && result !== "draw")
    return NextResponse.json({ saved: false, reason: "bad-result" }, { status: 400 });

  const oppRating = Math.max(100, Math.min(3200, Number(body.oppRating) || 1200));
  const accuracy = body.accuracy == null ? null : Math.max(0, Math.min(100, Number(body.accuracy)));
  const color = body.color === "b" ? "b" : "w";
  const level = String(body.level ?? "").slice(0, 40);
  const moves = String(body.moves ?? "").slice(0, 4000);

  const { data: cur } = await sb
    .from("game_stats")
    .select("rating,played,wins,losses,draws,best_accuracy")
    .eq("user_id", user.id).eq("game", GAME).maybeSingle();

  const ratingBefore = cur?.rating ?? 1200;
  const played = cur?.played ?? 0;
  const score = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
  const ratingAfter = Math.round(ratingBefore + kFactor(played, ratingBefore) * (score - expected(ratingBefore, oppRating)));
  const best = accuracy == null ? (cur?.best_accuracy ?? null) : Math.max(cur?.best_accuracy ?? 0, accuracy);

  const { error } = await sb.from("game_stats").upsert({
    user_id: user.id, game: GAME, rating: ratingAfter, played: played + 1,
    wins: (cur?.wins ?? 0) + (result === "win" ? 1 : 0),
    losses: (cur?.losses ?? 0) + (result === "loss" ? 1 : 0),
    draws: (cur?.draws ?? 0) + (result === "draw" ? 1 : 0),
    best_accuracy: best, updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,game" });

  // archive the game (best-effort; don't fail the rating update over it)
  await sb.from("chess_games").insert({
    user_id: user.id, color, opponent: "bot", level, result, accuracy, rating_after: ratingAfter, moves,
  });

  if (error) return NextResponse.json({ saved: false, reason: error.message });
  return NextResponse.json({ saved: true, ratingBefore, ratingAfter, delta: ratingAfter - ratingBefore });
}
