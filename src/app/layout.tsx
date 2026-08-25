import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";

/**
 * SF Pro Display for text, with Inter behind it.
 *
 * Named, not served. SF Pro Display is the system face on Apple devices, so
 * naming it uses the installed copy; shipping the file would be the licence
 * problem. Inter covers everything else and is near enough that the two read
 * as one decision rather than two.
 *
 * Geist Mono carries the labels, timestamps and code, which is
 * the register the whole page is written in. It is also properly open-licensed
 * — SF Pro Display is licensed for Apple platform UI, not third-party web use.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/** Every technical annotation on the site: floor levels, timings, codes. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

import { ScrollToTop } from "@/components/ScrollToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { publicApi } from "@/lib/api/public";

/**
 * The tab title and icon, from the admin panel.
 *
 * Generated per request rather than fixed at build time, so changing the name
 * or the icon does not need a deploy. Wrapped, because this runs before
 * anything is on screen: a settings call that fails should cost the custom
 * name, not the page.
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await publicApi.siteSettings();
    return {
      title: site.meta.title.replace("Aravo", settings.company_name),
      description: site.meta.description,
      icons: settings.icon_url ? { icon: settings.icon_url } : undefined,
    };
  } catch {
    return { title: site.meta.title, description: site.meta.description };
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The site scrolls smoothly, and Next needs telling so it does not fight
    // that on a route change - documentation is read by following links
    // between pages, so route changes happen constantly.
    <html lang="en" className="w-full" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        {children}
        <WhatsAppButton />
        <ScrollToTop />
      </body>
    </html>
  );
}
