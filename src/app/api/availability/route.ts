import { NextRequest, NextResponse } from "next/server";
import { getAvailableStarts } from "@/lib/availability";
import { ROOMS, type RoomId, ENGINEERED } from "@/lib/rates";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room") as RoomId | null;
  const date = searchParams.get("date");
  const durationRaw = searchParams.get("hours");
  const durationHours = durationRaw
    ? Number(durationRaw)
    : ENGINEERED.minimumHours;

  if (!roomId || !ROOMS.some((r) => r.id === roomId)) {
    return NextResponse.json(
      { error: "Valid room required (mercury|venus|earth|mars)." },
      { status: 400 },
    );
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date required as YYYY-MM-DD." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(durationHours) || durationHours <= 0) {
    return NextResponse.json({ error: "hours must be a positive number." }, { status: 400 });
  }

  const result = getAvailableStarts(roomId, date, durationHours);
  return NextResponse.json({
    roomId,
    date,
    ...result,
    minimumHours: ENGINEERED.minimumHours,
  });
}
