import { NextRequest, NextResponse } from "next/server";

/** Stores lead intents locally in logs; wire to ESP later if desired. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  console.info("[jaxcity-lead]", {
    at: new Date().toISOString(),
    email: body.email ?? null,
    phone: body.phone ?? null,
    stage: body.stage ?? null,
  });
  return NextResponse.json({ ok: true });
}
