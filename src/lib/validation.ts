// Reasonable email validation — requires name@domain.tld (an "@" and a dot
// with a 2+ char TLD), no spaces. Strict enough to block typos/junk like
// "a@b" or "foo@bar", lenient enough not to reject real addresses.

// For the HTML `pattern` attribute (implicitly full-string matched).
export const EMAIL_PATTERN = "[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}";

// For JS / server-side checks.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string | undefined | null): boolean {
  return !!value && EMAIL_RE.test(value.trim());
}
