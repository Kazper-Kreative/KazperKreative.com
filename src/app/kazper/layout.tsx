import type { Metadata } from "next";
import KazperLogin from "@/components/kazper/KazperLogin";
import KazperShell from "@/components/kazper/KazperShell";
import { getKazperOwner } from "@/lib/kazper/access";

// Kazper's home outside Discord. Installable as its own app (phone home screen,
// desktop "Install app") via /kazper.webmanifest, separate from the Lab's PWA.
export const metadata: Metadata = {
  title: "Kazper",
  robots: { index: false, follow: false },
  manifest: "/kazper.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Kazper" },
};

export const dynamic = "force-dynamic";

export default async function KazperLayout({ children }: { children: React.ReactNode }) {
  const { userId, isOwner } = await getKazperOwner();
  if (!userId) {
    return <KazperLogin />;
  }
  if (!isOwner) {
    return (
      <div className="lock">
        <div className="lock-card">
          <img src="/assets/k-mark.png" alt="Kazper" />
          <h3>Not yours</h3>
          <p className="dim" style={{ fontSize: 14, marginTop: 6 }}>
            Kazper only opens for his owner.
          </p>
        </div>
      </div>
    );
  }
  return <KazperShell>{children}</KazperShell>;
}
