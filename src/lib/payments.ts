import { STUDIO } from "@/lib/rates";

/**
 * PayPal / Venmo / Zelle payment config.
 *
 * PayPal (and Venmo via PayPal Checkout) need:
 *   NEXT_PUBLIC_PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_MODE=sandbox|live
 *
 * Zelle has no public website API — we show instructions and hold the booking.
 * Destination uses the studio’s real email/phone unless overridden.
 */
export const PAYMENTS = {
  paypalMode: (process.env.PAYPAL_MODE || "sandbox") as "sandbox" | "live",
  paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
  paypalSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  /** Optional Venmo @handle for manual fallback copy */
  venmoHandle: process.env.NEXT_PUBLIC_VENMO_HANDLE || "",
  /** Zelle destination — defaults to real studio email */
  zelleDestination:
    process.env.NEXT_PUBLIC_ZELLE_DESTINATION || STUDIO.email,
  zelleName: process.env.NEXT_PUBLIC_ZELLE_NAME || STUDIO.name,
} as const;

export function paypalConfigured(): boolean {
  return Boolean(PAYMENTS.paypalClientId && PAYMENTS.paypalSecret);
}

export function paypalApiBase(): string {
  return PAYMENTS.paypalMode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}
