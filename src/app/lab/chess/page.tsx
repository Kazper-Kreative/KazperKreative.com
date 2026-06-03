import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Study · The Lab",
  robots: { index: false, follow: false },
};

// Gate + lab chrome come from src/app/lab/layout.tsx. The trainer itself is a
// self-contained static app framed same-origin (see public/lab-assets/chess/app.html).
// A `?room=<id>` param flips it into 1v1 multiplayer via `?mp=1&room=<id>`.
export default async function LabChessPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  const sp = await searchParams;
  const room = typeof sp.room === "string" ? sp.room : "";
  const src = room
    ? `/lab-assets/chess/app.html?mp=1&room=${encodeURIComponent(room)}`
    : "/lab-assets/chess/app.html";
  return (
    <iframe
      src={src}
      title="The Study — Stockfish chess trainer"
      style={{ display: "block", width: "100%", height: "calc(100dvh - var(--lab-bar, 56px))", border: 0 }}
    />
  );
}
