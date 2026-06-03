import type { Metadata } from "next";
import { notFound } from "next/navigation";

// One route for every arcade game. Chess/checkers keep their own folders
// (static segments win over [game]). Assets are hard-gated under /lab-assets.
// MP-capable games forward ?room= → the static app's ?mp=1&room= (vs a friend).
const GAMES: Record<string, { name: string; game: string; mp?: boolean }> = {
  trine: { name: "Trine", game: "Tic-Tac-Toe", mp: true },
  cascade: { name: "Cascade", game: "Connect Four", mp: true },
  enclosure: { name: "Enclosure", game: "Dots & Boxes", mp: true },
  bullseye: { name: "Bullseye", game: "Darts", mp: true },
  serpent: { name: "Serpent", game: "Snake" },
  phosphor: { name: "Phosphor", game: "Maze" },
  updraft: { name: "Updraft", game: "Flappy" },
  sapper: { name: "Sapper", game: "Minesweeper" },
  solitude: { name: "Solitude", game: "Solitaire" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  const g = GAMES[game];
  return {
    title: g ? `${g.name} · The Lab` : "The Lab",
    robots: { index: false, follow: false },
  };
}

export default async function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  const { game } = await params;
  const g = GAMES[game];
  if (!g) notFound();

  const sp = await searchParams;
  const room = g.mp && typeof sp.room === "string" ? sp.room : "";
  const src = room
    ? `/lab-assets/${game}/app.html?mp=1&room=${encodeURIComponent(room)}`
    : `/lab-assets/${game}/app.html`;

  return (
    <iframe
      src={src}
      title={`${g.name} — ${g.game}`}
      style={{ display: "block", width: "100%", height: "calc(100dvh - var(--lab-bar, 56px))", border: 0 }}
    />
  );
}
