import { randomUUID } from "crypto";
import { ENGINEERED, type RoomId } from "@/lib/rates";
import { getDb } from "@/lib/db";

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

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

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
  const open = timeToMinutes(hours.openTime);
  const close = timeToMinutes(hours.closeTime);
  const startM = timeToMinutes(start);
  const endM = timeToMinutes(end);

  if (endM <= startM) return false;
  if (startM < open || endM > close) return false;
  if ((endM - startM) / 60 < ENGINEERED.minimumHours) return false;

  const existing = getBookingsForDay(roomId, date);
  for (const b of existing) {
    if (excludeBookingId && b.id === excludeBookingId) continue;
    if (
      rangesOverlap(
        startM,
        endM,
        timeToMinutes(b.start_time),
        timeToMinutes(b.end_time),
      )
    ) {
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
  const open = timeToMinutes(hours.openTime);
  const close = timeToMinutes(hours.closeTime);
  const booked = getBookingsForDay(roomId, date);

  const availableStarts: string[] = [];
  for (
    let t = open;
    t + durationMins <= close;
    t += hours.slotMinutes
  ) {
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
  stripeSessionId?: string;
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
  getDb()
    .prepare(
      `INSERT INTO bookings (
        id, room_id, session_date, start_time, end_time, status,
        client_name, client_email, client_phone, client_type, package_id,
        hours, total_cents, deposit_cents, stripe_session_id, notes,
        created_at, updated_at
      ) VALUES (
        @id, @room_id, @session_date, @start_time, @end_time, @status,
        @client_name, @client_email, @client_phone, @client_type, @package_id,
        @hours, @total_cents, @deposit_cents, @stripe_session_id, @notes,
        @created_at, @updated_at
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
      stripe_session_id: input.stripeSessionId ?? null,
      notes: input.notes ?? null,
      created_at: now,
      updated_at: now,
    });

  return { ok: true, bookingId: id };
}

export function confirmBookingByStripeSession(
  stripeSessionId: string,
): boolean {
  const result = getDb()
    .prepare(
      `UPDATE bookings
       SET status = 'confirmed', updated_at = ?
       WHERE stripe_session_id = ? AND status = 'held'`,
    )
    .run(new Date().toISOString(), stripeSessionId);
  return result.changes > 0;
}

export function attachStripeSession(
  bookingId: string,
  stripeSessionId: string,
): void {
  getDb()
    .prepare(
      `UPDATE bookings
       SET stripe_session_id = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(stripeSessionId, new Date().toISOString(), bookingId);
}
