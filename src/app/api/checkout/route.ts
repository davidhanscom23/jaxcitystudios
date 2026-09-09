import { NextRequest, NextResponse } from "next/server";
import { DEPOSIT, STUDIO, type RoomId } from "@/lib/rates";
import {
  attachPaymentRef,
  createBooking,
  isSlotAvailable,
} from "@/lib/availability";
import { createPayPalOrder } from "@/lib/paypal";
import { paypalConfigured } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Creates a calendar hold + PayPal order for the 50% deposit.
 * Body matches the booking modal payload, plus optional paymentMethod.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    date,
    roomId,
    packageId,
    start,
    end,
    hours,
    name,
    email,
    phone,
    clientType,
    selectedAddons,
    total,
    deposit,
    balance,
    planner,
    paymentMethod = "paypal",
  } = body;

  if (!email || !deposit || !total || !date || !roomId || !start || !end) {
    return NextResponse.json(
      { error: "Missing booking fields for checkout." },
      { status: 400 },
    );
  }

  if (!isSlotAvailable(roomId as RoomId, date, start, end)) {
    return NextResponse.json(
      {
        error:
          "That room and time is no longer available. Go back and pick another start time.",
      },
      { status: 409 },
    );
  }

  const method =
    paymentMethod === "venmo"
      ? "venmo"
      : paymentMethod === "zelle"
        ? "zelle"
        : "paypal";

  const held = createBooking({
    roomId: roomId as RoomId,
    date,
    start,
    end,
    status: "held",
    clientName: name,
    clientEmail: email,
    clientPhone: phone,
    clientType,
    packageId,
    hours: Number(hours),
    totalCents: Math.round(Number(total) * 100),
    depositCents: Math.round(Number(deposit) * 100),
    paymentMethod: method,
    notes: planner
      ? `Planner attached (${String(planner.title || "show")})`
      : undefined,
  });

  if (!held.ok) {
    return NextResponse.json({ error: held.error }, { status: 409 });
  }

  // Manual Zelle path — no processor API
  if (method === "zelle") {
    return NextResponse.json({
      mode: "manual",
      bookingId: held.bookingId,
      message:
        "Slot held. Send the deposit by Zelle, then the studio will confirm.",
    });
  }

  if (!paypalConfigured()) {
    return NextResponse.json(
      {
        error:
          "PayPal is not configured. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET (sandbox or live). Your slot is held as pending payment.",
        bookingId: held.bookingId,
      },
      { status: 503 },
    );
  }

  try {
    const order = await createPayPalOrder({
      amount: Number(deposit),
      bookingId: held.bookingId,
      description: `${STUDIO.name} 50% deposit · ${date} · ${roomId} · ${start}–${end}. ${DEPOSIT.policy} Balance $${balance} due on arrival.`,
    });

    attachPaymentRef(held.bookingId, order.id, method);

    return NextResponse.json({
      mode: "paypal",
      orderId: order.id,
      bookingId: held.bookingId,
      addons: selectedAddons || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal error";
    return NextResponse.json({ error: message, bookingId: held.bookingId }, { status: 500 });
  }
}
