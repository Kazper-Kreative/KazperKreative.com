"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LocalTime from "@/components/kazper/LocalTime";
import Markdown from "@/components/kazper/Markdown";
import { getSupabase } from "@/lib/supabase/client";
import type { Exchange } from "@/lib/kazper/data";

interface Note {
  id: number;
  text: string;
  deleted?: boolean;
}

// What only this browser session knows about an exchange (the runtime returns it with the reply).
interface Extra {
  notes?: Note[];
  tools?: string[];
  rating?: "good" | "bad";
  fixed?: boolean;
}

interface TurnResponse {
  exchange_id: number | null;
  reply: string | null;
  error: string | null;
  kind: Exchange["kind"];
  notes: Note[];
  tools: string[];
  usage: { cost_usd: number | null } | null;
}

const TOOL_LABELS: Record<string, string> = {
  history_search: "searched history",
  history_read: "read past messages",
  leave_pointer: "left a pointer",
  clear_pointer: "cleared a pointer",
  remember: "saved a note",
};

function toolLabel(name: string): string {
  if (TOOL_LABELS[name]) return TOOL_LABELS[name];
  const [source] = name.split("_");
  return `checked ${source}`;
}

function askedLabel(ex: Exchange): string {
  if (ex.kind === "briefing") return "☀️ Briefing";
  if (ex.kind === "review") return "🔁 Weekly review";
  return ex.user_text;
}

async function post(action: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/kazper/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data;
}

