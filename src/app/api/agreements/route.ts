import { NextRequest, NextResponse } from "next/server";
import {
  createAgreement,
  findAgreementsByEmail,
  publicAgreement,
} from "@/lib/agreements";
import { ROOMS, type RoomId, depositAmount } from "@/lib/rates";
import { addHoursToTime } from "@/lib/time";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get("email");
    if (!email) {
      return NextResponse.json(
        { error: "email query required to look up agreements." },
        { status: 400 },
      );
    }
    const rows = findAgreementsByEmail(email);
    return NextResponse.json({
      agreements: rows.map((r) => ({
        id: r.id,
        accessCode: r.access_code,
        status: r.status,
        revision: r.revision,
        updatedAt: r.updated_at,
        fill: JSON.parse(r.fill_json),
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const roomId = body.roomId as RoomId;
    if (!roomId || !ROOMS.some((r) => r.id === roomId)) {
      return NextResponse.json({ error: "Valid roomId required." }, { status: 400 });
    }
    if (!body.renterName || !body.sessionDate || !body.startTime) {
      return NextResponse.json(
        { error: "renterName, sessionDate, and startTime required." },
        { status: 400 },
      );
    }

    const durationHours = Number(body.durationHours) || 2;
    const endTime = body.endTime || addHoursToTime(body.startTime, durationHours);
    const total = Number(body.total);
    const deposit =
      body.deposit != null ? Number(body.deposit) : depositAmount(total || 0);

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        { error: "total session amount required." },
        { status: 400 },
      );
    }

    const row = createAgreement({
      bookingId: body.bookingId || null,
      input: {
        renterName: body.renterName,
        renterEmail: body.renterEmail,
        renterPhone: body.renterPhone,
        roomId,
        sessionDate: body.sessionDate,
        startTime: body.startTime,
        endTime,
        durationHours,
        total,
        deposit,
        agreementDate: body.agreementDate,
        cancellationNotice: body.cancellationNotice,
        cancellationFeeLabel: body.cancellationFeeLabel,
        recordingStorageDuration: body.recordingStorageDuration,
      },
    });

    return NextResponse.json({ agreement: publicAgreement(row) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create agreement.";
    console.error("[agreements]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
