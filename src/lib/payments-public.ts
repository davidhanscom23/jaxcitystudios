import { STUDIO } from "@/lib/rates";

/** Client-safe payment display config (no secrets). */
export const PUBLIC_PAYMENTS = {
  venmoHandle: process.env.NEXT_PUBLIC_VENMO_HANDLE || "",
  zelleDestination:
    process.env.NEXT_PUBLIC_ZELLE_DESTINATION || STUDIO.email,
  zelleName: process.env.NEXT_PUBLIC_ZELLE_NAME || STUDIO.name,
} as const;