export default function KazperChat({ initial }: { initial: Exchange[] }) {
  const router = useRouter();
  const [local, setLocal] = useState<Exchange[]>([]); // replies received in this session, until the server catches up
  const [extras, setExtras] = useState<Record<number, Extra>>({});
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<{ label: string } | null>(null);
  const [notice, setNotice] = useState<{ message: string; tone: "info" | "error"; retry?: () => void } | null>(null);
  const [fixing, setFixing] = useState<number | null>(null);
  const [fixText, setFixText] = useState("");

  const exchanges = useMemo(() => {
    const byId = new Map<number, Exchange>();
    for (const ex of [...initial, ...local]) byId.set(ex.id, ex);
    return [...byId.values()].sort((a, b) => a.id - b.id);
  }, [initial, local]);

  // Pick up messages sent from Discord whenever the app comes back into view.
  useEffect(() => {
    const onFocus = () => document.visibilityState === "visible" && router.refresh();
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);

  // Land on the newest message instantly, then glide to each new one. Scroll the page to its
  // very bottom: the sticky composer overlaps the end of the thread, so scrollIntoView on the
  // last message would think it's already visible. ("instant", not "auto": the site sets
  // scroll-behavior:smooth on <html>, which "auto" would inherit.)
  const scrolledOnce = useRef(false);
  useEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: scrolledOnce.current ? "smooth" : "instant" });
    scrolledOnce.current = true;
  }, [exchanges.length, pending]);

  const patchExtra = (id: number, patch: Partial<Extra>) =>
    setExtras((e) => ({ ...e, [id]: { ...e[id], ...patch } }));

  const runTurn = useCallback(
    async (action: "chat" | "brief" | "review", body: unknown, label: string, userText: string) => {
      setNotice(null);
      setPending({ label });
      try {
        const turn = (await post(action, body)) as unknown as TurnResponse;
        if (turn.error) throw new Error(turn.error);
        if (turn.exchange_id === null) {
          // e.g. a review with nothing to review: show it without saving anything.
          setNotice({ message: turn.reply ?? "Nothing to do.", tone: "info" });
          return;
        }
        const ex: Exchange = {
          id: turn.exchange_id,
          created_at: new Date().toISOString(),
          kind: turn.kind,
          channel: "web",
          user_text: userText,
          reply_text: turn.reply ?? "",
          cost_usd: turn.usage?.cost_usd ?? null,
        };
        setLocal((l) => [...l, ex]);
        patchExtra(ex.id, { notes: turn.notes, tools: turn.tools });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Something went wrong.";
        setNotice({ message, tone: "error", retry: () => void runTurn(action, body, label, userText) });
        if (action === "chat") setDraft((d) => d || userText);
      } finally {
        setPending(null);
      }
    },
    [],
  );

  const send = () => {
    const text = draft.trim();
    if (!text || pending) return;
    setDraft("");
    void runTurn("chat", { text }, text, text);
  };

  const rate = async (ex: Exchange, rating: "good" | "bad") => {
    patchExtra(ex.id, { rating });
    try {
      await post("feedback", { exchange_id: ex.id, kind: rating });
    } catch {
      patchExtra(ex.id, { rating: undefined });
    }
  };

  const submitFix = async (ex: Exchange) => {
    const correction = fixText.trim();
    if (!correction) return;
    setFixing(null);
    setFixText("");
    patchExtra(ex.id, { fixed: true });
    try {
      const res = (await post("feedback", { exchange_id: ex.id, kind: "correction", correction })) as { note?: Note };
      const note = res.note;
      if (note) setExtras((e) => ({ ...e, [ex.id]: { ...e[ex.id], notes: [...(e[ex.id]?.notes ?? []), note] } }));
    } catch (e) {
      patchExtra(ex.id, { fixed: false });
      setNotice({ message: e instanceof Error ? e.message : "Couldn't save the fix.", tone: "error" });
    }
  };

  const deleteNote = async (exId: number, note: Note) => {
    const sb = getSupabase();
    if (!sb) return;
    const { error: err } = await sb.from("kazper_facts").delete().eq("id", note.id);
    if (!err) {
      setExtras((e) => ({
        ...e,
        [exId]: { ...e[exId], notes: (e[exId]?.notes ?? []).map((n) => (n.id === note.id ? { ...n, deleted: true } : n)) },
      }));
    }
  };

  return (
    <div className="kz-chat">
      <div className="kz-thread">
        {exchanges.length === 0 && !pending && (
          <div className="kz-empty">
            <img src="/assets/k-mark.png" alt="" />
            <p>Say something. This is the same Kazper as on Discord.</p>
          </div>
        )}
        {exchanges.map((ex) => {
          const extra = extras[ex.id] ?? {};
          return (
            <section key={ex.id} className="kz-turn">
              <div className={`kz-msg kz-me${ex.kind !== "chat" ? " kz-job" : ""}`}>
                <div className="kz-bubble">{askedLabel(ex)}</div>
                <div className="kz-meta">
                  <LocalTime iso={ex.created_at} />
                  {ex.channel === "discord" && <span className="kz-chip">via Discord</span>}
                </div>
              </div>
              <div className="kz-msg kz-him">
                {extra.tools && extra.tools.length > 0 && (
                  <div className="kz-tools">
                    {[...new Set(extra.tools.map(toolLabel))].map((t) => (
                      <span key={t} className="kz-chip">{t}</span>
                    ))}
                  </div>
                )}
                <div className="kz-bubble">
                  <Markdown text={ex.reply_text} />
                </div>
                {extra.notes?.map((n) => (
                  <div key={n.id} className={`kz-note${n.deleted ? " gone" : ""}`}>
                    <span>📝 {n.deleted ? "Deleted" : "Noted"} #{n.id}: {n.text}</span>
                    {!n.deleted && (
                      <button className="kz-link" onClick={() => void deleteNote(ex.id, n)}>Delete</button>
                    )}
                  </div>
                ))}
                <div className="kz-meta kz-actions">
                  <span className="mono">#{ex.id}</span>
                  {ex.cost_usd !== null && <span className="mono">${Number(ex.cost_usd).toFixed(4)}</span>}
                  <button className={`kz-icon${extra.rating === "good" ? " on" : ""}`} aria-label="Good reply"
                    onClick={() => void rate(ex, "good")}>👍</button>
                  <button className={`kz-icon${extra.rating === "bad" ? " on" : ""}`} aria-label="Bad reply"
                    onClick={() => void rate(ex, "bad")}>👎</button>
                  {extra.fixed ? (
                    <span className="kz-chip">fix saved</span>
                  ) : (
                    <button className="kz-link" onClick={() => { setFixing(ex.id); setFixText(""); }}>Fix</button>
                  )}
                </div>
                {fixing === ex.id && (
                  <div className="kz-fix">
                    <textarea autoFocus rows={3} value={fixText} placeholder="What should Kazper have said?"
                      onChange={(e) => setFixText(e.target.value)} />
                    <div>
                      <button className="btn btn-ghost" onClick={() => setFixing(null)}>Cancel</button>
                      <button className="btn btn-primary" onClick={() => void submitFix(ex)}>Save fix</button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
        {pending && (
          <section className="kz-turn">
            <div className="kz-msg kz-me">
              <div className="kz-bubble">{pending.label}</div>
            </div>
            <div className="kz-msg kz-him">
              <div className="kz-bubble kz-thinking"><span /><span /><span /></div>
            </div>
          </section>
        )}
        {notice && (
          <div className={`kz-notice ${notice.tone}`}>
            <span>{notice.message}</span>
            {notice.retry && <button className="kz-link" onClick={notice.retry}>Retry</button>}
            <button className="kz-link" onClick={() => setNotice(null)}>Dismiss</button>
          </div>
        )}
      </div>

      <div className="kz-composer">
        <div className="kz-quick">
          <button className="kz-chip kz-chip-btn" disabled={!!pending}
            onClick={() => void runTurn("brief", {}, "☀️ Briefing", "[On demand] briefing")}>☀️ Brief me</button>
          <button className="kz-chip kz-chip-btn" disabled={!!pending}
            onClick={() => void runTurn("review", {}, "🔁 Weekly review", "[Weekly review]")}>🔁 Review my feedback</button>
        </div>
        <div className="kz-input">
          <textarea
            rows={1}
            value={draft}
            placeholder="Message Kazper…"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button className="btn btn-primary" disabled={!draft.trim() || !!pending} onClick={send}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
