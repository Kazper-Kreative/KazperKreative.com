import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/utilities/ThemeProvider";
import { AudioProvider } from "@/components/utilities/AudioProvider";
import AuthProvider from "@/components/utilities/AuthProvider";
import RoleSync from "@/components/utilities/RoleSync";
import ScanlineOverlay from "@/components/atoms/ScanlineOverlay";
import GlitchTransition from "@/components/atoms/GlitchTransition";

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
  title: "Kazper Kreative LLC | High-End Game Development, QA & Immersive UI",
  description:
    "Premium agency specializing in high-end game development, QA engineering, and immersive UI, expanding into the Ontario market.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Kazper Kreative LLC",
    description:
      "Premium agency specializing in high-end game development, QA engineering, and immersive UI.",
    url: siteUrl,
    siteName: "Kazper Kreative LLC",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kazper Kreative LLC",
    description:
      "Premium agency specializing in high-end game development, QA engineering, and immersive UI.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RoleSync />
            <AudioProvider>
              <ScanlineOverlay />
              <GlitchTransition />
              {children}
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
