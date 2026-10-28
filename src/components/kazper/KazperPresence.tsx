"use client";

import { useEffect, useRef, useState } from "react";
import { getKazperSupabase } from "@/lib/kazper/supabase";
import {
  createPresence, SENSES, STATE_COLORS, STATE_LABELS,
  type PresenceState, type SenseId,
} from "./presence-engine";

// Kazper, seen. The runtime records each step of a turn as it happens (heard you,
// thinking, every tool call, replying: kazper/presence.py), and this plays them
// live: the senses he reaches for, the changes he makes, his reply. On open it
// replays his last exchange. Between turns he rests, and sleeps after an hour of
// quiet. If the live feed isn't there, it falls back to replaying each exchange
// once it's finished.

const LIVE_POLL_MS = 1500;
const POLL_MS = 5000;
const STUCK_MS = 120_000;
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

interface Step { id: number; created_at: string; kind: "heard" | "thinking" | "tool" | "speaking" | "error"; text: string }

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
    const sb = getKazperSupabase();
    let lastExchange = 0, lastStep = 0, lastAt = "", current: PresenceState = "resting";
    let live = false, busy = false, failed = false, stopped = false, draining = false;
    let replayTimers: ReturnType<typeof setTimeout>[] = [];
    let stepTimer: ReturnType<typeof setTimeout> | undefined, watchdog: ReturnType<typeof setTimeout> | undefined;
    const queue: Step[] = [];

    const show = (s: PresenceState, text: string) => { current = s; presence.setState(s); setState(s); setCaption(text); };
    const idle = () => {
      busy = false;
      if (!lastAt) return show("resting", "Waiting for you.");
      const quiet = Date.now() - new Date(lastAt).getTime() > ASLEEP_AFTER_MS;
      show(quiet ? "asleep" : "resting", `Last active ${ago(lastAt)}.`);
    };
    const settleIn = (ms: number) => { clearTimeout(watchdog); watchdog = setTimeout(idle, ms); };

    function toolStep(tool: string, at: string, key: string) {
      const sense = senseOf(tool), write = WRITES.test(tool);
      if (write) presence.act(sense); else presence.reach(sense);
      if (current !== "thinking") { current = "thinking"; presence.setState("thinking"); setState("thinking"); }
      setCaption(`${tool} → ${senseLabel(sense)}`);
      setLog((l) => [{ key, at: clock(at), text: `${tool} → ${senseLabel(sense)}`, write }, ...l].slice(0, 5));
    }

    // Play a finished exchange back as a short sequence (on open, and when the live feed is unavailable).
    function replay(row: Row) {
      replayTimers.forEach(clearTimeout); replayTimers = [];
      busy = true;
      const tools = (row.messages ?? []).flatMap((m) => m.tool_calls ?? []).map((c) => c.function?.name).filter(Boolean) as string[];
      const asked = row.kind === "briefing" ? "Morning briefing" : row.kind === "review" ? "Weekly self-review"
        : `You${row.channel === "discord" ? " on Discord" : ""}: “${clip(plain(row.user_text), 80)}”`;
      const steps: [number, () => void][] = [
        [0, () => show("listening", asked)],
        [1300, () => show("thinking", "Working it out.")],
      ];
      tools.forEach((tool, i) => steps.push([900, () => toolStep(tool, row.created_at, `x${row.id}-${i}`)]));
      steps.push([tools.length ? 1100 : 900, () => show("speaking", `“${clip(plain(row.reply_text), 110)}”`)]);
      steps.push([2800, idle]);
      let t = 0;
      for (const [delay, fn] of steps) { t += delay; replayTimers.push(setTimeout(fn, t)); }
      lastExchange = row.id; lastAt = row.created_at;
    }

    // Live: play each step as it arrives. Returns how long to hold it before the next one.
    function play(step: Step): number {
      busy = true; lastAt = step.created_at;
      settleIn(STUCK_MS); // a turn that never finishes (runtime restarted mid-way) still settles
      switch (step.kind) {
        case "heard":
          show("listening", /^(Morning briefing|Weekly self-review)$/.test(step.text) ? step.text : `You: “${clip(step.text, 80)}”`);
          return 900;
        case "thinking":
          if (current !== "thinking") show("thinking", "Working it out.");
          return 300;
        case "tool":
          toolStep(step.text, step.created_at, `s${step.id}`);
          return 800;
        case "speaking":
          show("speaking", `“${clip(plain(step.text), 110)}”`);
          settleIn(3200);
          return queue.length ? 1200 : 3200;
        case "error":
          show("error", step.text || "Something went wrong.");
          settleIn(3000);
          return 1500;
      }
    }
    function drain() {
      if (draining || stopped) return;
      const step = queue.shift();
      if (!step) return;
      replayTimers.forEach(clearTimeout); replayTimers = [];
      draining = true;
      stepTimer = setTimeout(() => { draining = false; drain(); }, play(step));
    }

    async function latest(withMessages: boolean): Promise<Row | null> {
      if (!sb) return null;
      const fields = "id,created_at,kind,channel,user_text,reply_text" + (withMessages ? ",messages" : "");
      const { data, error } = await sb.from("kazper_exchanges").select(fields).order("id", { ascending: false }).limit(1);
      if (error) throw error;
      return (data?.[0] as unknown as Row) ?? null;
    }

    async function poll() {
      if (stopped || document.hidden || !sb) return;
      try {
        if (live) {
          const { data, error } = await sb.from("kazper_activity").select("id,created_at,kind,text")
            .gt("id", lastStep).order("id", { ascending: true }).limit(50);
          if (error) throw error;
          const steps = (data ?? []) as Step[];
          if (steps.length) { lastStep = steps[steps.length - 1].id; queue.push(...steps); drain(); }
        } else {
          const head = await latest(false);
          if (head && head.id !== lastExchange) {
            const row = await latest(true);
            if (row && !stopped) replay(row);
          }
        }
        if (failed && !busy) idle();
        failed = false;
      } catch {
        failed = true;
        if (!stopped && !busy) show("error", "Can't reach his memory right now. Retrying.");
      }
    }

    async function start() {
      if (!sb) return show("error", "Not connected to his memory.");
      // Where the live feed ends right now, so only new steps play. No table yet: fall back to replays.
      const { data, error } = await sb.from("kazper_activity").select("id").order("id", { ascending: false }).limit(1);
      live = !error;
      lastStep = (data?.[0] as { id: number } | undefined)?.id ?? 0;
      try {
        const row = await latest(true);
        if (stopped) return;
        if (row) replay(row); else idle();
      } catch {
        show("error", "Can't reach his memory right now. Retrying.");
      }
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    void start().then(() => { if (!stopped) interval = setInterval(poll, live ? LIVE_POLL_MS : POLL_MS); });
    const tick = setInterval(() => { if (!busy) idle(); }, 60000); // keeps "x min ago" fresh, and falls asleep
    return () => {
      stopped = true;
      clearInterval(interval); clearInterval(tick);
      replayTimers.forEach(clearTimeout); clearTimeout(stepTimer); clearTimeout(watchdog);
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
