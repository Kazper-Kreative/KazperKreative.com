import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/utilities/ThemeProvider";
import { AudioProvider } from "@/components/utilities/AudioProvider";
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

export const metadata: Metadata = {
  title: "Kazper Kreative LLC | High-End Game Development, QA & Immersive UI",
  description:
    "Premium agency specializing in high-end game development, QA engineering, and immersive UI, expanding into the Ontario market.",
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
              {children}
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
