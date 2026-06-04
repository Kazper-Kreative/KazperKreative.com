import type { MetadataRoute } from "next";

// PWA manifest for the installable Lab app (Next 16 native → /manifest.webmanifest).
// start_url is /lab so the home-screen icon launches straight into the Lab;
// scope is "/" so the login / Supabase-auth redirects stay inside the app window.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Lab · Kazper Kreative",
    short_name: "The Lab",
    description:
      "Engine-coached trainers and a ghostly arcade — Kazper Kreative's Lab.",
    start_url: "/lab",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0b0b0e",
    theme_color: "#0b0b0e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
