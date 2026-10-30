"use client";

import { useCallback, useEffect, useState } from "react";
import LocalTime from "@/components/kazper/LocalTime";

interface Lesson {
  id: string;
  text: string;
  status: "proposed" | "added" | "dismissed";
  source: "seed" | "review";
  first_seen: string;
  added_at: string;
  seen: number;
  recurrences: number;
  recommended: boolean;
}

interface LessonsView {
  queue: Lesson[];
  playbook: Lesson[];
  dismissed: number;
}

interface Growth {
  weekly: { week: string; prs: number; first_try: number; first_try_rate: number; avg_rounds: number }[];
  exams: { at: string; version: string; score: number; passed: boolean }[];
}

const API = "/api/kazper/forge";

async function call<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}/${path}`, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `forge returned ${res.status}`);
  return data as T;
}

// Is Kazper actually getting better? Lessons from reviews wait here for Mason; added ones go into the
// playbook every job reads, and each shows whether the mistake behind it ever came back.
export default function LearningPanel() {
  const [view, setView] = useState<LessonsView | null>(null);
  const [growth, setGrowth] = useState<Growth | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [l, g] = await Promise.all([call<Partial<LessonsView>>("lessons"), call<Partial<Growth>>("growth")]);
      setView({ queue: l.queue ?? [], playbook: l.playbook ?? [], dismissed: l.dismissed ?? 0 });
      setGrowth({ weekly: g.weekly ?? [], exams: g.exams ?? [] });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, path: string, body: Record<string, unknown> = {}) => {
    setBusy(id);
    try {
      await call(path, body);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="kz-panel">
      <h2>Learning</h2>
      <p className="dim kz-help">
        Every review can propose a lesson. Lessons proposed again by later reviews rise to the top. Add the good
        ones to the playbook every job reads; each then shows whether the mistake behind it came back.
      </p>
      {error && <p className="kz-forge-error">{error}</p>}

      {growth && growth.weekly.length > 0 && (
        <table className="kz-forge-growth">
          <thead><tr><th>Week of</th><th>PRs</th><th>First try</th><th>Rounds per PR</th></tr></thead>
          <tbody>
            {growth.weekly.map((w) => (
              <tr key={w.week}>
                <td>{w.week}</td>
                <td>{w.prs}</td>
                <td>{Math.round(w.first_try_rate * 100)}%</td>
                <td>{w.avg_rounds.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {growth && growth.exams.length > 0 && (
        <div className="kz-meta">
          {growth.exams.map((e) => (
            <span key={e.at} className={`kz-chip ${e.passed ? "kz-forge-ok" : "kz-forge-wait"}`}>
              exam {e.version}: {Math.round(e.score * 100)}%
            </span>
          ))}
        </div>
      )}

      <h3 className="kz-forge-sub">Proposed lessons {view && <span className="kz-count">{view.queue.length}</span>}</h3>
      {view && view.queue.length === 0 && <p className="dim kz-row-empty">Nothing waiting.</p>}
      {view?.queue.map((l) => (
        <div key={l.id} className="kz-forge-ask">
          {editing?.id === l.id ? (
            <textarea className="kz-row-edit" rows={3} aria-label="Lesson text" value={editing.text}
              onChange={(e) => setEditing({ id: l.id, text: e.target.value })} />
          ) : (
            <p className="kz-row-text">{l.text}</p>
          )}
          <div className="kz-meta">
            {l.recommended && <span className="kz-chip kz-forge-wait">recommended</span>}
            <span>seen {l.seen}×</span>
            <span>first <LocalTime iso={l.first_seen} /></span>
          </div>
          <div className="kz-row-actions">
            {editing?.id === l.id ? (
              <>
                <button className="kz-link" disabled={busy !== null || !editing.text.trim()}
                  onClick={() => void act(l.id, `lessons/${l.id}/add`, { text: editing.text })}>Add to playbook</button>
                <button className="kz-link" onClick={() => setEditing(null)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="kz-link" disabled={busy !== null}
                  onClick={() => void act(l.id, `lessons/${l.id}/add`)}>Add to playbook</button>
                <button className="kz-link" onClick={() => setEditing({ id: l.id, text: l.text })}>Edit &amp; add</button>
                <button className="kz-link danger" disabled={busy !== null}
                  onClick={() => void act(l.id, `lessons/${l.id}/dismiss`)}>Dismiss</button>
              </>
            )}
          </div>
        </div>
      ))}

      <h3 className="kz-forge-sub">Playbook {view && <span className="kz-count">{view.playbook.length}</span>}</h3>
      <ul className="kz-forge-playbook">
        {view?.playbook.map((l) => (
          <li key={l.id}>
            <span>{l.text}</span>
            <span className={`kz-chip ${l.recurrences ? "kz-forge-bad" : "kz-forge-ok"}`}>
              {l.recurrences ? `came back ${l.recurrences}×` : "no repeats"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
