"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AgreementDocument } from "@/components/agreement/AgreementDocument";
import { SignaturePad } from "@/components/agreement/SignaturePad";
import { ROOMS, type RoomId } from "@/lib/rates";
import { addHoursToTime } from "@/lib/time";

type PublicAgreement = {
  id: string;
  accessCode: string;
  status: "draft" | "signed";
  revision: number;
  templateVersion: number;
  fill: {
    renterName: string;
    renterEmail: string;
    renterPhone: string;
    roomId: RoomId;
    roomName: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    durationHours: number;
    total: number;
    deposit: number;
    cancellationNotice: string;
    cancellationFeeLabel: string;
    recordingStorageDuration: string;
    agreementDate: string;
  };
  renterSignature?: string | null;
  ownerSignature?: string | null;
  renterSignedAt?: string | null;
  ownerSignedAt?: string | null;
  hasRenterSignature?: boolean;
  hasOwnerSignature?: boolean;
  updatedAt: string;
};

export function AgreementEditor({
  id,
  initialCode,
}: {
  id: string;
  initialCode: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [agreement, setAgreement] = useState<PublicAgreement | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [renterSig, setRenterSig] = useState("");
  const [ownerSig, setOwnerSig] = useState("");
  const [ownerCode, setOwnerCode] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<PublicAgreement["fill"] | null>(null);

  const load = useCallback(async (accessCode: string) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/agreements/${id}?code=${encodeURIComponent(accessCode)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load agreement");
      setAgreement(data.agreement);
      setDraft(data.agreement.fill);
      setCode(data.agreement.accessCode);
    } catch (err) {
      setAgreement(null);
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setBusy(false);
    }
  }, [id]);

  useEffect(() => {
    if (initialCode) void load(initialCode);
  }, [initialCode, load]);

  async function saveUpdates() {
    if (!draft) return;
    setBusy(true);
    setError("");
    try {
      const endTime = addHoursToTime(draft.startTime, draft.durationHours);
      const res = await fetch(`/api/agreements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          ...draft,
          endTime,
          clearSignatures: agreement?.status === "signed",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setAgreement(data.agreement);
      setDraft(data.agreement.fill);
      setEditMode(false);
      setRenterSig("");
      setOwnerSig("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function sign(role: "renter" | "owner") {
    const signatureDataUrl = role === "renter" ? renterSig : ownerSig;
    if (!signatureDataUrl) {
      setError("Draw a signature first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/agreements/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          role,
          signatureDataUrl,
          ownerCode: role === "owner" ? ownerCode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign failed");
      setAgreement(data.agreement);
      if (role === "renter") setRenterSig("");
      else setOwnerSig("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign failed");
    } finally {
      setBusy(false);
    }
  }

  if (!agreement && !initialCode) {
    return (
      <div className="max-w-md space-y-4">
        <p className="text-paper-dim">Enter the access code from your agreement email or booking confirmation.</p>
        <input
          className="input"
          placeholder="Access code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        <button type="button" className="btn btn-solid" onClick={() => load(code)} disabled={busy}>
          Open agreement
        </button>
        {error && <p className="text-sm text-accent">{error}</p>}
      </div>
    );
  }

  if (!agreement || !draft) {
    return (
      <p className="text-paper-dim">{busy ? "Loading agreement…" : error || "Agreement unavailable."}</p>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border border-rule bg-graphite/50 p-4">
        <div>
          <p className="font-caps text-[18px] text-muted">
            Status · {agreement.status} · rev {agreement.revision} · template v
            {agreement.templateVersion}
          </p>
          <p className="mt-2 text-sm text-paper-dim">
            Access code{" "}
            <strong className="text-paper">{agreement.accessCode}</strong> —
            save this to reopen later.{" "}
            <Link href="/agreement/lookup" className="text-cyan">
              Email lookup
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "Cancel edits" : "Update details"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => window.print()}
          >
            Print / save PDF
          </button>
        </div>
      </div>

      {editMode && (
        <div className="grid gap-3 border border-rule p-4 sm:grid-cols-2">
          {(
            [
              ["renterName", "Renter name"],
              ["renterEmail", "Email"],
              ["renterPhone", "Phone"],
              ["sessionDate", "Session date"],
              ["startTime", "Start (HH:MM)"],
              ["durationHours", "Hours"],
              ["total", "Total $"],
              ["deposit", "Deposit $"],
              ["cancellationNotice", "Cancel notice"],
              ["cancellationFeeLabel", "Cancel fee label"],
              ["recordingStorageDuration", "Recording storage"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="font-caps text-[18px] text-muted">{label}</span>
              <input
                className="input mt-1"
                value={String(draft[key] ?? "")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [key]:
                      key === "durationHours" || key === "total" || key === "deposit"
                        ? Number(e.target.value)
                        : e.target.value,
                  })
                }
              />
            </label>
          ))}
          <label className="block">
            <span className="font-caps text-[18px] text-muted">Room</span>
            <select
              className="select mt-1"
              value={draft.roomId}
              onChange={(e) =>
                setDraft({ ...draft, roomId: e.target.value as RoomId })
              }
            >
              {ROOMS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <button
              type="button"
              className="btn btn-solid"
              disabled={busy}
              onClick={saveUpdates}
            >
              {agreement.status === "signed"
                ? "Save changes & require re-sign"
                : "Save draft updates"}
            </button>
            {agreement.status === "signed" && (
              <p className="mt-2 text-xs text-accent">
                Changing a signed agreement clears signatures and bumps the
                revision so both parties can re-sign.
              </p>
            )}
          </div>
        </div>
      )}

      <AgreementDocument
        fill={agreement.fill as never}
        renterSignature={agreement.renterSignature}
        ownerSignature={agreement.ownerSignature}
        renterSignedAt={agreement.renterSignedAt}
        ownerSignedAt={agreement.ownerSignedAt}
      />

      <section className="grid gap-8 border-t border-rule pt-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Renter e-sign</h2>
          {agreement.hasRenterSignature ? (
            <p className="mt-3 text-sm text-muted">
              Signed {agreement.renterSignedAt?.slice(0, 19).replace("T", " ")} UTC
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                Draw your signature below, then lock the agreement.
              </p>
              <div className="mt-4">
                <SignaturePad onChange={setRenterSig} disabled={busy} />
              </div>
              <button
                type="button"
                className="btn btn-solid mt-4"
                disabled={busy || !renterSig}
                onClick={() => sign("renter")}
              >
                Sign as renter
              </button>
            </>
          )}
        </div>
        <div>
          <h2 className="font-display text-2xl">Studio owner e-sign</h2>
          {agreement.hasOwnerSignature ? (
            <p className="mt-3 text-sm text-muted">
              Signed {agreement.ownerSignedAt?.slice(0, 19).replace("T", " ")} UTC
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                Optional counter-signature. Requires the studio owner code.
              </p>
              <input
                className="input mt-3"
                placeholder="Owner code"
                value={ownerCode}
                onChange={(e) => setOwnerCode(e.target.value)}
              />
              <div className="mt-4">
                <SignaturePad onChange={setOwnerSig} disabled={busy} />
              </div>
              <button
                type="button"
                className="btn btn-solid mt-4"
                disabled={busy || !ownerSig || !ownerCode}
                onClick={() => sign("owner")}
              >
                Sign as studio
              </button>
            </>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  );
}
