import type { Metadata } from "next";
import { getBillingIdentity } from "@/lib/billing/access";
import PortalLogin from "@/components/billing/PortalLogin";

export const metadata: Metadata = {
  title: "Admin · Kazper Kreative",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Staff-only. Signed-out → login; signed-in non-staff → not authorized.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, isStaff } = await getBillingIdentity();
  if (!userId) {
    return <PortalLogin next="/admin/billing" title="Kazper Admin" blurb="Staff sign-in." />;
  }
  if (!isStaff) {
    return (
      <div className="lock">
        <div className="lock-card">
          <img src="/assets/k-mark.png" alt="Kazper Kreative" />
          <h3>Not authorized</h3>
          <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
            This area is for Kazper Kreative staff.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
