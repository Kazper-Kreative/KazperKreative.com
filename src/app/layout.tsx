import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/utilities/ThemeProvider";
import AuthProvider from "@/components/utilities/AuthProvider";
import RoleSync from "@/components/utilities/RoleSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kazperkreative.com";

export const metadata: Metadata = {
  title: "Kazper Kreative LLC | Game development, QA & immersive UI",
  description:
    "Kazper Kreative builds Unreal Engine titles, QA pipelines, and immersive UI for studios in Ontario and beyond.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Kazper Kreative LLC",
    description:
      "Game development, QA engineering, and immersive UI — engineered end-to-end.",
    url: siteUrl,
    siteName: "Kazper Kreative LLC",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kazper Kreative LLC",
    description:
      "Game development, QA engineering, and immersive UI — engineered end-to-end.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Kazper Kreative LLC",
      url: siteUrl,
      description:
        "Game development, QA engineering, and immersive UI agency based in Ontario, Canada.",
      sameAs: [
        "https://www.upwork.com/agencies/1990979485860235162/",
      ],
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service-game-dev`,
      name: "Game development",
      serviceType: "Game development",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Place", name: "Ontario, Canada" },
      description:
        "End-to-end Unreal Engine game development, from prototype to ship.",
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service-qa`,
      name: "QA engineering",
      serviceType: "Software quality assurance",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Place", name: "Ontario, Canada" },
      description:
        "QA pipelines, automation, and performance analysis for games and web applications.",
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service-ui`,
      name: "Immersive UI",
      serviceType: "User interface design and engineering",
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: { "@type": "Place", name: "Ontario, Canada" },
      description:
        "Real-time, motion-rich interfaces for games, web applications, and dashboards.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RoleSync />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
