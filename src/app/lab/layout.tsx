import LabLogin from "@/components/site/LabLogin";
import LabSubscribe from "@/components/site/LabSubscribe";
import LabShell from "@/components/site/LabShell";
import { getLabAccess } from "@/lib/supabase/server";

// Server-side gate for the whole Lab. The game bundle under /lab-assets is
// independently hard-gated in middleware, so even the iframe can't load assets
// without entitlement — this layer is the UX (login / subscribe / enter).
export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const { userId, email, entitled } = await getLabAccess();
  if (!userId) return <LabLogin />;
  if (!entitled) return <LabSubscribe email={email} />;
  return <LabShell>{children}</LabShell>;
}
