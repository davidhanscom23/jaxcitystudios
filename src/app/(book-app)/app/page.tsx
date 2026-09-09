"use client";

import { InstallHint } from "@/components/booking/InstallHint";

/**
 * Standalone booking shell. The BookingProvider (presentation=standalone)
 * mounts the full booking flow full-screen — no marketing chrome.
 */
export default function BookAppPage() {
  return (
    <div className="relative min-h-[100dvh]">
      <InstallHint />
    </div>
  );
}
