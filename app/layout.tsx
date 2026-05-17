import type { Metadata, Viewport } from "next";
import { SITE_CONTENT } from "@/data/siteContent";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_CONTENT.meta.title,
  description: SITE_CONTENT.meta.description,
};

/** Safe-area под вырезы; theme-color согласован с телом (--paper-soft). */
export const viewport: Viewport = {
  themeColor: "#efe8dc",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
