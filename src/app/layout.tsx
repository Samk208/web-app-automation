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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
  title: {
    default: "AI Automation Agency | Agentic OS",
    template: "%s | AI Automation Agency",
  },
  description: "Enterprise-grade AI agents for International Trade, Cross-Border E-commerce, and Government Validation. Build autonomous workflows with self-correcting logic.",
  keywords: ["AI Agents", "Automation Agency", "Deep Tech", "Export Compliance", "Cross-Border Ecommerce", "Agentic Workflows", "Self-Correcting AI"],
  authors: [{ name: "AI Automation Agency" }],
  creator: "AI Automation Agency",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-automation.agency",
    title: "AI Automation Agency | Agentic OS",
    description: "The Operating System for Enterprise Autonomy. Deploy agents that Plan, Reason, and Verify.",
    siteName: "AI Automation Agency",
    images: [
      {
        url: "/og-image.jpg", // We need to ensure this exists or use a placeholder
        width: 1200,
        height: 630,
        alt: "AI Automation Agency - Deep Tech Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Automation Agency | Agentic OS",
    description: "The Operating System for Enterprise Autonomy. Deploy agents that Plan, Reason, and Verify.",
    images: ["/og-image.jpg"],
    creator: "@aiautoagency",
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
