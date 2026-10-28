"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LocalTime from "@/components/kazper/LocalTime";
import type { ActionRow } from "@/lib/kazper/data";

// Kazper's recent calendar changes, newest first, each undoable while it still stands.
export default function CalendarChanges({ changes }: { changes: ActionRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const undo = async (id: number) => {
    setBusy(id);
    setError(null);
    const res = await fetch("/api/kazper/undo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_id: id }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) setError((data as { message?: string; error?: string }).message ?? "Couldn't undo that.");
    router.refresh();
  };

  return (
    <section className="kz-panel">
      <h2>Recent changes <span className="kz-count">{changes.length}</span></h2>
      {error && <div className="kz-notice error"><span>{error}</span></div>}
      {changes.length === 0 ? (
        <p className="dim kz-help">Nothing yet. Every change Kazper makes to his calendar shows up here.</p>
      ) : (
        <ul className="kz-rows">
          {changes.map((a) => (
            <li key={a.id} className={`kz-row${a.status === "undone" ? " kz-undone" : ""}`}>
              <span className="kz-row-id mono">#{a.id}</span>
              <span className="kz-row-text">
                {a.summary}
                <span className="kz-row-sub dim">
                  <LocalTime iso={a.created_at} />
                  {a.status === "undone" && " · undone"}
                </span>
              </span>
              <span className="kz-row-actions">
                {a.status === "done" && a.kind !== "calendar.create" && (
                  <button className="kz-link" disabled={busy === a.id} onClick={() => void undo(a.id)}>
                    {busy === a.id ? "Undoing…" : "Undo"}
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
