// Single source of truth for projects: powers the work grid, the project
// detail modal, and the /work/[slug] case-study pages.
// Ported from the static site's site.js PROJECTS object + case-*.html pages.

export type ProjectSlug = "mechaverse" | "vengeance" | "shadow" | "synx";

export type StatusClass = "" | "dev" | "prealpha" | "concept";

export interface ProjectLink {
  url: string;
  label: string;
}

export interface Fact {
  k: string;
  v: string;
}

export interface Pillar {
  ic: string;
  h: string;
  p: string;
}

export interface Project {
  slug: ProjectSlug;
  title: string;
  status: string;
  statusClass: StatusClass;
  flag?: string;
  tags: string[];

  // Work grid
  category: "agency" | "studio";
  inDevelopment: boolean;
  gridLabel: string; // dim sub-label shown under the title in the grid
  gridFlag?: string; // tag/flag shown on the right of the grid meta

  // Modal
  meta: string;
  desc: string;
  art?: string; // key-art image (omit for client-panel projects)
  clientLogo?: string; // logo for client-panel projects (e.g. SynX)

  link?: ProjectLink; // external link

  // Case study (/work/[slug])
  caseLead: string;
  facts: Fact[];
  overview: { kicker: string; title: string; lead: string; dim: string };
  pillars: { kicker: string; title: string; items: Pillar[] };
  gallery: { kicker: string; title: string; note: string };
  cta: {
    kicker: string;
    title: string;
    lead: string;
    primary?: ProjectLink;
    comingSoon?: boolean;
  };
}

