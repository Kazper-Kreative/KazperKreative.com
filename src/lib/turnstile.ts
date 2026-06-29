// Server-side Cloudflare Turnstile verification.
// If TURNSTILE_SECRET_KEY is not set, verification is skipped (returns true)
// so the site works before the keys are provisioned.

const SECRET = process.env.TURNSTILE_SECRET_KEY;
const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(): boolean {
  return !!SECRET;
}

export async function verifyTurnstile(
  token?: string,
  ip?: string
): Promise<boolean> {
  if (!SECRET) {
    // Not configured — don't block submissions, but in production this means
    // bot protection is OFF, so make it loud rather than silent.
    if (process.env.NODE_ENV === "production")
      console.warn("[turnstile] TURNSTILE_SECRET_KEY is unset in production — bot verification is being SKIPPED.");
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret: SECRET, response: token });
    if (ip) body.append("remoteip", ip);
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}
