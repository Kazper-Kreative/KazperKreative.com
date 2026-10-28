// The canvas behind the Presence tab: Kazper as a boiling plasma core with his
// senses on an orbit around him. Pure drawing, no React; KazperPresence drives it
// with setState / reach / act from his real exchanges.

export type PresenceState = "asleep" | "resting" | "listening" | "thinking" | "speaking" | "error";
export type SenseId = "calendar" | "gmail" | "slack" | "discord" | "cryptidkeep" | "railway" | "memory";

export interface Presence {
  setState(state: PresenceState): void;
  reach(sense: SenseId): void; // a read: data flows in from the sense
  act(sense: SenseId): void; // a write: a burst, flowing out to the sense
  destroy(): void;
}

type RGB = [number, number, number];
const TAU = Math.PI * 2;
const rgb = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const mix = (a: RGB, b: RGB, k: number): RGB => a.map((v, i) => v + (b[i] - v) * k) as RGB;
const css = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// The site's Inferno stops (globals.css --ir-*).
const C = { pink: "#FF5A2C", mag: "#FF2E84", vio: "#B931FF", blue: "#7B3FF2", gold: "#FFC042", accent: "#FF7A45" };

// e = energy, turb = how much the core boils, swirl = orbit speed, contract = how
// tightly the field pulls in (thinking draws everything close).
const NUM = ["e", "spd", "turb", "rad", "swirl", "contract", "glow"] as const;
type Look = Record<(typeof NUM)[number], number> & { inner: string; outer: string };
const LOOKS: Record<PresenceState, Look> = {
  asleep: { e: 0.1, spd: 0.25, turb: 0.06, rad: 0.72, swirl: 0.25, contract: 1.06, inner: C.blue, outer: "#24123f", glow: 0.22 },
  resting: { e: 0.3, spd: 0.45, turb: 0.14, rad: 1, swirl: 0.55, contract: 1, inner: C.vio, outer: C.blue, glow: 0.5 },
  listening: { e: 0.45, spd: 0.6, turb: 0.18, rad: 1.05, swirl: 0.8, contract: 0.92, inner: C.gold, outer: C.vio, glow: 0.6 },
  thinking: { e: 0.85, spd: 1.7, turb: 0.42, rad: 0.94, swirl: 2.6, contract: 0.72, inner: C.mag, outer: C.vio, glow: 0.85 },
  speaking: { e: 0.62, spd: 0.9, turb: 0.22, rad: 1.08, swirl: 1, contract: 1.05, inner: C.gold, outer: C.pink, glow: 0.75 },
  error: { e: 0.5, spd: 2.4, turb: 0.6, rad: 0.9, swirl: 0.4, contract: 1.12, inner: "#ff4a3d", outer: "#3d0d10", glow: 0.45 },
};

export const SENSES: { id: SenseId; label: string }[] = [
  { id: "calendar", label: "Calendar" },
  { id: "gmail", label: "Gmail" },
  { id: "slack", label: "Slack" },
  { id: "discord", label: "Discord" },
  { id: "cryptidkeep", label: "CryptidKeep" },
  { id: "railway", label: "Railway" },
  { id: "memory", label: "Memory" },
];

