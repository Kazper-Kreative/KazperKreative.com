"use client";

import { useEffect, useState } from "react";

interface Power {
  on: boolean;
  since: string | null;
  by: string | null;
}

async function power(body: { on?: boolean } = {}): Promise<Power> {
  const res = await fetch("/api/kazper/power", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `runtime returned ${res.status}`);
  return data as Power;
}

// Kazper's on/off switch. Off: he stops thinking, briefing and building (his forge is halted too) until
// switched back on. Turning off asks first; turning on doesn't.
export default function PowerSwitch() {
  const [state, setState] = useState<Power | null>(null);
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    power().then(setState, () => setFailed(true));
  }, []);

  const flip = async (on: boolean) => {
    setBusy(true);
    try {
      setState(await power({ on }));
      setAsking(false);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  if (!state) {
    return failed ? <span className="kz-power kz-power-unknown" title="Couldn't reach Kazper">● ?</span> : null;
  }
  if (asking) {
    return (
      <span className="kz-power-ask">
        <span>Switch Kazper off?</span>
        <button className="btn btn-primary kz-chip-btn" disabled={busy} onClick={() => void flip(false)}>Off</button>
        <button className="kz-link" onClick={() => setAsking(false)}>Cancel</button>
      </span>
    );
  }
  return state.on ? (
    <button className="kz-power kz-power-on" onClick={() => setAsking(true)} title="Kazper is on. Click to switch him off.">
      ● On
    </button>
  ) : (
    <button className="kz-power kz-power-off" disabled={busy} onClick={() => void flip(true)}
      title={`Kazper is off${state.by ? ` (${state.by})` : ""}. Click to switch him back on.`}>
      ○ Off
    </button>
  );
}
