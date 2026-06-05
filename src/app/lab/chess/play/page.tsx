import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play · The Study",
  robots: { index: false, follow: false },
};

// The board itself — the "Play" mode of The Study. Self-contained static app
// framed same-origin (public/lab-assets/chess/app.html). `?room=<id>` flips it
// into 1v1 via `?mp=1&room=<id>`. The chess home lives at /lab/chess.
export default async function StudyPlayPage({
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
