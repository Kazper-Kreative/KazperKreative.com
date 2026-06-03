"use client";

import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, any>) => string;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile widget. Renders only when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; otherwise it's a no-op and forms
 * submit without a token (the server skips verification when unconfigured).
 */
export default function Turnstile({
  onVerify,
}: {
  onVerify: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !ref.current || !window.turnstile) return;
      if (widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        // The normal widget is a fixed 300px box that overflows narrow form
        // cards on phones; the compact widget (~150px) fits any screen.
        size: window.innerWidth < 480 ? "compact" : "normal",
        callback: (t: string) => onVerify(t),
        "error-callback": () => onVerify(""),
        "expired-callback": () => onVerify(""),
      });
    };

    let interval: ReturnType<typeof setInterval> | undefined;
    if (window.turnstile) {
      render();
    } else {
      if (!document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
        const s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
      interval = setInterval(() => {
        if (window.turnstile) {
          if (interval) clearInterval(interval);
          render();
        }
      }, 200);
    }

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* ignore */
        }
        widgetId.current = null;
      }
    };
  }, [onVerify]);

  if (!SITE_KEY) return null;
  return <div ref={ref} style={{ marginTop: 4, maxWidth: "100%", overflow: "hidden" }} />;
}
