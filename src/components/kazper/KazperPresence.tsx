"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import {
  createPresence, SENSES, STATE_COLORS, STATE_LABELS,
  type PresenceState, type SenseId,
} from "./presence-engine";

// Kazper, seen. Every few seconds this checks for a new exchange (from Discord or
// the app, briefings included) and plays back what he actually did in it: what
// you said, the senses he reached for, the changes he made, his reply. Between
// turns he rests, and sleeps once he's been quiet for an hour.

const POLL_MS = 5000;
const ASLEEP_AFTER_MS = 60 * 60 * 1000;
// Tools that change something (deadlines, calendar list, memory): drawn as a burst.
const WRITES = /^(deadline_(add|update|remove|calendar_settings)|calendar_(mute|unmute|hide|unhide|unsubscribe)|remember|leave_pointer|clear_pointer)$/;

interface Row {
  id: number;
  created_at: string;
  kind: "chat" | "briefing" | "review";
  channel: "discord" | "web";
  user_text: string;
  reply_text: string;
  messages?: { tool_calls?: { function?: { name?: string } }[] }[];
}

interface LogLine { key: string; at: string; text: string; write?: boolean }

function senseOf(tool: string): SenseId {
  if (/^(calendar|deadline)_/.test(tool)) return "calendar";
  if (tool.startsWith("gmail_")) return "gmail";
  if (tool.startsWith("slack_")) return "slack";
  if (tool.startsWith("discord_")) return "discord";
  if (tool.startsWith("railway_")) return "railway";
  if (/^(history_|remember$|leave_pointer$|clear_pointer$)/.test(tool)) return "memory";
  return "cryptidkeep"; // CryptidKeep's tools come from its MCP server, unprefixed
}
const senseLabel = (id: SenseId) => SENSES.find((s) => s.id === id)!.label;
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const plain = (s: string) => s.replace(/[*_`#>[\]]/g, "").replace(/\s+/g, " ").trim();
const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function ago(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

export default function KazperPresence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<PresenceState>("resting");
  const [caption, setCaption] = useState("Looking for him…");
  const [log, setLog] = useState<LogLine[]>([]);

  useEffect(() => {
    const presence = createPresence(canvasRef.current!);
    const sb = getSupabase();
    let lastId = 0, lastAt = "", stopped = false, replaying = false, failed = false;
    let timers: ReturnType<typeof setTimeout>[] = [];

    const show = (s: PresenceState, text: string) => { presence.setState(s); setState(s); setCaption(text); };
    const idle = () => {
      replaying = false;
      if (!lastAt) return show("resting", "Waiting for you.");
      const quiet = Date.now() - new Date(lastAt).getTime() > ASLEEP_AFTER_MS;
      show(quiet ? "asleep" : "resting", `Last active ${ago(lastAt)}.`);
    };

    // Play one exchange back as a short sequence of states.
    function replay(row: Row) {
      timers.forEach(clearTimeout); timers = [];
      replaying = true;
      const tools = (row.messages ?? []).flatMap((m) => m.tool_calls ?? []).map((c) => c.function?.name).filter(Boolean) as string[];
      const asked = row.kind === "briefing" ? "Morning briefing" : row.kind === "review" ? "Weekly self-review"
        : `You${row.channel === "discord" ? " on Discord" : ""}: “${clip(plain(row.user_text), 80)}”`;
      const steps: [number, () => void][] = [
        [0, () => show("listening", asked)],
        [1300, () => show("thinking", "Working it out.")],
      ];
      tools.forEach((tool) => steps.push([900, () => {
        const sense = senseOf(tool), write = WRITES.test(tool);
        if (write) presence.act(sense); else presence.reach(sense);
        setCaption(`${tool} → ${senseLabel(sense)}`);
        setLog((l) => [{ key: `${row.id}-${l.length}-${tool}`, at: clock(row.created_at), text: `${tool} → ${senseLabel(sense)}`, write }, ...l].slice(0, 5));
      }]));
      steps.push([tools.length ? 1100 : 900, () => show("speaking", `“${clip(plain(row.reply_text), 110)}”`)]);
      steps.push([2800, idle]);
      let t = 0;
      for (const [delay, fn] of steps) { t += delay; timers.push(setTimeout(fn, t)); }
      lastId = row.id; lastAt = row.created_at;
    }

    async function latest(withMessages: boolean): Promise<Row | null> {
      if (!sb) return null;
      const fields = "id,created_at,kind,channel,user_text,reply_text" + (withMessages ? ",messages" : "");
      const { data, error } = await sb.from("kazper_exchanges").select(fields).order("id", { ascending: false }).limit(1);
      if (error) throw error;
      return (data?.[0] as unknown as Row) ?? null;
    }

    async function poll() {
      if (stopped || document.hidden) return;
      try {
        const head = await latest(false);
        if (head && head.id !== lastId) {
          const row = await latest(true);
          if (row && !stopped) replay(row);
        } else if (failed && !replaying) {
          idle();
        }
        failed = false;
      } catch {
        failed = true;
        if (!stopped && !replaying) show("error", "Can't reach his memory right now. Retrying.");
      }
    }

    void poll();
    const interval = setInterval(poll, POLL_MS);
    const tick = setInterval(() => { if (!replaying) idle(); }, 60000); // keeps "x min ago" fresh, and falls asleep
    return () => {
      stopped = true;
      clearInterval(interval); clearInterval(tick);
      timers.forEach(clearTimeout);
      presence.destroy();
    };
  }, []);

  return (
    <div className="kz-presence" style={{ "--kz-live": STATE_COLORS[state] } as React.CSSProperties}>
      <canvas ref={canvasRef} className="kz-presence-canvas" aria-hidden />
      <div className="kz-presence-hud" aria-live="polite">
        <div className="kz-presence-eyebrow"><span className="kz-presence-dot" />Kazper · live</div>
        <h1 className="kz-presence-state">{STATE_LABELS[state]}</h1>
        <p className="kz-presence-caption">{caption}</p>
        {log.length > 0 && (
          <ul className="kz-presence-log">
            {log.map((l) => (
              <li key={l.key}><span>{l.at}</span><span className={l.write ? "write" : undefined}>{l.text}</span></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
