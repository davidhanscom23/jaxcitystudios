import { getDb } from "@/lib/db";
import { INTRO_PROMO } from "@/lib/rates";

export type PriorBooking = {
  id: string;
  client_email: string | null;
  client_phone: string | null;
  client_type: string | null;
  promo_id: string | null;
  status: string;
  session_date: string;
  created_at: string;
};

export type ClientEligibility = {
  canUseFirstTime: boolean;
  canUseIntroPromo: boolean;
  priorBookingCount: number;
  usedIntroPromo: boolean;
  reason: string | null;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function phonesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const a10 = a.slice(-10);
  const b10 = b.slice(-10);
  return a10.length === 10 && b10.length === 10 && a10 === b10;
}

/** Held or confirmed bookings that match this email and/or phone. */
export function findPriorSessions(
  email?: string | null,
  phone?: string | null,
): PriorBooking[] {
  const emailN = email ? normalizeEmail(email) : "";
  const phoneN = phone ? normalizePhone(phone) : "";
  if (!emailN && phoneN.length < 10) return [];

  const db = getDb();
  const byId = new Map<string, PriorBooking>();

  if (emailN) {
    const rows = db
      .prepare(
        `SELECT id, client_email, client_phone, client_type, promo_id, status,
                session_date, created_at
         FROM bookings
         WHERE status IN ('held', 'confirmed')
           AND client_email IS NOT NULL
           AND lower(trim(client_email)) = ?
         ORDER BY created_at ASC`,
      )
      .all(emailN) as PriorBooking[];
    for (const row of rows) byId.set(row.id, row);
  }

  if (phoneN.length >= 10) {
    const rows = db
      .prepare(
        `SELECT id, client_email, client_phone, client_type, promo_id, status,
                session_date, created_at
         FROM bookings
         WHERE status IN ('held', 'confirmed')
           AND client_phone IS NOT NULL
           AND trim(client_phone) != ''
         ORDER BY created_at ASC`,
      )
      .all() as PriorBooking[];
    for (const row of rows) {
      if (phonesMatch(normalizePhone(row.client_phone || ""), phoneN)) {
        byId.set(row.id, row);
      }
    }
  }

  return [...byId.values()];
}

export function getClientEligibility(
  email?: string | null,
  phone?: string | null,
): ClientEligibility {
  const prior = findPriorSessions(email, phone);
  const usedIntroPromo = prior.some((b) => b.promo_id === INTRO_PROMO.id);
  const hasPriorSession = prior.length > 0;
  const canUseFirstTime = !hasPriorSession;
  const canUseIntroPromo = !hasPriorSession && !usedIntroPromo;

  let reason: string | null = null;
  if (usedIntroPromo) {
    reason =
      "This email or phone already used the intro offer (2 hours for $80).";
  } else if (hasPriorSession) {
    reason =
      "This email or phone already has a held or confirmed session — first-time rates and the intro offer apply once.";
  }

  return {
    canUseFirstTime,
    canUseIntroPromo,
    priorBookingCount: prior.length,
    usedIntroPromo,
    reason,
  };
}
