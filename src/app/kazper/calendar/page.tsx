import CalendarAgenda, { type CalendarView } from "@/components/kazper/CalendarAgenda";
import { getKazperOwner } from "@/lib/kazper/access";
import { recentActions } from "@/lib/kazper/data";
import { callRuntime, runtimeConfigured } from "@/lib/kazper/runtime";

// Kazper's own deadlines calendar, optionally merged with all of yours. Google is
// only reachable from the runtime (it holds the Google sign-in), so this page asks
// the runtime server-side; nothing about Google touches the browser.
export default async function KazperCalendarPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const all = view === "all";
  const { isOwner } = await getKazperOwner();
  if (!isOwner) return null;

  let cal: CalendarView = { connected: false };
  if (runtimeConfigured()) {
    try {
      cal = (await callRuntime("/v1/calendar", { days_ahead: 30, days_back: 7, include_all: all })).data as CalendarView;
    } catch {
      cal = { connected: true, error: "Couldn't reach Kazper's runtime." };
    }
  }
  return <CalendarAgenda cal={cal} all={all} changes={await recentActions(12)} />;
}
