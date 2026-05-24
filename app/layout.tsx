import type { Metadata, Viewport } from "next";
import { SiteContactJsonLd } from "@/components/SiteContactJsonLd";
import { SITE_CONTENT } from "@/data/siteContent";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_CONTENT.meta.title,
  description: SITE_CONTENT.meta.description,
  icons: {
    icon: [
      {
        url: "/branding/logo-icon-128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        url: "/branding/logo-icon-256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        url: "/branding/logo-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/branding/logo-icon-256.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  },
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
      <body className="min-h-full">
        <SiteContactJsonLd />
        {children}
      </body>
    </html>
  );
}
