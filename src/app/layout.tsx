import type { Metadata } from "next";
import { Archivo_Black, Barlow_Condensed, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OfferPopup } from "@/components/OfferPopup";
import { Chatbot } from "@/components/Chatbot";
import { BookingProvider } from "@/components/booking/BookingProvider";
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
        <BookingProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <OfferPopup />
          <Chatbot />
        </BookingProvider>
      </body>
    </html>
  );
}