export function createPresence(canvas: HTMLCanvasElement): Presence {
  const ctx = canvas.getContext("2d")!;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "ui-monospace, monospace";
  const senses = SENSES.map((s, i) => ({ ...s, ang: -Math.PI / 2 + (i / SENSES.length) * TAU, lit: 0 }));

  let state: PresenceState = "resting";
  const P = { ...LOOKS.resting, innerC: rgb(LOOKS.resting.inner), outerC: rgb(LOOKS.resting.outer) };
  let W = 0, H = 0, cx = 0, cy = 0, base = 40, orbit = 160;

  const parts = Array.from({ length: reduce ? 160 : 420 }, () => ({
    a: Math.random() * TAU, o: 1.35 + Math.pow(Math.random(), 1.6) * 1.9,
    s: 0.4 + Math.random(), z: Math.random(), mix: Math.random(), kick: 0,
  }));
  const rings: { r: number; v: number; a: number; c: RGB; w: number }[] = [];
  const tendrils: { id: SenseId; age: number; life: number; side: number; write: boolean }[] = [];

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H * 0.5;
    base = Math.max(26, Math.min(W, H) * 0.085);
    orbit = Math.min(W / 2 - 64, H * 0.36, base * 4.4);
    ctx.fillStyle = "#07070C"; ctx.fillRect(0, 0, W, H);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const satPos = (s: (typeof senses)[number]) => [cx + Math.cos(s.ang) * orbit, cy + Math.sin(s.ang) * orbit * 0.82];

  function blob(r: number, turb: number, t: number, seed: number) {
    ctx.beginPath();
    for (let k = 0; k <= 96; k++) {
      const a = (k / 96) * TAU;
      const n = Math.sin(a * 3 + t * 1.3 + seed) * 0.5 + Math.sin(a * 5 - t * 1.9 + seed * 2) * 0.3 + Math.sin(a * 7 + t * 2.7 + seed * 3) * 0.2;
      const rr = r * (1 + n * turb * 0.38);
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
      if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
  }

  let raf = 0, last = performance.now(), T = 0, speakTimer = 0;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const target = LOOKS[state];
    const k = 1 - Math.exp(-dt * 3);
    for (const n of NUM) P[n] += (target[n] - P[n]) * k;
    P.innerC = mix(P.innerC, rgb(target.inner), k);
    P.outerC = mix(P.outerC, rgb(target.outer), k);
    const slow = reduce ? 0.3 : 1;
    T += dt * P.spd * slow;

    // Fade the last frame instead of clearing it: motion leaves a short trail.
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = reduce ? "#07070C" : "rgba(7,7,12,.24)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    let ox = 0, oy = 0;
    if (state === "error" && !reduce && Math.random() < 0.25) { ox = (Math.random() - 0.5) * 5; oy = (Math.random() - 0.5) * 5; }
    cx += ox; cy += oy;

    let R = base * P.rad * (1 + Math.sin(T * 2.1) * 0.045 * (0.5 + P.e));
    if (state === "speaking") {
      R *= 1 + Math.abs(Math.sin((now / 1000) * 7.5)) * 0.06 * slow;
      speakTimer -= dt;
      if (speakTimer <= 0) { rings.push({ r: R, v: base * 1.6, a: 0.35, c: rgb(C.gold), w: 1.2 }); speakTimer = 0.5 + Math.random() * 0.3; }
    }

    const halo = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 4.2);
    halo.addColorStop(0, css(P.outerC, 0.22 * P.glow)); halo.addColorStop(1, css(P.outerC, 0));
    ctx.fillStyle = halo; ctx.fillRect(cx - R * 4.2, cy - R * 4.2, R * 8.4, R * 8.4);

    for (const p of parts) {
      p.a += dt * P.swirl * p.s * (0.9 / p.o) * slow;
      p.kick *= Math.exp(-dt * 2.2);
      const r = base * (p.o * P.contract + p.kick);
      const x = cx + Math.cos(p.a) * r, y = cy + Math.sin(p.a) * r * 0.82;
      ctx.fillStyle = css(mix(P.innerC, P.outerC, p.mix), (0.12 + 0.55 * p.z) * (0.35 + P.e));
      const s = 0.5 + p.z * 1.5;
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }

    for (let i = 0; i < 5; i++) {
      const r = R * (1.3 - i * 0.21);
      blob(r, P.turb * (1 + i * 0.25), T * (1 + i * 0.18), i * 1.7);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
      g.addColorStop(0, css(P.innerC, 0.16 + i * 0.05));
      g.addColorStop(1, css(P.outerC, 0.05 + i * 0.02));
      ctx.fillStyle = g; ctx.fill();
    }
    const heart = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55);
    heart.addColorStop(0, `rgba(255,244,230,${0.35 + 0.45 * P.e})`); heart.addColorStop(1, css(P.innerC, 0));
    ctx.fillStyle = heart; ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, TAU); ctx.fill();

    for (let i = rings.length - 1; i >= 0; i--) {
      const g = rings[i];
      g.r += g.v * dt; g.a -= dt * 0.45;
      if (g.a <= 0) { rings.splice(i, 1); continue; }
      ctx.strokeStyle = css(g.c, g.a); ctx.lineWidth = g.w;
      ctx.beginPath(); ctx.ellipse(cx, cy, g.r, g.r * 0.82, 0, 0, TAU); ctx.stroke();
    }

    // Tendrils: reads flow in toward him, writes flow out.
    for (let i = tendrils.length - 1; i >= 0; i--) {
      const td = tendrils[i]; td.age += dt;
      const s = senses.find((x) => x.id === td.id)!;
      const fade = td.age > td.life ? 1 - (td.age - td.life) / 0.6 : 1;
      if (fade <= 0) { tendrils.splice(i, 1); continue; }
      s.lit = Math.max(s.lit, fade);
      const [sx, sy] = satPos(s);
      const dx = sx - cx, dy = sy - cy, len = Math.hypot(dx, dy) || 1;
      const x0 = cx + (dx / len) * R * 0.9, y0 = cy + (dy / len) * R * 0.9;
      const qx = (x0 + sx) / 2 - (sy - y0) * 0.22 * td.side, qy = (y0 + sy) / 2 + (sx - x0) * 0.22 * td.side;
      const at = (u: number) => { const v = 1 - u; return [v * v * x0 + 2 * v * u * qx + u * u * sx, v * v * y0 + 2 * v * u * qy + u * u * sy]; };
      const grow = Math.min(1, td.age / 0.35);
      ctx.strokeStyle = css(td.write ? rgb(C.accent) : P.innerC, 0.55 * fade); ctx.lineWidth = td.write ? 2 : 1.4;
      ctx.beginPath();
      for (let u = 0; u <= grow + 1e-6; u += 0.04) { const [x, y] = at(Math.min(u, grow)); if (u) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
      if (grow >= 1) for (let j = 0; j < 4; j++) {
        let u = (td.age * 1.1 + j / 4) % 1; if (!td.write) u = 1 - u;
        const [x, y] = at(u);
        ctx.fillStyle = css(td.write ? rgb(C.gold) : [255, 240, 220], 0.85 * fade);
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill();
      }
    }

    ctx.font = `500 11px ${mono}`;
    ctx.textBaseline = "middle";
    for (const s of senses) {
      s.lit *= Math.exp(-dt * 1.4);
      const [x, y] = satPos(s);
      if (s.lit > 0.02) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
        g.addColorStop(0, css(rgb(C.gold), 0.5 * s.lit)); g.addColorStop(1, css(rgb(C.gold), 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = css([236, 237, 244], 0.35 + 0.65 * s.lit);
      ctx.beginPath(); ctx.arc(x, y, 2.6 + s.lit * 2, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      const vertical = Math.abs(Math.cos(s.ang)) < 0.2, right = Math.cos(s.ang) >= -0.01;
      ctx.textAlign = vertical ? "center" : right ? "left" : "right";
      ctx.fillStyle = css(s.lit > 0.1 ? [255, 236, 210] : [155, 156, 176], 0.55 + 0.45 * s.lit);
      ctx.fillText(s.label, vertical ? x : x + (right ? 10 : -10), vertical ? y + (Math.sin(s.ang) > 0 ? 16 : -16) : y);
      ctx.globalCompositeOperation = "lighter";
    }

    cx -= ox; cy -= oy;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  const side = () => (Math.random() < 0.5 ? 1 : -1);
  return {
    setState(s) { state = s; },
    reach(id) { tendrils.push({ id, age: 0, life: 1.4, side: side(), write: false }); },
    act(id) {
      tendrils.push({ id, age: 0, life: 1.8, side: side(), write: true });
      rings.push({ r: base, v: base * 3.2, a: 0.8, c: rgb(C.accent), w: 2.2 }, { r: base * 0.8, v: base * 2.2, a: 0.6, c: rgb(C.gold), w: 1.4 });
      for (const p of parts) p.kick += 0.4 + Math.random() * 0.9;
    },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); },
  };
}

export const STATE_LABELS: Record<PresenceState, string> = {
  asleep: "Asleep", resting: "Resting", listening: "Listening", thinking: "Thinking", speaking: "Speaking", error: "Something broke",
};
export const STATE_COLORS: Record<PresenceState, string> = Object.fromEntries(
  Object.entries(LOOKS).map(([k, v]) => [k, v.inner]),
) as Record<PresenceState, string>;
