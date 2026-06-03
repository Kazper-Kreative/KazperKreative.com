import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Crossing · The Lab",
  robots: { index: false, follow: false },
};

// Gate + lab chrome come from src/app/lab/layout.tsx. The trainer is a
// self-contained static app framed same-origin (see public/lab/checkers/app.html).
export default function LabCheckersPage() {
  return (
    <iframe
      src="/lab/checkers/app.html"
      title="The Crossing — checkers trainer"
      style={{ display: "block", width: "100%", height: "calc(100dvh - var(--lab-bar, 56px))", border: 0 }}
    />
  );
}
