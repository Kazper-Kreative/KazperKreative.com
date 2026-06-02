// Submission capture + inbox data layer. TS port of the static site's
// inbox.js (KKInbox). Two modes, auto-selected:
//   • Supabase  — INSERT allowed for anon (RLS); read/update/delete require
//                 an authenticated session (the owner's login).
//   • localStorage — fallback/demo when Supabase isn't configured.

import { getSupabase, isSupabaseConfigured } from "./client";

const KEY = "kk_inbox";

export type SubmissionType = "Contact" | "Application" | "Newsletter";

export interface Submission {
  id: string;
  type: string;
  fields: Record<string, string>;
  ts: number;
  read: boolean;
}

interface SupabaseRow {
  id: string;
  type: string;
  fields: Record<string, string>;
  created_at: string;
  read: boolean;
}

function lread(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function lwrite(a: Submission[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
}

function mapRow(r: SupabaseRow): Submission {
  return {
    id: r.id,
    type: r.type,
    fields: r.fields,
    ts: new Date(r.created_at).getTime(),
    read: r.read,
  };
}

export const inbox = {
  configured(): boolean {
    return isSupabaseConfigured();
  },

  async save(entry: { type: SubmissionType; fields: Record<string, string> }) {
    const c = getSupabase();
    if (c) {
      return c.from("submissions").insert({ type: entry.type, fields: entry.fields });
    }
    const a = lread();
    a.unshift({
      id: "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: entry.type,
      fields: entry.fields,
      ts: Date.now(),
      read: false,
    });
    lwrite(a);
    return Promise.resolve();
  },

  // ── auth (Supabase mode only) ──
  signIn(email: string, password: string) {
    const c = getSupabase();
    if (!c) return Promise.resolve({ error: new Error("Not configured") } as never);
    return c.auth.signInWithPassword({ email, password });
  },
  signOut() {
    const c = getSupabase();
    return c ? c.auth.signOut() : Promise.resolve();
  },
  async hasSession(): Promise<boolean> {
    const c = getSupabase();
    if (!c) return false;
    const r = await c.auth.getSession();
    return !!r.data?.session;
  },

  // ── read / mutate ──
  async fetchAll(): Promise<Submission[]> {
    const c = getSupabase();
    if (c) {
      const r = await c
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (r.error) throw r.error;
      return (r.data || []).map(mapRow);
    }
    return lread();
  },
  async setRead(id: string, v: boolean) {
    const c = getSupabase();
    if (c) {
      await c.from("submissions").update({ read: v }).eq("id", id);
      return;
    }
    const a = lread();
    a.forEach((e) => {
      if (e.id === id) e.read = v;
    });
    lwrite(a);
  },
  async remove(id: string) {
    const c = getSupabase();
    if (c) {
      await c.from("submissions").delete().eq("id", id);
      return;
    }
    lwrite(lread().filter((e) => e.id !== id));
  },
  async clear() {
    const c = getSupabase();
    if (c) {
      await c
        .from("submissions")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      return;
    }
    lwrite([]);
  },
};

/**
 * Capture a form's named fields and store the submission (fire-and-forget).
 * Mirrors the static site's KKsubmit: keys come from each field's <label>,
 * falling back to aria-label / name.
 */
export function captureForm(
  form: HTMLFormElement,
  type: SubmissionType
): Record<string, string> {
  const fields: Record<string, string> = {};
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input, select, textarea"
  ).forEach((el) => {
    if (el.type === "submit" || el.type === "button") return;
    if (el.hasAttribute("data-hp")) return; // skip the honeypot field
    const fieldWrap = el.closest(".field");
    const label = fieldWrap?.querySelector("label")?.textContent?.trim();
    const key = label || el.getAttribute("aria-label") || el.name || el.type;
    if (el.value) fields[key] = el.value;
  });
  void Promise.resolve(inbox.save({ type, fields })).catch(() => {});
  return fields;
}

/** True if the form's hidden honeypot field was filled — i.e. likely a bot. */
export function isHoneypotFilled(form: HTMLFormElement): boolean {
  return Array.from(form.querySelectorAll<HTMLInputElement>("[data-hp]")).some(
    (el) => !!el.value
  );
}
