"use client";

import { useEffect } from "react";

// Registers /sw.js once the page is interactive. Production-only: a SW in
// `next dev` interferes with HMR. When installed to the home screen this is
// what makes the Lab launch standalone and work offline-after-first-load.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration failures are non-fatal — the app still works online */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}
