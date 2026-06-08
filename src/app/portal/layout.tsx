import type { Metadata } from "next";
import { getBillingIdentity } from "@/lib/billing/access";
import PortalLogin from "@/components/billing/PortalLogin";

export const metadata: Metadata = {
  title: "Client Portal · Kazper Kreative",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Standalone (no site chrome), like /inbox. Gate: must be signed in.
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await getBillingIdentity();
  if (!userId) return <PortalLogin next="/portal" />;
  return <>{children}</>;
}
