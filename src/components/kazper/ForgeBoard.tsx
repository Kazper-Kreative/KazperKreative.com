"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LocalTime from "@/components/kazper/LocalTime";
import type { AuditEntry, ForgeJob, ForgeStatus, JobStatus } from "@/lib/kazper/forge";

const API = "/api/kazper/forge";
const POLL_MS = 5000;
const ORG = "Kazper-Kreative";

const STATUS: Record<JobStatus, { label: string; tone: "live" | "ok" | "wait" | "bad" | "dim" }> = {
  queued: { label: "Queued", tone: "dim" },
  running: { label: "Running", tone: "live" },
  pr_open: { label: "Waiting for CI", tone: "live" },
  reviewing: { label: "In review", tone: "live" },
  merged: { label: "Merged", tone: "ok" },
  changes_requested: { label: "Sent back", tone: "wait" },
  closed: { label: "Closed", tone: "dim" },
  awaiting_approval: { label: "Needs your OK", tone: "wait" },
  done: { label: "Done", tone: "ok" },
  failed: { label: "Failed", tone: "bad" },
  stopped: { label: "Stopped", tone: "dim" },
  denied: { label: "Denied", tone: "dim" },
};

const INSTRUCTOR = { every: "Every PR", sample: "1 in 5", off: "Graduated" } as const;

function money(x: number): string {
  return x >= 1 ? `$${x.toFixed(2)}` : `$${x.toFixed(4)}`;
}

