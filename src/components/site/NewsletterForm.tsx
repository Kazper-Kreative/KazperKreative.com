"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { inbox } from "@/lib/supabase/submissions";
import { EMAIL_PATTERN } from "@/lib/validation";

export default function NewsletterForm({
  label = "Join",
  doneLabel = "✓",
  style,
}: {
  label?: string;
  doneLabel?: string;
  style?: CSSProperties;
}) {
  const [done, setDone] = useState(false);

  return (
    <form
      className="newsletter"
      style={style}
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector("input");
        const email = input?.value?.trim();
        if (email) {
          void Promise.resolve(
            inbox.save({ type: "Newsletter", fields: { Email: email } })
          ).catch(() => {});
        }
        if (input) input.value = "";
        setDone(true);
      }}
    >
      <input
        type="email"
        placeholder="you@email.com"
        aria-label="Email"
        required
        pattern={EMAIL_PATTERN}
        title="Enter a valid email address, e.g. you@studio.com"
      />
      <button type="submit">{done ? doneLabel : label}</button>
    </form>
  );
}
