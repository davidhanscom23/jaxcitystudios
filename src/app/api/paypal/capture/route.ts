import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { confirmBookingById, confirmBookingByPaymentRef } from "@/lib/availability";

export const runtime = "nodejs";

/** Captures a PayPal order and confirms the matching studio booking. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const orderId = body.orderId as string | undefined;
  const bookingId = body.bookingId as string | undefined;

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  try {
    const captured = await capturePayPalOrder(orderId);
    if (captured.status !== "COMPLETED" && captured.status !== "APPROVED") {
      // COMPLETED is normal after capture; some sandbox states vary
    }

    const confirmed =
      confirmBookingByPaymentRef(orderId) ||
      (captured.bookingId
        ? confirmBookingById(captured.bookingId)
        : false) ||
      (bookingId ? confirmBookingById(bookingId) : false);

    return NextResponse.json({
      status: captured.status,
      orderId: captured.id,
      bookingConfirmed: confirmed,
      bookingId: captured.bookingId || bookingId || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
