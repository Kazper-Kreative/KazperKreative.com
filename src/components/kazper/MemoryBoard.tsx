"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getKazperSupabase } from "@/lib/kazper/supabase";
import type { Fact, Pointer } from "@/lib/kazper/data";

type Table = "kazper_facts" | "kazper_pointers";

function Row({
  id,
  prefix,
  text,
  sub,
  table,
  onDone,
}: {
  id: number;
  prefix: string;
  text: string;
  sub?: React.ReactNode;
  table: Table;
  onDone: (msg?: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const next = value.trim();
    if (!next || next === text) return setEditing(false);
    setBusy(true);
    const { error } = await getKazperSupabase()!.from(table).update({ text: next }).eq("id", id);
    setBusy(false);
    setEditing(false);
    onDone(error ? `Couldn't save: ${error.message}` : undefined);
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${prefix}${id}? Kazper will stop knowing this.`)) return;
    setBusy(true);
    const { error } = await getKazperSupabase()!.from(table).delete().eq("id", id);
    setBusy(false);
    onDone(error ? `Couldn't delete: ${error.message}` : undefined);
  };

  return (
    <li className={`kz-row${busy ? " busy" : ""}`}>
      <span className="kz-row-id mono">{prefix}{id}</span>
      {editing ? (
        <textarea className="kz-row-edit" rows={2} value={value} autoFocus onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void save(); }
            if (e.key === "Escape") { setValue(text); setEditing(false); }
          }} />
      ) : (
        <span className="kz-row-text">
          {text}
          {sub && <span className="kz-row-sub">{sub}</span>}
        </span>
      )}
      <span className="kz-row-actions">
        {editing ? (
          <button className="kz-link" onClick={() => void save()}>Save</button>
        ) : (
          <button className="kz-link" onClick={() => setEditing(true)}>Edit</button>
        )}
        <button className="kz-link danger" onClick={() => void remove()}>Delete</button>
      </span>
    </li>
  );
}

export default function MemoryBoard({ facts, pointers }: { facts: Fact[]; pointers: Pointer[] }) {
  const router = useRouter();
  const [newFact, setNewFact] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const yours = facts.filter((f) => f.source === "owner");
  const notes = facts.filter((f) => f.source === "kazper");

  const done = (m?: string) => {
    setMsg(m ?? null);
    router.refresh();
  };

  const add = async () => {
    const text = newFact.trim();
    if (!text) return;
    const { error } = await getKazperSupabase()!.from("kazper_facts").insert({ text, source: "owner" });
    if (!error) setNewFact("");
    done(error ? `Couldn't add: ${error.message}` : undefined);
  };

  return (
    <div className="kz-page">
      <h1 className="kz-h">Memory</h1>
      <p className="dim kz-lede">Everything here rides along in every conversation, on Discord and here.</p>
      {msg && <div className="kz-notice error"><span>{msg}</span></div>}

      <section className="kz-panel">
        <h2>From you <span className="kz-count">{yours.length}</span></h2>
        <div className="kz-add">
          <input value={newFact} placeholder="Tell Kazper something to always remember…"
            onChange={(e) => setNewFact(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          <button className="btn btn-primary" disabled={!newFact.trim()} onClick={() => void add()}>Add</button>
        </div>
        <ul className="kz-rows">
          {yours.map((f) => <Row key={f.id} id={f.id} prefix="#" text={f.text} table="kazper_facts" onDone={done} />)}
          {yours.length === 0 && <li className="kz-row-empty dim">Nothing yet.</li>}
        </ul>
      </section>

      <section className="kz-panel">
        <h2>📝 Kazper&apos;s notes <span className="kz-count">{notes.length}</span></h2>
        <p className="dim kz-help">Things he decided to remember about you. What you tell him directly wins over these.</p>
        <ul className="kz-rows">
          {notes.map((f) => <Row key={f.id} id={f.id} prefix="#" text={f.text} table="kazper_facts" onDone={done} />)}
          {notes.length === 0 && <li className="kz-row-empty dim">None yet.</li>}
        </ul>
      </section>

      <section className="kz-panel">
        <h2>Pointers <span className="kz-count">{pointers.length}</span></h2>
        <p className="dim kz-help">His working notes to himself: open threads and where to look. The newest 12 are in every prompt.</p>
        <ul className="kz-rows">
          {pointers.map((p) => (
            <Row key={p.id} id={p.id} prefix="p" text={p.text} table="kazper_pointers" onDone={done}
              sub={p.exchange_id ? <Link href={`/kazper/history?id=${p.exchange_id}`}>from #{p.exchange_id}</Link> : undefined} />
          ))}
          {pointers.length === 0 && <li className="kz-row-empty dim">No open threads.</li>}
        </ul>
      </section>
    </div>
  );
}
