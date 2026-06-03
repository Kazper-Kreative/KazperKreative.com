import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Crossing · The Lab",
  robots: { index: false, follow: false },
};

// Gate + lab chrome come from src/app/lab/layout.tsx. The trainer is a
// self-contained static app framed same-origin (see public/lab/checkers/app.html).
// A `?room=<id>` param flips it into 1v1 multiplayer via `?mp=1&room=<id>`.
export default async function LabCheckersPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  const sp = await searchParams;
  const room = typeof sp.room === "string" ? sp.room : "";
  const src = room
    ? `/lab/checkers/app.html?mp=1&room=${encodeURIComponent(room)}`
    : "/lab/checkers/app.html";
  return (
    <iframe
      src={src}
      title="The Crossing — checkers trainer"
      style={{ display: "block", width: "100%", height: "calc(100dvh - var(--lab-bar, 56px))", border: 0 }}
    />
  );
}