export const PROJECTS: Record<ProjectSlug, Project> = {
  mechaverse: {
    slug: "mechaverse",
    title: "MechaVerse",
    status: "Pre-Alpha",
    statusClass: "prealpha",
    tags: ["Roblox", "Mech", "Progression"],
    category: "studio",
    inDevelopment: false,
    gridLabel: "Kazper's Echo · Roblox",
    gridFlag: "Studio",
    meta: "Roblox · After the Unreal slate",
    desc: "Strap into a war-machine and earn your name. Pilot towering mechs, stake your claim, and climb the ranks of the intergalactic Confederation.",
    art: "/assets/mechaverse.png",
    link: { url: "https://www.roblox.com/games/7825844132", label: "View on Roblox" },
    caseLead:
      "Pilot towering mechs, stake your claim, and climb the ranks of the intergalactic Confederation.",
    facts: [
      { k: "Platform", v: "Roblox" },
      { k: "Role", v: "In-house studio" },
      { k: "Stage", v: "Pre-alpha" },
      { k: "Window", v: "After Unreal slate" },
    ],
    overview: {
      kicker: "Overview",
      title: "A mech arena built for the Confederation.",
      lead: "MechaVerse is Kazper's Echo's Roblox arena of mech combat and progression. Suit up, fight for territory, and rise through the ranks of the intergalactic Confederation.",
      dim: "Designed to be fast to jump into and deep to master, it's our proving ground for real-time, social gameplay at scale. More world details coming soon.",
    },
    pillars: {
      kicker: "Pillars",
      title: "What makes it tick.",
      items: [
        { ic: "◇", h: "Pilot & progress", p: "Earn your mech, upgrade your loadout, and climb the Confederation ranks." },
        { ic: "◈", h: "Built for Roblox", p: "Fast sessions, social play, and a world that grows with its community." },
        { ic: "◆", h: "Frontier combat", p: "Readable, punchy mech battles tuned for moment-to-moment fun." },
      ],
    },
    gallery: { kicker: "Gallery", title: "Inside the arena.", note: "Gameplay captures coming soon" },
    cta: {
      kicker: "Play the pre-alpha",
      title: "Jump in on Roblox.",
      lead: "MechaVerse is live in pre-alpha. Hop in, pilot a mech, and tell us what you think.",
      primary: { url: "https://www.roblox.com/games/7825844132", label: "View on Roblox ↗" },
    },
  },

  vengeance: {
    slug: "vengeance",
    title: "Vengeance: Beyond the Night",
    status: "In Development",
    statusClass: "dev",
    flag: "Agency × Studio",
    tags: ["Steam", "Action"],
    category: "studio",
    inDevelopment: true,
    gridLabel: "Steam · Action",
    gridFlag: "Agency × Studio",
    meta: "Steam · Windows · Target Jul 2026",
    desc: "One vigilante stands between the city and the rogue AI clawing through its night. Hunt it down, adapt, and hold the line until dawn.",
    art: "/assets/vengeance.png",
    caseLead:
      "One vigilante stands between the city and the rogue AI clawing through its night.",
    facts: [
      { k: "Platform", v: "Steam (Windows)" },
      { k: "Stage", v: "In development" },
      { k: "Target", v: "Jul 2026" },
      { k: "Built", v: "Agency × Studio" },
    ],
    overview: {
      kicker: "Overview",
      title: "A neon-noir hunt against a rogue AI.",
      lead: "Vengeance: Beyond the Night is a story-driven action game where a lone vigilante hunts the rogue AI tearing through a neon city. Hunt it down, adapt, and hold the line until dawn.",
      dim: "It's the studio's first Steam title, built through a Kazper Kreative agency contract, proof that the agency and studio halves ship together. More on the story and systems coming soon.",
    },
    pillars: {
      kicker: "Pillars",
      title: "The shape of the night.",
      items: [
        { ic: "◇", h: "Hunt the night", p: "Stealth and action blend as you stalk the city's rooftops and alleys." },
        { ic: "◈", h: "An AI that fights back", p: "Enemies learn, swarm, and adapt, the threat escalates with you." },
        { ic: "◆", h: "Neon noir", p: "A moody, rain-slicked city built to feel dangerous after dark." },
      ],
    },
    gallery: { kicker: "Gallery", title: "Scenes from the city.", note: "Screenshots & trailer coming soon" },
    cta: {
      kicker: "Wishlist soon",
      title: "Follow the descent.",
      lead: "Vengeance is in active development for Steam. A store page and wishlist are on the way.",
      comingSoon: true,
    },
  },

  shadow: {
    slug: "shadow",
    title: "Shadow of Beginnings",
    status: "In Development",
    statusClass: "dev",
    tags: ["Steam", "Action RPG"],
    category: "studio",
    inDevelopment: true,
    gridLabel: "Steam · Action RPG",
    gridFlag: "Studio",
    meta: "Steam · Windows · Target Oct 2026",
    desc: "An action-RPG of ruin and rebuilding. Gather what's left, brave the horrors beyond the walls, and bring the Town of Beginnings back from the dark.",
    art: "/assets/sob.jpg",
    caseLead:
      "Rebuild the Town of Beginnings, one expedition into the dark at a time.",
    facts: [
      { k: "Platform", v: "Steam (Windows)" },
      { k: "Stage", v: "In development" },
      { k: "Target", v: "Oct 2026" },
      { k: "Genre", v: "Action RPG" },
    ],
    overview: {
      kicker: "Overview",
      title: "Ruin, rebuilding, and the dark beyond the walls.",
      lead: "Shadow of Beginnings is an action-RPG of ruin and rebuilding. Gather what's left, brave the horrors beyond the walls, and bring the Town of Beginnings back from the dark.",
      dim: "Every expedition feeds the town; every rebuilt corner pushes the dark back a little further. More on the world and combat coming soon.",
    },
    pillars: {
      kicker: "Pillars",
      title: "The loop at its heart.",
      items: [
        { ic: "◇", h: "Gather & rebuild", p: "Bring back materials and restore the town piece by piece." },
        { ic: "◈", h: "Brave the dark", p: "Fight the horrors and monsters that prowl beyond the walls." },
        { ic: "◆", h: "A town worth saving", p: "Survivors, stories, and a home that grows as you fight for it." },
      ],
    },
    gallery: { kicker: "Gallery", title: "From the Town of Beginnings.", note: "Screenshots coming soon" },
    cta: {
      kicker: "Wishlist soon",
      title: "Help rebuild the town.",
      lead: "Shadow of Beginnings is in development for Steam. A store page and wishlist are coming.",
      comingSoon: true,
    },
  },

  synx: {
    slug: "synx",
    title: "SynX",
    status: "Ongoing",
    statusClass: "dev",
    tags: ["QA", "Dev"],
    category: "agency",
    inDevelopment: false,
    gridLabel: "Sensor Ops · QA + Dev",
    gridFlag: "Agency",
    meta: "Sensor Ops · UAS missions & training",
    desc: "An ongoing QA and development partnership with Sensor Ops on SynX, a UAS missions and training platform. From bug triage to feature work, we keep it sharp and shipping.",
    clientLogo: "/assets/sensorops-logo.svg",
    link: { url: "https://sensorops.io/syndojo/", label: "Visit SynX" },
    caseLead:
      "An ongoing QA and development partnership with Sensor Ops on SynX, a UAS missions and training platform.",
    facts: [
      { k: "Client", v: "Sensor Ops" },
      { k: "Engagement", v: "QA + Dev" },
      { k: "Status", v: "Ongoing" },
      { k: "Domain", v: "UAS training" },
    ],
    overview: {
      kicker: "The engagement",
      title: "Keeping SynX sharp and shipping.",
      lead: "Kazper Kreative partners with Sensor Ops on SynX, their UAS (uncrewed aircraft systems) missions and training platform. Our agents handle quality assurance and development work, keeping the product stable, tested, and moving forward.",
      dim: "It's an ongoing, embedded partnership, the kind of agency work where we plug into a client's team and ship alongside them. Outcomes and metrics coming soon.",
    },
    pillars: {
      kicker: "What we do",
      title: "Our role on SynX.",
      items: [
        { ic: "◇", h: "Quality assurance", p: "Structured testing, regression passes, and bug triage across releases." },
        { ic: "◈", h: "Development", p: "Hands-on feature and fix work alongside the Sensor Ops team." },
        { ic: "◆", h: "Ongoing partnership", p: "Embedded, continuous support as the platform evolves." },
      ],
    },
    gallery: {
      kicker: "Gallery",
      title: "SynX in action.",
      note: "Screenshots coming soon (with client approval)",
    },
    cta: {
      kicker: "See it live",
      title: "Explore SynX.",
      lead: "SynX is live and evolving. Take a look at the platform we help build and keep flight-ready.",
      primary: { url: "https://sensorops.io/syndojo/", label: "Visit SynX ↗" },
    },
  },
};

export const PROJECT_ORDER: ProjectSlug[] = [
  "mechaverse",
  "vengeance",
  "shadow",
  "synx",
];

export const projectList = (): Project[] => PROJECT_ORDER.map((s) => PROJECTS[s]);
