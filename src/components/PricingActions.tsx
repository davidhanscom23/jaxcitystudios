"use client";

import { useBooking } from "@/components/booking/BookingProvider";

export function PricingActions({ packageId }: { packageId?: string }) {
  const { openBooking } = useBooking();
  return (
    <button
      type="button"
      className="btn mt-6"
      onClick={() => openBooking(packageId ? { packageId } : undefined)}
    >
      Book
    </button>
  );
}
