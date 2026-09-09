import { NextRequest, NextResponse } from "next/server";
import {
  getAgreementByAccess,
  publicAgreement,
  signAgreement,
  updateAgreementFill,
} from "@/lib/agreements";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const code = new URL(req.url).searchParams.get("code") || "";
    const row = getAgreementByAccess(id, code);
    if (!row) {
      return NextResponse.json(
        { error: "Agreement not found or access code invalid." },
        { status: 404 },
      );
    }
    return NextResponse.json({ agreement: publicAgreement(row) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load agreement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const code = body.code || body.accessCode || "";
    const result = updateAgreementFill(id, code, body);
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ agreement: publicAgreement(result) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update agreement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const result = signAgreement({
      id,
      accessCode: body.code || body.accessCode || "",
      role: body.role === "owner" ? "owner" : "renter",
      signatureDataUrl: body.signatureDataUrl || "",
      ownerCode: body.ownerCode,
    });
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ agreement: publicAgreement(result) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not sign agreement.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
