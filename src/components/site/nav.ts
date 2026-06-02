// Shared navigation + social link config for the site chrome.

export const NAV_LINKS: { href: string; label: string; mobileLabel?: string }[] = [
  { href: "/agency", label: "Agency" },
  { href: "/studio", label: "Studio", mobileLabel: "Studio · Kazper's Echo" },
  { href: "/work", label: "Work" },
  { href: "/join", label: "Join", mobileLabel: "Join the network" },
  { href: "/contact", label: "Contact" },
];

export const SOCIAL_LINKS: { href: string; label: string }[] = [
  { href: "https://discord.gg/ThqZ8wfzmC", label: "Discord" },
  { href: "https://x.com/KazperKreative", label: "X / Twitter" },
  { href: "https://www.tiktok.com/@kazperthekreative", label: "TikTok" },
  { href: "https://www.twitch.tv/kazperkreative", label: "Twitch" },
  { href: "https://www.linkedin.com/company/kazper-kreative-llc", label: "LinkedIn" },
  { href: "https://github.com/Kazper-Kreative", label: "GitHub" },
];
