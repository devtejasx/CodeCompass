import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { cn } from "@/lib/utils";
import "./globals.css";

const SITE_URL = "https://codecompass.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CodeCompass — Navigate Your Journey Into Tech",
    template: "%s · CodeCompass",
  },
  description:
    "CodeCompass helps you discover technology careers, understand what to learn, and navigate your journey into tech.",
  applicationName: "CodeCompass",
  keywords: [
    "tech career guidance",
    "learning roadmap",
    "beginner developer",
    "what to learn next",
    "software engineering path",
  ],
  authors: [{ name: "CodeCompass" }],
  creator: "CodeCompass",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "CodeCompass",
    title: "CodeCompass — Navigate Your Journey Into Tech",
    description:
      "CodeCompass helps you discover technology careers, understand what to learn, and navigate your journey into tech.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCompass — Navigate Your Journey Into Tech",
    description:
      "CodeCompass helps you discover technology careers, understand what to learn, and navigate your journey into tech.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior tells Next this smooth scrolling is intentional, so
    // it keeps suppressing it during route transitions in future versions.
    <html
      lang="en"
      className="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={cn(
          GeistSans.variable,
          GeistMono.variable,
          "min-h-screen bg-background font-sans text-foreground",
        )}
      >
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-lg focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
