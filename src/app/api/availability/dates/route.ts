import { NextRequest, NextResponse } from "next/server";
import { getAvailableDates } from "@/lib/availability";
import { ROOMS, type RoomId, ENGINEERED } from "@/lib/rates";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("room") as RoomId | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
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
    if (
      !from ||
      !to ||
      !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(to)
    ) {
      return NextResponse.json(
        { error: "from and to required as YYYY-MM-DD." },
        { status: 400 },
      );
    }
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      return NextResponse.json(
        { error: "hours must be a positive number." },
        { status: 400 },
      );
    }

    // Cap range to ~92 days to keep SQLite scans snappy.
    const fromMs = Date.parse(`${from}T00:00:00Z`);
    const toMs = Date.parse(`${to}T00:00:00Z`);
    if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs < fromMs) {
      return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
    }
    if ((toMs - fromMs) / 86_400_000 > 92) {
      return NextResponse.json(
        { error: "Date range too large (max 92 days)." },
        { status: 400 },
      );
    }

    const result = getAvailableDates(roomId, from, to, durationHours);
    return NextResponse.json({
      roomId,
      from,
      to,
      ...result,
      minimumHours: ENGINEERED.minimumHours,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not load available dates.";
    console.error("[availability/dates]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
