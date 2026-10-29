import ForgeBoard from "@/components/kazper/ForgeBoard";
import { callForge, forgeConfigured, type ForgeJob, type ForgeStatus } from "@/lib/kazper/forge";

// The forge is a separate service; the page still renders (with a notice) if it's down or not connected.
async function load(): Promise<{ status: ForgeStatus; jobs: ForgeJob[] } | string> {
  if (!forgeConfigured()) return "The forge isn't connected yet: set FORGE_URL and FORGE_API_SECRET in Vercel.";
  try {
    const [s, j] = await Promise.all([
      callForge("GET", "status"),
      callForge("GET", "jobs", { query: new URLSearchParams({ limit: "30" }) }),
    ]);
    if (s.status !== 200 || j.status !== 200) return `The forge answered ${s.status}/${j.status}.`;
    return { status: s.data as ForgeStatus, jobs: (j.data as { jobs: ForgeJob[] }).jobs };
  } catch {
    return "Couldn't reach the forge.";
  }
}

// Kazper's forge: the code he writes and ships for Project Ding Dong.
export default async function KazperForgePage() {
  const data = await load();
  return (
    <div className="kz-page">
      <h1 className="kz-h">Forge</h1>
      <p className="dim kz-lede">Where Kazper builds Project Ding Dong. Updates every few seconds.</p>
      {typeof data === "string" ? (
        <div className="kz-notice error"><span>{data}</span></div>
      ) : (
        <ForgeBoard initialStatus={data.status} initialJobs={data.jobs} />
      )}
    </div>
  );
}
