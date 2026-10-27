"use client";

import { useSyncExternalStore } from "react";

function format(iso: string): string {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const noop = () => () => {};

// Times in the viewer's own timezone. Empty during SSR: the server renders in UTC
// (Vercel), so formatting there would show the wrong time and break hydration.
export default function LocalTime({ iso }: { iso: string }) {
  const inBrowser = useSyncExternalStore(noop, () => true, () => false);
  return <time dateTime={iso}>{inBrowser ? format(iso) : ""}</time>;
}
