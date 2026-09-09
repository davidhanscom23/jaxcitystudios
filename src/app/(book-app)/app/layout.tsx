import type { Metadata, Viewport } from "next";
import { BookingProvider } from "@/components/booking/BookingProvider";
import { BookAppServiceWorker } from "@/components/booking/BookAppServiceWorker";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Book a room",
    description:
      "JaxCity Book — pick a room, date, and time. Pay the 50% deposit on your phone.",
    path: "/app",
  }),
  manifest: "/book-app.webmanifest",
  appleWebApp: {
    capable: true,
    title: "JaxCity Book",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function BookAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BookingProvider presentation="standalone" defaultOpen>
      <BookAppServiceWorker />
      <div className="book-app min-h-[100dvh] bg-ink">{children}</div>
    </BookingProvider>
  );
}
