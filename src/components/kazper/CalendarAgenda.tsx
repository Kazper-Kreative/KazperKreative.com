// Agenda view of Kazper's deadlines calendar (and optionally all of yours). Pure render:
// the calendar page fetches the data from the runtime.
import Link from "next/link";
import CalendarChanges from "@/components/kazper/CalendarChanges";
import type { ActionRow } from "@/lib/kazper/data";

export interface Deadline {
  event_id: string;
  title: string;
  due: string; // YYYY-MM-DD or an ISO datetime
  area: string | null;
  notes: string | null;
}

export interface CalEvent {
  calendar: string;
  title: string;
  start: string;
  end: string;
  location: string | null;
  all_day?: boolean;
}

export interface CalendarView {
  connected: boolean;
  error?: string;
  name?: string;
  color?: string | null;
  timezone?: string;
  deadlines?: Deadline[];
  events?: CalEvent[];
}

// Same colours Kazper gives each area on Google Calendar.
const AREA_COLORS: Record<string, string> = {
  SensorOps: "#3f51b5",
  Nexxverse: "#8e24aa",
  SoB: "#d50000",
  "Kazper Kreative": "#f4511e",
  Personal: "#33b679",
  Other: "#616161",
};

type Item =
  | { type: "deadline"; key: string; time: string | null; sort: string; d: Deadline }
  | { type: "event"; key: string; time: string | null; sort: string; e: CalEvent };

export default function CalendarAgenda({ cal, all, changes }: { cal: CalendarView; all: boolean; changes: ActionRow[] }) {
  const tz = cal.timezone ?? "America/New_York";
  const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const timeFmt = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  const headFmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "short", day: "numeric" });
  const today = dayKey.format(new Date());
  const place = (iso: string): { key: string; time: string | null } =>
    /^\d{4}-\d{2}-\d{2}$/.test(iso) ? { key: iso, time: null } : { key: dayKey.format(new Date(iso)), time: timeFmt.format(new Date(iso)) };

  const items: Item[] = [
    ...(cal.deadlines ?? []).map((d) => ({ type: "deadline" as const, ...place(d.due), sort: d.due, d })),
    ...(all ? cal.events ?? [] : []).map((e) => ({ type: "event" as const, ...place(e.start), sort: e.start, e })),
  ].sort((a, b) => a.sort.localeCompare(b.sort));

  const overdue = items.filter((i) => i.type === "deadline" && i.key < today);
  const upcoming = items.filter((i) => i.key >= today);
  const days = [...new Set(upcoming.map((i) => i.key))];
  const heading = (key: string) => {
    const label = headFmt.format(new Date(`${key}T12:00:00Z`));
    return key === today ? `Today · ${label}` : label;
  };

  const row = (i: Item) =>
    i.type === "deadline" ? (
      <li key={`d-${i.d.event_id}`} className="kz-agenda-item">
        <span className="kz-swatch" style={{ background: AREA_COLORS[i.d.area ?? "Other"] ?? AREA_COLORS.Other }} />
        <span className="kz-agenda-time mono">{i.time ?? "Due"}</span>
        <span className="kz-agenda-text">
          {i.d.title}
          {i.d.notes && <span className="kz-row-sub dim">{i.d.notes}</span>}
        </span>
      </li>
    ) : (
      <li key={`e-${i.e.calendar}-${i.e.start}-${i.e.title}`} className="kz-agenda-item kz-agenda-event">
        <span className="kz-swatch hollow" />
        <span className="kz-agenda-time mono">{i.time ?? "All day"}</span>
        <span className="kz-agenda-text">
          {i.e.title}
          <span className="kz-row-sub dim">{i.e.calendar}{i.e.location ? ` · ${i.e.location}` : ""}</span>
        </span>
      </li>
    );

  return (
    <div className="kz-page">
      <div className="kz-cal-head">
        <h1 className="kz-h">
          {cal.color && <span className="kz-cal-dot" style={{ background: cal.color }} />}
          {cal.name ?? "Calendar"}
        </h1>
        <div className="kz-segment" role="tablist">
          <Link href="/kazper/calendar" className={all ? "" : "on"} role="tab" aria-selected={!all}>Deadlines</Link>
          <Link href="/kazper/calendar?view=all" className={all ? "on" : ""} role="tab" aria-selected={all}>Everything</Link>
        </div>
      </div>

      {!cal.connected && (
        <div className="kz-notice"><span>Kazper&apos;s Google Calendar isn&apos;t connected.</span></div>
      )}
      {cal.error && <div className="kz-notice error"><span>{cal.error}</span></div>}

      {overdue.length > 0 && (
        <section className="kz-panel kz-overdue">
          <h2>Overdue <span className="kz-count">{overdue.length}</span></h2>
          <ul className="kz-agenda">{overdue.map(row)}</ul>
        </section>
      )}

      {cal.connected && !cal.error && (
        <section className="kz-panel">
          <h2>Next 30 days</h2>
          {days.length === 0 ? (
            <p className="dim kz-help">
              Nothing coming up. Tell Kazper about a deadline, or ask him to pull them from your mail and calendars.
            </p>
          ) : (
            days.map((key) => (
              <div key={key} className="kz-agenda-day">
                <h3 className={key === today ? "today" : ""}>{heading(key)}</h3>
                <ul className="kz-agenda">{upcoming.filter((i) => i.key === key).map(row)}</ul>
              </div>
            ))
          )}
        </section>
      )}

      <CalendarChanges changes={changes} />
    </div>
  );
}
