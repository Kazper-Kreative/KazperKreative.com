import type { Metadata } from "next";
import LabChessClient from "@/components/site/LabChessClient";

export const metadata: Metadata = {
  title: "The Study",
  robots: { index: false, follow: false },
};

export default function LabChessPage() {
  return <LabChessClient />;
}
