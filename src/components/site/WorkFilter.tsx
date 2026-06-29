"use client";

import { useState } from "react";

type Filter = "all" | "agency" | "studio" | "dev";

interface Item {
  proj: string;
  cat: string[]; // categories it belongs to
  dev: boolean;
  href: string;
  status: string;
  statusClass: string;
  title: string;
  label: string;
  badge: { flag: boolean; text: string };
  art?: string;
  clientLogo?: string;
}

const ITEMS: Item[] = [
  {
    proj: "vengeance",
    cat: ["agency", "studio"],
    dev: true,
    href: "#",
    status: "In Development",
    statusClass: "dev",
    title: "Vengeance: Beyond the Night",
    label: "Steam · Action",
    badge: { flag: true, text: "Agency × Studio" },
    art: "/assets/vengeance.jpg",
  },
  {
    proj: "shadow",
    cat: ["studio"],
    dev: true,
    href: "#",
    status: "In Development",
    statusClass: "dev",
    title: "Shadows of Beginnings",
    label: "Steam · Action RPG",
    badge: { flag: false, text: "Studio" },
    art: "/assets/sob.jpg",
  },
  {
    proj: "synx",
    cat: ["agency"],
    dev: false, // "Ongoing" client engagement, not an in-development title
    href: "https://sensorops.io/syndojo/",
    status: "Ongoing",
    statusClass: "dev",
    title: "SynX",
    label: "Sensor Ops · QA + Dev",
    badge: { flag: false, text: "Agency" },
    clientLogo: "/assets/sensorops-logo.svg",
  },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "agency", label: "Agency" },
  { key: "studio", label: "Studio" },
  { key: "dev", label: "In Development" },
];

export default function WorkFilter() {
  const [active, setActive] = useState<Filter>("all");

  const visible = (it: Item) => {
    if (active === "all") return true;
    if (active === "dev") return it.dev;
    return it.cat.includes(active);
  };

  return (
    <>
      <div className="filters" data-reveal data-delay="3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter${active === f.key ? " active" : ""}`}
            onClick={() => setActive(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="work-grid" id="workGrid" style={{ marginTop: 40 }}>
        {ITEMS.map((it, i) => (
          <a
            key={it.proj}
            className="work-item js-proj"
            data-proj={it.proj}
            href={it.href}
            data-reveal
            data-delay={(i % 3).toString()}
            style={{ display: visible(it) ? undefined : "none" }}
          >
            <div className={`proj-art${it.clientLogo ? " client-panel" : ""}`}>
              <span className={`status ${it.statusClass}`}>{it.status}</span>
              {it.clientLogo ? (
                <img className="client-logo" src={it.clientLogo} alt={it.title} />
              ) : (
                <img
                  className="art-rounded" loading="lazy" decoding="async"
                  src={it.art}
                  alt={it.title}
                  style={{ aspectRatio: "4 / 3" }}
                />
              )}
            </div>
            <div className="work-meta">
              <div>
                <h4>{it.title}</h4>
                <span className="dim">{it.label}</span>
              </div>
              <span className={it.badge.flag ? "flag" : "tag"}>{it.badge.text}</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
