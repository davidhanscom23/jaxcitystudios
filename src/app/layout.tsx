import type { Metadata, Viewport } from "next";
import { Archivo_Black, Barlow_Condensed, Newsreader } from "next/font/google";
import "./globals.css";
import { localBusinessJsonLd, pageMeta } from "@/lib/seo";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const caps = Barlow_Condensed({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-caps",
  display: "swap",
});

const body = Newsreader({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  ...pageMeta({
    title: "Recording Studio Jacksonville | Podcast Studio | JaxCity Studios",
    description:
      "JaxCity Studios — music recording and podcast production in Jacksonville, Florida. Engineered sessions from $50–$60/hr. Rooms Mercury–Mars. Press Record.",
    path: "/",
  }),
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jaxcitystudios.com",
  ),
  applicationName: "JaxCity Studios",
  appleWebApp: {
    capable: true,
    title: "JaxCity Book",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${caps.variable} ${body.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
