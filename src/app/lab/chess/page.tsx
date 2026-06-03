import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Study · The Lab",
  robots: { index: false, follow: false },
};

// Gate + lab chrome come from src/app/lab/layout.tsx. The trainer itself is a
// self-contained static app framed same-origin (see public/lab/chess/app.html).
export default function LabChessPage() {
  return (
    <iframe
      src="/lab/chess/app.html"
      title="The Study — Stockfish chess trainer"
      style={{ display: "block", width: "100%", height: "calc(100dvh - var(--lab-bar, 56px))", border: 0 }}
    />
  );
}
