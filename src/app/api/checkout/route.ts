import { NextRequest, NextResponse } from "next/server";
import {
  ADDONS,
  DEPOSIT,
  INTRO_PROMO,
  STUDIO,
  balanceOnArrival,
  bookingStudioTotal,
  depositAmount,
  type RateMode,
  type RoomId,
} from "@/lib/rates";
import {
  attachPaymentRef,
  createBooking,
  isSlotAvailable,
} from "@/lib/availability";
import { getClientEligibility } from "@/lib/client-eligibility";
import { createPayPalOrder } from "@/lib/paypal";
import { paypalConfigured } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Creates a calendar hold + PayPal order for the 50% deposit.
 * Body matches the booking modal payload, plus optional paymentMethod.
 * Enforces one-time first-session / intro promo eligibility by email+phone.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    date,
    roomId,
    packageId,
    rateMode: rawRateMode,
    start,
    end,
    hours,
    name,
    email,
    phone,
    clientType: rawClientType,
    selectedAddons,
    total,
    deposit,
    planner,
    paymentMethod = "paypal",
    promoId: rawPromoId,
    applyIntroPromo: rawApplyIntro,
  } = body;

  if (!email || !deposit || !total || !date || !roomId || !start || !end) {
    return NextResponse.json(
      { error: "Missing booking fields for checkout." },
      { status: 400 },
    );
  }

  const rateMode: RateMode =
    rawRateMode === "room-only" ? "room-only" : "engineered";

  const eligibility = getClientEligibility(email, phone);
  const clientType: "first-time" | "returning" =
    rawClientType === "returning" ? "returning" : "first-time";

  if (
    rateMode === "engineered" &&
    clientType === "first-time" &&
    !eligibility.canUseFirstTime
  ) {
    return NextResponse.json(
      {
        error:
          eligibility.reason ||
          "First-time rates already used for this email or phone. Choose returning client.",
        eligibility,
      },
      { status: 403 },
    );
  }

  const wantsIntro =
    rateMode === "engineered" &&
    (rawApplyIntro === true ||
      rawPromoId === INTRO_PROMO.id ||
      String(rawPromoId || "") === INTRO_PROMO.id);

  const hoursN = Number(hours);
  let applyIntroPromo = false;
  let promoId: string | null = null;

  if (wantsIntro) {
    if (!eligibility.canUseIntroPromo) {
      return NextResponse.json(
        {
          error:
            eligibility.reason ||
            "The intro offer (2 hours for $80) was already used for this email or phone.",
          eligibility,
        },
        { status: 403 },
      );
    }
    if (clientType !== "first-time") {
      return NextResponse.json(
        { error: "Intro promo requires a first-time engineered session." },
        { status: 400 },
      );
    }
    if (packageId && packageId !== "session") {
      return NextResponse.json(
        { error: "Intro promo only applies to The Session package." },
        { status: 400 },
      );
    }
    if (Math.max(hoursN, 2) !== INTRO_PROMO.hours) {
      return NextResponse.json(
        {
          error: `Intro promo is exactly ${INTRO_PROMO.hours} hours for $${INTRO_PROMO.price}.`,
        },
        { status: 400 },
      );
    }
    applyIntroPromo = true;
    promoId = INTRO_PROMO.id;
  }

  // Recalculate studio + addons so clients cannot underpay via spoofed totals.
  const pkg = rateMode === "room-only" ? "session" : packageId || "session";
  const studioSubtotal = bookingStudioTotal({
    rateMode,
    roomId: roomId as RoomId,
    hours: hoursN,
    clientType,
    applyIntroPromo,
    packageId: pkg,
  });

  const addonIds: string[] =
    rateMode === "room-only"
      ? []
      : Array.isArray(selectedAddons)
        ? selectedAddons
        : [];
  const addonTotal = addonIds.reduce((sum, id) => {
    const a = ADDONS.find((x) => x.id === id);
    return sum + (a?.packagePrice ?? 0);
  }, 0);

  const expectedTotal = studioSubtotal + addonTotal;
  const expectedDeposit = depositAmount(expectedTotal);
  const expectedBalance = balanceOnArrival(expectedTotal);

  // Allow 1 cent float; reject larger mismatches.
  if (
    Math.abs(Number(total) - expectedTotal) > 0.01 ||
    Math.abs(Number(deposit) - expectedDeposit) > 0.01
  ) {
    return NextResponse.json(
      {
        error:
          "Booking total does not match published rates. Refresh and try again.",
        expected: {
          total: expectedTotal,
          deposit: expectedDeposit,
          balance: expectedBalance,
          promoId,
          rateMode,
        },
      },
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
    clientType: rateMode === "room-only" ? undefined : clientType,
    packageId: pkg,
    promoId,
    hours: hoursN,
    totalCents: Math.round(expectedTotal * 100),
    depositCents: Math.round(expectedDeposit * 100),
    paymentMethod: method,
    notes:
      [
        rateMode === "room-only"
          ? "Rate mode: room-only (BYO engineer)"
          : null,
        planner
          ? `Planner attached (${String(planner.title || "show")})`
          : null,
      ]
        .filter(Boolean)
        .join(" · ") || undefined,
  });

  if (!held.ok) {
    return NextResponse.json({ error: held.error }, { status: 409 });
  }

  // Manual Zelle path — no processor API
  if (method === "zelle") {
    return NextResponse.json({
      mode: "manual",
      bookingId: held.bookingId,
      promoId,
      rateMode,
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
      amount: expectedDeposit,
      bookingId: held.bookingId,
      description: `${STUDIO.name} 50% deposit · ${date} · ${roomId} · ${start}–${end} · ${rateMode}. ${DEPOSIT.policy} Balance $${expectedBalance} due on arrival.`,
    });

    attachPaymentRef(held.bookingId, order.id, method);

    return NextResponse.json({
      mode: "paypal",
      orderId: order.id,
      bookingId: held.bookingId,
      promoId,
      rateMode,
      addons: addonIds,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal error";
    return NextResponse.json(
      { error: message, bookingId: held.bookingId },
      { status: 500 },
    );
  }
}
