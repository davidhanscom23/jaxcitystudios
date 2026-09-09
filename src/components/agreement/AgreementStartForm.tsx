"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { AgreementDocument } from "@/components/agreement/AgreementDocument";
import {
  AGREEMENT_POLICY,
  buildAgreementFill,
} from "@/lib/rental-agreement";
import {
  DEPOSIT,
  ENGINEERED,
  ROOMS,
  depositAmount,
  engineeredTotal,
  type RoomId,
} from "@/lib/rates";
import { addHoursToTime } from "@/lib/time";

export function AgreementStartForm({
  initial,
}: {
  initial?: {
    bookingId?: string;
    renterName?: string;
    renterEmail?: string;
    renterPhone?: string;
    roomId?: RoomId;
    sessionDate?: string;
    startTime?: string;
    durationHours?: number;
    total?: number;
    deposit?: number;
  };
}) {
  const router = useRouter();
  const [renterName, setRenterName] = useState(initial?.renterName || "");
  const [renterEmail, setRenterEmail] = useState(initial?.renterEmail || "");
  const [renterPhone, setRenterPhone] = useState(initial?.renterPhone || "");
  const [roomId, setRoomId] = useState<RoomId>(initial?.roomId || "venus");
  const [sessionDate, setSessionDate] = useState(initial?.sessionDate || "");
  const [startTime, setStartTime] = useState(initial?.startTime || "10:00");
  const [durationHours, setDurationHours] = useState(
    initial?.durationHours || ENGINEERED.minimumHours,
  );
  const [total, setTotal] = useState(
    initial?.total ||
      engineeredTotal(initial?.durationHours || ENGINEERED.minimumHours, "first-time"),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const endTime = addHoursToTime(startTime, durationHours);
  const deposit = initial?.deposit ?? depositAmount(total);

  const preview = useMemo(() => {
    if (!renterName || !sessionDate || !startTime) return null;
    try {
      return buildAgreementFill({
        renterName,
        renterEmail,
        renterPhone,
        roomId,
        sessionDate,
        startTime,
        endTime,
        durationHours,
        total,
        deposit,
      });
    } catch {
      return null;
    }
  }, [
    renterName,
    renterEmail,
    renterPhone,
    roomId,
    sessionDate,
    startTime,
    endTime,
    durationHours,
    total,
    deposit,
  ]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: initial?.bookingId,
          renterName,
          renterEmail,
          renterPhone,
          roomId,
          sessionDate,
          startTime,
          endTime,
          durationHours,
          total,
          deposit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create agreement");
      router.push(
        `/agreement/${data.agreement.id}?code=${encodeURIComponent(data.agreement.accessCode)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-muted">
          Fields autofill from your booking selections. Save a draft, sign
          electronically, and reopen later with your access code.{" "}
          <Link href="/agreement/lookup" className="text-cyan">
            Look up a saved agreement
          </Link>
          .
        </p>

        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">Renter name</span>
          <input
            className="input mt-2"
            value={renterName}
            onChange={(e) => setRenterName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">Email</span>
          <input
            type="email"
            className="input mt-2"
            value={renterEmail}
            onChange={(e) => setRenterEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">Phone</span>
          <input
            className="input mt-2"
            value={renterPhone}
            onChange={(e) => setRenterPhone(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">Room</span>
          <select
            className="select mt-2"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value as RoomId)}
          >
            {ROOMS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">Session date</span>
          <input
            type="date"
            className="input mt-2"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">Start time (24h for entry)</span>
          <input
            className="input mt-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="10:00"
            pattern="\d{2}:\d{2}"
            required
          />
        </label>
        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">Hours</span>
          <select
            className="select mt-2"
            value={durationHours}
            onChange={(e) => {
              const h = Number(e.target.value);
              setDurationHours(h);
              if (!initial?.total) setTotal(engineeredTotal(h, "first-time"));
            }}
          >
            {[2, 3, 4, 6, 8].map((h) => (
              <option key={h} value={h}>
                {h} hours
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-caps text-[0.65rem] text-muted">Session total ($)</span>
          <input
            type="number"
            min={1}
            step={1}
            className="input mt-2"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
            required
          />
        </label>
        <p className="text-xs text-muted">
          Deposit autofills at {DEPOSIT.percent}% = ${deposit}. Cancellation
          notice default: {AGREEMENT_POLICY.cancellationNotice}. Recording
          storage default: {AGREEMENT_POLICY.recordingStorageDuration}.
        </p>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" className="btn btn-solid" disabled={busy}>
          {busy ? "Creating…" : "Create electronic agreement"}
        </button>
      </form>

      <div className="border border-rule bg-charcoal/40 p-5 sm:p-8">
        <p className="font-caps text-[0.65rem] text-muted">Live preview</p>
        {preview ? (
          <div className="mt-4">
            <AgreementDocument fill={preview} />
          </div>
        ) : (
          <p className="mt-4 text-paper-dim">
            Enter renter name, date, and start time to preview autofill.
          </p>
        )}
      </div>
    </div>
  );
}
