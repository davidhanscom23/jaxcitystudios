import { getDb } from "@/lib/db";

export function cancelBooking(bookingId: string): void {
  getDb()
    .prepare(
      `UPDATE bookings
       SET status = 'cancelled', updated_at = ?
       WHERE id = ? AND status = 'held'`,
    )
    .run(new Date().toISOString(), bookingId);
}
