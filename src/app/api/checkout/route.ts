import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { DEPOSIT, STUDIO, type RoomId } from "@/lib/rates";
import {
  attachStripeSession,
  createBooking,
  isSlotAvailable,
} from "@/lib/availability";

/**
 * Stripe wiring:
 * - Test mode (default): STRIPE_SECRET_KEY (sk_test_...)
 * - Live mode: set STRIPE_LIVE_SECRET_KEY (sk_live_...) and STRIPE_MODE=live
 *
 * PASTE YOUR LIVE STRIPE SECRET KEY HERE (env):
 *   STRIPE_LIVE_SECRET_KEY=sk_live_...
 * in your host’s environment variables / .env.local — never commit it.
 */
function getStripe(): Stripe | null {
  const live = process.env.STRIPE_LIVE_SECRET_KEY;
  const test = process.env.STRIPE_SECRET_KEY;
  const mode = process.env.STRIPE_MODE ?? "test";
  const key = mode === "live" ? live : test || live;
  if (!key) return null;
  return new Stripe(key);
}

export const runtime = "nodejs";

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
    notes: planner
      ? `Planner attached (${String(planner.title || "show")})`
      : undefined,
  });

  if (!held.ok) {
    return NextResponse.json({ error: held.error }, { status: 409 });
  }

  const stripe = getStripe();
  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const meta: Record<string, string> = {
    bookingId: held.bookingId,
    date: String(date || ""),
    roomId: String(roomId || ""),
    packageId: String(packageId || ""),
    start: String(start || ""),
    end: String(end || ""),
    hours: String(hours || ""),
    name: String(name || ""),
    phone: String(phone || ""),
    clientType: String(clientType || ""),
    addons: (selectedAddons || []).join(","),
    total: String(total),
    balance: String(balance),
    policy: DEPOSIT.policy,
    planner: planner ? JSON.stringify(planner).slice(0, 400) : "",
  };

  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY (test) in .env.local. For live charges, paste your key into STRIPE_LIVE_SECRET_KEY and set STRIPE_MODE=live. See .env.example. Your slot is held in the studio calendar as pending payment.",
        bookingId: held.bookingId,
      },
      { status: 503 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(Number(deposit) * 100),
            product_data: {
              name: `${STUDIO.name} — 50% session deposit`,
              description: `${DEPOSIT.policy} Balance $${balance} due on arrival. ${date} · ${roomId} · ${start}–${end}`,
            },
          },
        },
      ],
      metadata: meta,
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${held.bookingId}`,
      cancel_url: `${origin}/book/cancel?booking_id=${held.bookingId}`,
    });

    if (session.id) {
      attachStripeSession(held.bookingId, session.id);
    }

    return NextResponse.json({ url: session.url, bookingId: held.bookingId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
