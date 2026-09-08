import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { DEPOSIT, STUDIO } from "@/lib/rates";

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

  if (!email || !deposit || !total) {
    return NextResponse.json(
      { error: "Missing booking fields for checkout." },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const meta: Record<string, string> = {
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
          "Stripe is not configured. Add STRIPE_SECRET_KEY (test) in .env.local. For live charges, paste your key into STRIPE_LIVE_SECRET_KEY and set STRIPE_MODE=live. See .env.example.",
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
              description: `${DEPOSIT.policy} Balance $${balance} due on arrival. ${date} · ${roomId} · ${hours}h`,
            },
          },
        },
      ],
      metadata: meta,
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
