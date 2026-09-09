import { randomUUID } from "crypto";
import { ENGINEERED, type RoomId } from "@/lib/rates";
import { getDb } from "@/lib/db";
import {
  minutesToTime,
  studioCloseBoundary,
  timeToMinutes,
  toStudioDayMinutes,
} from "@/lib/time";

export type StudioHours = {
  openTime: string;
  closeTime: string;
  slotMinutes: number;
  notes: string | null;
};

export type BookingRow = {
  id: string;
  room_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

export function getStudioHours(): StudioHours {
  const row = getDb()
    .prepare(
      "SELECT open_time, close_time, slot_minutes, notes FROM studio_hours WHERE id = 1",
    )
    .get() as {
    open_time: string;
    close_time: string;
    slot_minutes: number;
    notes: string | null;
  };
  return {
    openTime: row.open_time,
    closeTime: row.close_time,
    slotMinutes: row.slot_minutes,
    notes: row.notes,
  };
}

export { timeToMinutes, minutesToTime } from "@/lib/time";

export function getBookingsForDay(roomId: RoomId, date: string): BookingRow[] {
  return getDb()
    .prepare(
      `SELECT id, room_id, session_date, start_time, end_time, status
       FROM bookings
       WHERE room_id = ?
         AND session_date = ?
         AND status IN ('held', 'confirmed')
       ORDER BY start_time`,
    )
    .all(roomId, date) as BookingRow[];
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function isSlotAvailable(
  roomId: RoomId,
  date: string,
  start: string,
  end: string,
  excludeBookingId?: string,
): boolean {
  const hours = getStudioHours();
  const { open, close, overnight } = studioCloseBoundary(
    hours.openTime,
    hours.closeTime,
  );
  const startM = toStudioDayMinutes(start, open, overnight);
  let endM = toStudioDayMinutes(end, open, overnight);
  // End that wraps past midnight without landing in the overnight window
  // (e.g. start 23:00 → end 01:00) still needs +24h when end clock < start clock.
  if (endM <= startM) endM += 24 * 60;

  if (endM <= startM) return false;
  if (startM < open || endM > close) return false;
  if ((endM - startM) / 60 < ENGINEERED.minimumHours) return false;

  const existing = getBookingsForDay(roomId, date);
  for (const b of existing) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    let bStart = toStudioDayMinutes(b.start_time, open, overnight);
    let bEnd = toStudioDayMinutes(b.end_time, open, overnight);
    if (bEnd <= bStart) bEnd += 24 * 60;
    if (rangesOverlap(startM, endM, bStart, bEnd)) {
      return false;
    }
  }
  return true;
}

export function getAvailableStarts(
  roomId: RoomId,
  date: string,
  durationHours: number,
): {
  hours: StudioHours;
  durationHours: number;
  availableStarts: string[];
  bookedBlocks: { start: string; end: string; status: string }[];
} {
  const hours = getStudioHours();
  const duration = Math.max(durationHours, ENGINEERED.minimumHours);
  const durationMins = Math.round(duration * 60);
  const { open, close } = studioCloseBoundary(hours.openTime, hours.closeTime);
  const booked = getBookingsForDay(roomId, date);

  const availableStarts: string[] = [];
  for (let t = open; t + durationMins <= close; t += hours.slotMinutes) {
    const start = minutesToTime(t);
    const end = minutesToTime(t + durationMins);
    if (isSlotAvailable(roomId, date, start, end)) {
      availableStarts.push(start);
    }
  }

  return {
    hours,
    durationHours: duration,
    availableStarts,
    bookedBlocks: booked.map((b) => ({
      start: b.start_time,
      end: b.end_time,
      status: b.status,
    })),
  };
}

/** Inclusive YYYY-MM-DD range of days that still have at least one open start. */
export function getAvailableDates(
  roomId: RoomId,
  fromDate: string,
  toDate: string,
  durationHours: number,
): {
  availableDates: string[];
  unavailableDates: string[];
  durationHours: number;
} {
  const duration = Math.max(durationHours, ENGINEERED.minimumHours);
  const availableDates: string[] = [];
  const unavailableDates: string[] = [];

  const from = parseYmd(fromDate);
  const to = parseYmd(toDate);
  if (!from || !to || from > to) {
    return { availableDates, unavailableDates, durationHours: duration };
  }

  const todayYmd = formatYmd(new Date());
  for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const ymd = formatYmd(d);
    if (ymd < todayYmd) {
      unavailableDates.push(ymd);
      continue;
    }
    const { availableStarts } = getAvailableStarts(roomId, ymd, duration);
    if (availableStarts.length > 0) availableDates.push(ymd);
    else unavailableDates.push(ymd);
  }

  return { availableDates, unavailableDates, durationHours: duration };
}

