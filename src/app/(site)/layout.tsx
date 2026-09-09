import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OfferPopup } from "@/components/OfferPopup";
import { Chatbot } from "@/components/Chatbot";
import { BookingProvider } from "@/components/booking/BookingProvider";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BookingProvider presentation="modal">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <OfferPopup />
      <Chatbot />
    </BookingProvider>
  );
}
