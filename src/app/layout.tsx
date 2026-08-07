import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://codecompass.dev"),
  title: {
    default: "CodeCompass — Navigate Your Journey Into Tech",
    template: "%s · CodeCompass",
  },
  description:
    "CodeCompass helps beginners discover the right tech career, learn in the correct order, master modern developer tools, and become confident tech professionals.",
  keywords: [
    "learn to code",
    "tech career roadmap",
    "software engineering roadmap",
    "beginner developer",
    "AI developer tools",
  ],
  authors: [{ name: "CodeCompass" }],
  openGraph: {
    type: "website",
    title: "CodeCompass — Navigate Your Journey Into Tech",
    description:
      "A personalized roadmap from zero knowledge to skilled tech professional. Never wonder what to learn next.",
    siteName: "CodeCompass",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeCompass — Navigate Your Journey Into Tech",
    description:
      "A personalized roadmap from zero knowledge to skilled tech professional.",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          mono.variable,
          "min-h-screen bg-background font-sans text-foreground",
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
