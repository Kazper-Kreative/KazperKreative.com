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
/** Collect a form's named values, keyed by <label> text (skips honeypot). */
export function extractFields(form: HTMLFormElement): Record<string, string> {
  const fields: Record<string, string> = {};
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input, select, textarea"
  ).forEach((el) => {
    if (el.type === "submit" || el.type === "button") return;
    if (el.type === "hidden") return; // skip Turnstile token + other hidden inputs
    if (el.hasAttribute("data-hp")) return; // skip the honeypot field
    if (el.getAttribute("name") === "cf-turnstile-response") return; // belt + suspenders
    const fieldWrap = el.closest(".field");
    const label = fieldWrap?.querySelector("label")?.textContent?.trim();
    const key = label || el.getAttribute("aria-label") || el.name || el.type;
    if (el.value) fields[key] = el.value;
  });
  return fields;
}

/** Extract + store directly (client-side). Used by the newsletter form + tests. */
export function captureForm(
  form: HTMLFormElement,
  type: SubmissionType
): Record<string, string> {
  const fields = extractFields(form);
  void Promise.resolve(inbox.save({ type, fields })).catch(() => {});
  return fields;
}

/** True if the form's hidden honeypot field was filled — i.e. likely a bot. */
export function isHoneypotFilled(form: HTMLFormElement): boolean {
  return Array.from(form.querySelectorAll<HTMLInputElement>("[data-hp]")).some(
    (el) => !!el.value
  );
}

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

/**
 * Send a submission through the server route (/api/submit), which verifies
 * the Turnstile token, stores it, and emails a notification. Falls back to a
 * direct client-side save if the route is unreachable so leads aren't lost.
 */
export async function submitForm(
  type: SubmissionType,
  fields: Record<string, string>,
  token: string
): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, fields, token }),
    });
    if (res.ok) return { ok: true };
    if (res.status === 400) {
      return { ok: false, error: "Verification failed — please try again." };
    }
    // 5xx / store error: fall back to a direct save so the lead isn't lost.
    await inbox.save({ type, fields });
    return { ok: true };
  } catch {
    try {
      await inbox.save({ type, fields });
    } catch {
      /* ignore */
    }
    return { ok: true };
  }
}
