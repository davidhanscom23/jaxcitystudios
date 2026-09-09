"use client";

import { useState } from "react";
import { AgreementDocument } from "@/components/agreement/AgreementDocument";
import { SignaturePad } from "@/components/agreement/SignaturePad";
import type { AgreementFill } from "@/lib/rental-agreement";

type Props = {
  agreementId: string;
  accessCode: string;
  fill: AgreementFill;
  alreadySigned?: boolean;
  onSigned: () => void;
  onBack: () => void;
  onError: (message: string) => void;
};

export function BookingAgreementStep({
  agreementId,
  accessCode,
  fill,
  alreadySigned,
  onSigned,
  onBack,
  onError,
}: Props) {
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);

  async function sign() {
    if (!signature) {
      onError("Draw your signature before continuing to payment.");
      return;
    }
    setBusy(true);
    onError("");
    try {
      const res = await fetch(`/api/agreements/${agreementId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: accessCode,
          role: "renter",
          signatureDataUrl: signature,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not sign agreement");
      onSigned();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not sign agreement");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="font-caps text-[0.68rem] text-muted">Agreement</p>
      <h2 className="font-display mt-2 text-[clamp(2rem,6vw,3.2rem)] leading-none">
        Rental agreement
      </h2>
      <p className="mt-4 text-sm text-paper-dim">
        Your booking selections are filled in below. Review and sign, then pay
        the deposit on the next step. Access code{" "}
        <strong className="text-paper">{accessCode}</strong> saves this contract
        for later.
      </p>

      <div className="mt-6 max-h-[min(26rem,46vh)] overflow-y-auto border border-rule bg-ink/60 p-4 sm:p-5">
        <AgreementDocument fill={fill} />
      </div>

      {alreadySigned ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btn-solid" onClick={onSigned}>
            Continue to deposit
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="font-caps text-[0.65rem] text-muted">Renter e-sign</p>
          <div className="mt-2">
            <SignaturePad onChange={setSignature} disabled={busy} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn" onClick={onBack} disabled={busy}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-solid"
              disabled={busy || !signature}
              onClick={sign}
            >
              {busy ? "Signing…" : "Sign & continue to deposit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
