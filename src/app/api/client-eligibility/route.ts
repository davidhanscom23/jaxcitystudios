import { NextRequest, NextResponse } from "next/server";
import { getClientEligibility } from "@/lib/client-eligibility";

export const runtime = "nodejs";

/**
 * Look up whether an email/phone can still use first-time rates
 * and the one-time intro promo (2 hours for $80).
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  const phone = req.nextUrl.searchParams.get("phone") || "";

  if (!email && !phone) {
    return NextResponse.json(
      { error: "Provide email and/or phone to check eligibility." },
      { status: 400 },
    );
  }

  const eligibility = getClientEligibility(email || null, phone || null);
  return NextResponse.json(eligibility);
}
