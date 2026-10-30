"use client";

// Links to other sites (GitHub PRs and the like). In a browser they open a new tab. Kazper's desktop app
// (Tauri) ignores new-tab requests but sends ordinary navigations to other sites to your browser, so there
// we navigate instead; the window itself stays on Kazper. If a new tab is blocked anywhere, same fallback.
export const browser = {
  navigate: (url: string) => window.location.assign(url),
};

function inDesktopShell(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export default function ExternalLink({ href, className, children }: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const open = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let the browser handle modified clicks
    e.preventDefault();
    if (inDesktopShell()) {
      browser.navigate(href);
      return;
    }
    const tab = window.open(href, "_blank");
    if (tab) tab.opener = null;
    else browser.navigate(href);
  };
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className} onClick={open}>
      {children}
    </a>
  );
}
