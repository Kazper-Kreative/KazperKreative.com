"use client";

import LabGate from "@/components/site/LabGate";

// One gate for the whole Lab: the hub and every tool route under /lab
// inherit this. Standalone (no marketing-site chrome), like /inbox.
export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <LabGate>{children}</LabGate>;
}
