"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { PROJECTS, type ProjectSlug } from "@/data/projects";

interface ProjectModalContextValue {
  open: (slug: ProjectSlug) => void;
  close: () => void;
}

const ProjectModalContext = createContext<ProjectModalContextValue | null>(null);

export function useProjectModal() {
  const ctx = useContext(ProjectModalContext);
  if (!ctx)
    throw new Error("useProjectModal must be used within ProjectModalProvider");
  return ctx;
}

/**
 * Ports the shared project-detail modal from site.js (initProjModal).
 * Any element with `class="js-proj" data-proj="<slug>"` opens it via a
 * delegated click listener, so server-rendered grids work without props.
 */
export function ProjectModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [slug, setSlug] = useState<ProjectSlug | null>(null);
  const [shown, setShown] = useState(false);

  const close = useCallback(() => {
    setShown(false);
    document.body.style.overflow = "";
    window.setTimeout(() => setSlug(null), 240);
  }, []);

  const open = useCallback((next: ProjectSlug) => {
    setSlug(next);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => setShown(true));
  }, []);

  // Delegated click handling for [data-proj] triggers.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>(".js-proj");
      if (!trigger) return;
      if (trigger.closest(".pm-overlay")) return;
      const next = trigger.getAttribute("data-proj") as ProjectSlug | null;
      if (next && PROJECTS[next]) {
        e.preventDefault();
        open(next);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const project = slug ? PROJECTS[slug] : null;

  return (
    <ProjectModalContext.Provider value={{ open, close }}>
      {children}
      {project && (
        <div
          className={`pm-overlay${shown ? " open" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="pm-card"
            role="dialog"
            aria-modal="true"
            aria-label="Project details"
          >
            <button className="pm-close" aria-label="Close" onClick={close}>
              ×
            </button>
            <div className="pm-media">
              {project.clientLogo ? (
                <div className="client-panel">
                  <img
                    className="client-logo"
                    src={project.clientLogo}
                    alt={project.title}
                  />
                </div>
              ) : (
                <img src={project.art} alt={project.title} />
              )}
              <span className={`status ${project.statusClass}`}>
                {project.status}
              </span>
            </div>
            <div className="pm-body">
              <div className="pm-badges">
                {project.flag && <span className="flag">{project.flag}</span>}
              </div>
              <h3 className="pm-title">{project.title}</h3>
              <div className="pm-tags">
                {project.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <p className="pm-meta">{project.meta}</p>
              <p className="pm-desc">{project.desc}</p>
              <div className="pm-actions">
                <Link
                  className="btn btn-fill"
                  href={`/work/${project.slug}`}
                  onClick={close}
                >
                  Read case study <span className="arrow">→</span>
                </Link>
                {project.link && (
                  <a
                    className="btn btn-ghost"
                    href={project.link.url}
                    target="_blank"
                    rel="noopener"
                  >
                    {project.link.label} ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ProjectModalContext.Provider>
  );
}