function parseYmd(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return dt;
}

function formatYmd(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export type CreateBookingInput = {
  roomId: RoomId;
  date: string;
  start: string;
  end: string;
  status?: "held" | "confirmed";
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientType?: string;
  packageId?: string;
  hours?: number;
  totalCents?: number;
  depositCents?: number;
  /** @deprecated use paymentRef */
  stripeSessionId?: string;
  paymentMethod?: "paypal" | "venmo" | "zelle" | "manual";
  paymentRef?: string;
  notes?: string;
};

export function createBooking(input: CreateBookingInput): {
  ok: true;
  bookingId: string;
} | { ok: false; error: string } {
  if (!isSlotAvailable(input.roomId, input.date, input.start, input.end)) {
    return {
      ok: false,
      error:
        "That room and time is no longer available. Pick another start time.",
    };
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const paymentRef = input.paymentRef ?? input.stripeSessionId ?? null;
  getDb()
    .prepare(
      `INSERT INTO bookings (
        id, room_id, session_date, start_time, end_time, status,
        client_name, client_email, client_phone, client_type, package_id,
        hours, total_cents, deposit_cents, stripe_session_id, payment_method,
        payment_ref, notes, created_at, updated_at
      ) VALUES (
        @id, @room_id, @session_date, @start_time, @end_time, @status,
        @client_name, @client_email, @client_phone, @client_type, @package_id,
        @hours, @total_cents, @deposit_cents, @stripe_session_id, @payment_method,
        @payment_ref, @notes, @created_at, @updated_at
      )`,
    )
    .run({
      id,
      room_id: input.roomId,
      session_date: input.date,
      start_time: input.start,
      end_time: input.end,
      status: input.status ?? "held",
      client_name: input.clientName ?? null,
      client_email: input.clientEmail ?? null,
      client_phone: input.clientPhone ?? null,
      client_type: input.clientType ?? null,
      package_id: input.packageId ?? null,
      hours: input.hours ?? null,
      total_cents: input.totalCents ?? null,
      deposit_cents: input.depositCents ?? null,
      stripe_session_id: paymentRef,
      payment_method: input.paymentMethod ?? null,
      payment_ref: paymentRef,
      notes: input.notes ?? null,
      created_at: now,
      updated_at: now,
    });

  return { ok: true, bookingId: id };
}

export function confirmBookingByPaymentRef(paymentRef: string): boolean {
  const result = getDb()
    .prepare(
      `UPDATE bookings
       SET status = 'confirmed', updated_at = ?
       WHERE (payment_ref = ? OR stripe_session_id = ?) AND status = 'held'`,
    )
    .run(new Date().toISOString(), paymentRef, paymentRef);
  return result.changes > 0;
}

/** @deprecated use confirmBookingByPaymentRef */
export function confirmBookingByStripeSession(sessionId: string): boolean {
  return confirmBookingByPaymentRef(sessionId);
}

export function confirmBookingById(bookingId: string): boolean {
  const result = getDb()
    .prepare(
      `UPDATE bookings
       SET status = 'confirmed', updated_at = ?
       WHERE id = ? AND status = 'held'`,
    )
    .run(new Date().toISOString(), bookingId);
  return result.changes > 0;
}

export function attachPaymentRef(
  bookingId: string,
  paymentRef: string,
  paymentMethod?: string,
): void {
  getDb()
    .prepare(
      `UPDATE bookings
       SET payment_ref = ?, stripe_session_id = ?, payment_method = COALESCE(?, payment_method), updated_at = ?
       WHERE id = ?`,
    )
    .run(
      paymentRef,
      paymentRef,
      paymentMethod ?? null,
      new Date().toISOString(),
      bookingId,
    );
}

/** @deprecated use attachPaymentRef */
export function attachStripeSession(
  bookingId: string,
  stripeSessionId: string,
): void {
  attachPaymentRef(bookingId, stripeSessionId, "stripe");
}
