"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ports the reveal-on-scroll and hover-tilt behaviours from the static
 * site's site.js. Mounted once in the root layout; re-scans the DOM on
 * every route change so freshly-rendered [data-reveal]/[data-tilt]
 * elements get wired up.
 */
export default function SiteInteractions() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    let io: IntersectionObserver | null = null;
    const reveal = (el: Element) => el.classList.add("in");

    const revealInView = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      els.forEach((el) => {
        if (el.classList.contains("in")) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) reveal(el);
      });
    };

    if (els.length && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              reveal(e.target);
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      els.forEach((el) => io?.observe(el));
    }

    revealInView();

    // Safety net: if the tab is hidden (transitions paused) or after a grace
    // period, force every reveal to its final state.
    const forceShow = () => {
      els.forEach(reveal);
      document.documentElement.classList.add("reveal-fallback");
    };
    const onVisibility = () => {
      if (document.hidden) forceShow();
    };
    if (document.hidden) forceShow();

    window.addEventListener("scroll", revealInView, { passive: true });
    window.addEventListener("resize", revealInView, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    const graceTimer = window.setTimeout(forceShow, 1400);

    // Hover tilt
    const tiltEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tilt]")
    );
    const tiltMove = (el: HTMLElement) => (ev: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width - 0.5;
      const py = (ev.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${
        -py * 6
      }deg) translateY(-4px)`;
    };
    const tiltLeave = (el: HTMLElement) => () => {
      el.style.transform = "";
    };
    const tiltHandlers = tiltEls.map((el) => {
      const move = tiltMove(el);
      const leave = tiltLeave(el);
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      return { el, move, leave };
    });

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", revealInView);
      window.removeEventListener("resize", revealInView);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(graceTimer);
      tiltHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, [pathname]);

  return null;
}
