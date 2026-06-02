import type { Metadata } from "next";
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SiteInteractions from "@/components/site/SiteInteractions";
import { ProjectModalProvider } from "@/components/site/ProjectModal";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kazperkreative.com";

export const metadata: Metadata = {
  title: {
    default: "Kazper Kreative · Agency × Game Studio",
    template: "%s · Kazper Kreative",
  },
  description:
    "Kazper Kreative is a creative agency and the home of Kazper's Echo, an Unreal Engine game studio. Cutting-edge real-time worlds, brands, and the network of agents who build them.",
  metadataBase: new URL(siteUrl),
  icons: { icon: "/assets/k-mark.png" },
  openGraph: {
    title: "Kazper Kreative · Agency × Game Studio",
    description:
      "A creative agency and the home of Kazper's Echo. We build worlds, brands, and the network behind them.",
    url: siteUrl,
    siteName: "Kazper Kreative",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kazper Kreative · Agency × Game Studio",
    description:
      "A creative agency and the home of Kazper's Echo. We build worlds, brands, and the network behind them.",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Kazper Kreative",
      url: siteUrl,
      description:
        "A creative agency and the home of Kazper's Echo, an Unreal Engine game studio.",
      sameAs: [
        "https://x.com/KazperKreative",
        "https://www.linkedin.com/company/kazper-kreative-llc",
        "https://github.com/Kazper-Kreative",
        "https://www.twitch.tv/kazperkreative",
        "https://www.tiktok.com/@kazperthekreative",
      ],
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service-unreal`,
      name: "Unreal Engine development",
      serviceType: "Real-time 3D & game development",
      provider: { "@id": `${siteUrl}/#organization` },
      description:
        "Real-time apps, configurators, and interactive builds in Unreal Engine 5, from prototype to ship.",
    },
    {
      "@type": "VideoGameSeries",
      "@id": `${siteUrl}/#kazpers-echo`,
      name: "Kazper's Echo",
      publisher: { "@id": `${siteUrl}/#organization` },
      description:
        "Kazper Kreative's in-house game studio building original real-time worlds.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ProjectModalProvider>
          {children}
        </ProjectModalProvider>
        <SiteInteractions />
        <Analytics />
      </body>
    </html>
  );
}