async function forge<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}/${path}`, { cache: "no-store", ...init, headers: { "Content-Type": "application/json" } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `forge returned ${res.status}`);
  return data as T;
}

const post = <T,>(path: string, body: Record<string, unknown> = {}) =>
  forge<T>(path, { method: "POST", body: JSON.stringify(body) });

function Status({ status }: { status: JobStatus }) {
  const s = STATUS[status] ?? { label: status, tone: "dim" };
  return <span className={`kz-chip kz-forge-${s.tone}`}>{s.label}</span>;
}

// Kazper's forge: what it's doing, what it costs, what waits for Mason, and the brakes.
export default function ForgeBoard({ initialStatus, initialJobs }: { initialStatus: ForgeStatus; initialJobs: ForgeJob[] }) {
  const [status, setStatus] = useState(initialStatus);
  const [jobs, setJobs] = useState(initialJobs);
  const [open, setOpen] = useState<string | null>(null);
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [audit, setAudit] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [repo, setRepo] = useState("dingdong-sandbox");
  const [task, setTask] = useState("");
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const refresh = useCallback(async () => {
    try {
      const [s, j] = await Promise.all([forge<ForgeStatus>("status"), forge<{ jobs: ForgeJob[] }>("jobs?limit=30")]);
      setStatus(s);
      setJobs(j.jobs);
      const id = openRef.current;
      if (id) {
        const l = await forge<{ lines: string[] }>(`jobs/${id}/logs`);
        setLogs((prev) => ({ ...prev, [id]: l.lines }));
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const act = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    try {
      await fn();
      setConfirm(null);
      setReason("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (id: string) => {
    if (open === id) return setOpen(null);
    setOpen(id);
    try {
      const l = await forge<{ lines: string[] }>(`jobs/${id}/logs`);
      setLogs((prev) => ({ ...prev, [id]: l.lines }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const start = () =>
    act("start", async () => {
      const name = repo.trim().includes("/") ? repo.trim() : `${ORG}/${repo.trim()}`;
      await post("jobs", { repo: name, task: task.trim() });
      setTask("");
    });

  const waiting = jobs.filter((j) => j.status === "awaiting_approval");
  const { spent_usd, cap_usd } = status.budget;
  const pct = cap_usd ? Math.min(100, Math.round((100 * spent_usd) / cap_usd)) : 0;

  return (
    <>
      {error && (
        <div className="kz-notice error" role="alert">
          <span>{error}</span>
          <button className="kz-link" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {status.halted && (
        <div className="kz-notice error">
          <span>🛑 The forge is halted ({status.halted}). Running jobs stop at their next step; new jobs are refused.</span>
          <button className="btn btn-ghost kz-chip-btn" disabled={busy === "halt"}
            onClick={() => void act("halt", () => post("halt", { on: false }))}>
            Resume
          </button>
        </div>
      )}

      <div className="kz-tiles">
        <div className="kz-tile">
          <span className="kz-tile-label">This month</span>
          <span className="kz-tile-value">{money(spent_usd)}</span>
          <div className={`kz-progress${pct >= 80 ? " kz-progress-warn" : ""}`} aria-label={`${pct}% of the cap`}>
            <span style={{ width: `${Math.max(pct, 1)}%` }} />
          </div>
          <span className="kz-tile-sub dim">of {money(cap_usd)} cap</span>
        </div>
        <div className="kz-tile">
          <span className="kz-tile-label">Running</span>
          <span className="kz-tile-value">{status.running ? "1" : "Idle"}</span>
          <span className="kz-tile-sub dim kz-forge-clip">{status.running?.task ?? "nothing right now"}</span>
        </div>
        <div className="kz-tile">
          <span className="kz-tile-label">Instructor</span>
          <span className="kz-tile-value">{INSTRUCTOR[status.instructor?.mode ?? "every"]}</span>
          <span className="kz-tile-sub dim">
            {status.instructor
              ? `${status.instructor.clean_streak}/${status.instructor.goal} clean ships · exam ${status.instructor.exam_passed ? "passed" : "not yet"}`
              : `${status.queued} queued`}
          </span>
        </div>
        <div className="kz-tile">
          <span className="kz-tile-label">Needs your OK</span>
          <span className="kz-tile-value">{waiting.length}</span>
        </div>
      </div>

      {waiting.length > 0 && (
        <section className="kz-panel kz-forge-waiting">
          <h2>Needs your OK <span className="kz-count">{waiting.length}</span></h2>
          {waiting.map((j) => (
            <div key={j.id} className="kz-forge-ask">
              <p className="kz-row-text">{j.task}</p>
              <div className="kz-meta">
                {j.gates.map((g) => <span key={g} className="kz-chip kz-forge-wait">{g}</span>)}
                {j.pr_url && <a href={j.pr_url} target="_blank" rel="noreferrer" className="kz-link">Review the PR ↗</a>}
              </div>
              {confirm === `approve:${j.id}` ? (
                <div className="kz-forge-confirm">
                  <span>Let this ship?</span>
                  <button className="btn btn-primary kz-chip-btn" disabled={busy !== null}
                    onClick={() => void act(`approve:${j.id}`, () => post(`jobs/${j.id}/approve`))}>Yes, approve</button>
                  <button className="kz-link" onClick={() => setConfirm(null)}>Cancel</button>
                </div>
              ) : confirm === `deny:${j.id}` ? (
                <div className="kz-forge-confirm">
                  <input className="kz-row-edit" placeholder="Why not? (optional, goes on the PR)" value={reason}
                    onChange={(e) => setReason(e.target.value)} />
                  <button className="btn btn-ghost kz-chip-btn" disabled={busy !== null}
                    onClick={() => void act(`deny:${j.id}`, () => post(`jobs/${j.id}/deny`, { reason }))}>Deny and close PR</button>
                  <button className="kz-link" onClick={() => setConfirm(null)}>Cancel</button>
                </div>
              ) : (
                <div className="kz-row-actions">
                  <button className="kz-link" onClick={() => setConfirm(`approve:${j.id}`)}>Approve</button>
                  <button className="kz-link danger" onClick={() => setConfirm(`deny:${j.id}`)}>Deny</button>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      <section className="kz-panel">
        <h2>Jobs <span className="kz-count">{jobs.length}</span></h2>
        {jobs.length === 0 ? (
          <p className="dim kz-row-empty">No jobs yet. Ask Kazper to build something, or give the forge a job below.</p>
        ) : (
          <div className="kz-history">
            {jobs.map((j) => (
              <details key={j.id} open={open === j.id}>
                <summary onClick={(e) => { e.preventDefault(); void toggle(j.id); }}>
                  <Status status={j.status} />
                  <span className="kz-history-q">{j.task}</span>
                  <span className="kz-meta">
                    <LocalTime iso={j.created_at} />
                    <span>{j.repo.split("/")[1]}</span>
                    {j.round ? <span>round {j.round}</span> : null}
                    {j.steps > 0 && <span>{j.steps} steps</span>}
                    {j.cost_usd > 0 && <span>{money(j.cost_usd)}</span>}
                    {j.pr_url && <a href={j.pr_url} target="_blank" rel="noreferrer" className="kz-link"
                      onClick={(e) => e.stopPropagation()}>PR ↗</a>}
                  </span>
                </summary>
                {open === j.id && (
                  <div className="kz-history-body">
                    {j.summary && <p>{j.summary}</p>}
                    {j.review && (
                      <p className={`kz-forge-review ${j.review.verdict}`}>
                        <strong>Instructor: {j.review.verdict}.</strong> {j.review.reasons}
                        {j.review.lesson && <span className="kz-row-sub">Lesson: {j.review.lesson}</span>}
                      </p>
                    )}
                    {j.round ? <span className="dim kz-row-sub">Follow-up round {j.round} of job {j.parent_id}</span> : null}
                    {j.error && <p className="kz-forge-error">{j.error}</p>}
                    {(j.status === "queued" || j.status === "running") && (
                      <div className="kz-row-actions">
                        <button className="kz-link danger" disabled={busy !== null}
                          onClick={() => void act(`stop:${j.id}`, () => post(`jobs/${j.id}/stop`))}>Stop this job</button>
                      </div>
                    )}
                    <pre className="kz-forge-log">{(logs[j.id] ?? []).join("\n") || "(no log yet)"}</pre>
                    <span className="dim kz-row-sub">Job {j.id}</span>
                  </div>
                )}
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="kz-panel">
        <h2>Give the forge a job</h2>
        <p className="dim kz-help">
          Usually Kazper does this himself. Only {ORG}/dingdong-* repos; write it like a ticket.
        </p>
        <div className="kz-add">
          <input aria-label="Repo" value={repo} onChange={(e) => setRepo(e.target.value)} />
        </div>
        <div className="kz-fix">
          <textarea aria-label="Task" rows={3} value={task} placeholder="What to change, why, and how to check it"
            onChange={(e) => setTask(e.target.value)} />
          <div>
            <button className="btn btn-primary" disabled={!task.trim() || !repo.trim() || busy !== null || !!status.halted}
              onClick={() => void start()}>Start job</button>
          </div>
        </div>
      </section>

      <section className="kz-panel">
        <h2>Kill switch</h2>
        <p className="dim kz-help">
          Stops the running job before its next step and refuses new ones until you resume. It doesn&apos;t touch
          Kazper himself or anything already merged.
        </p>
        {status.halted ? (
          <p className="kz-help">The forge is halted. Use Resume at the top to turn it back on.</p>
        ) : confirm === "halt" ? (
          <div className="kz-forge-confirm">
            <span>Halt the forge now?</span>
            <button className="btn btn-primary kz-chip-btn" disabled={busy !== null}
              onClick={() => void act("halt", () => post("halt", { on: true }))}>Yes, halt it</button>
            <button className="kz-link" onClick={() => setConfirm(null)}>Cancel</button>
          </div>
        ) : (
          <div>
            <button className="btn btn-ghost kz-forge-halt" onClick={() => setConfirm("halt")}>🛑 Stop everything</button>
          </div>
        )}
      </section>

      <section className="kz-panel">
        <h2>Audit log {audit && <span className="kz-count">{audit.length}</span>}</h2>
        {audit === null ? (
          <div>
            <button className="btn btn-ghost kz-chip-btn"
              onClick={() => void act("audit", async () => setAudit((await forge<{ entries: AuditEntry[] }>("audit?limit=200")).entries.reverse()))}>
              Show the audit log
            </button>
          </div>
        ) : audit.length === 0 ? (
          <p className="dim kz-row-empty">Nothing recorded yet.</p>
        ) : (
          <ul className="kz-forge-audit">
            {audit.map((e, i) => (
              <li key={`${e.at}-${i}`}>
                <LocalTime iso={e.at} />
                <span className="kz-forge-kind">{e.kind}</span>
                <span className="dim">{[e.job_id, e.detail.by, e.detail.status, e.detail.reason].filter(Boolean).join(" · ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
