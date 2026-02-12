import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-automation.agency";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WonLink AI — Automation Agency for Korean Businesses",
    template: "%s | WonLink AI",
  },
  description:
    "Enterprise-grade AI agents for International Trade, Cross-Border E-commerce, and Government Compliance. Autonomous workflows with self-correcting logic for Korean businesses.",
  keywords: [
    "AI Agents",
    "Korean Business Automation",
    "WonLink",
    "Export Compliance",
    "Cross-Border Ecommerce",
    "Agentic Workflows",
    "K-Startup",
    "Naver SEO",
    "Grant Scout",
  ],
  authors: [{ name: "WonLink AI" }],
  creator: "WonLink AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ko_KR",
    url: SITE_URL,
    title: "WonLink AI — Automation Agency for Korean Businesses",
    description:
      "The Operating System for Enterprise Autonomy. Deploy agents that Plan, Reason, and Verify.",
    siteName: "WonLink AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WonLink AI — Automation Agency Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WonLink AI — Automation Agency for Korean Businesses",
    description:
      "The Operating System for Enterprise Autonomy. Deploy agents that Plan, Reason, and Verify.",
    images: ["/og-image.jpg"],
    creator: "@wonlink_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
