import {
  agreementTitle,
  depositPolicyNote,
  rentalDurationLabel,
  type AgreementFill,
} from "@/lib/rental-agreement";
import { STUDIO } from "@/lib/rates";

export function AgreementDocument({
  fill,
  renterSignature,
  ownerSignature,
  renterSignedAt,
  ownerSignedAt,
}: {
  fill: AgreementFill;
  renterSignature?: string | null;
  ownerSignature?: string | null;
  renterSignedAt?: string | null;
  ownerSignedAt?: string | null;
}) {
  return (
    <article className="agreement-doc space-y-6 text-sm leading-relaxed text-paper-dim sm:text-base">
      <header>
        <h1 className="font-display text-2xl text-paper sm:text-3xl">
          {agreementTitle()}
        </h1>
        <p className="mt-4">
          This Rental Agreement is made and entered into as of{" "}
          <strong className="text-paper">{fill.agreementDate}</strong> by and
          between:
        </p>
        <dl className="mt-4 space-y-2 border border-rule bg-graphite/60 p-4">
          <div>
            <dt className="font-caps text-[18px] text-muted">Renter&apos;s name</dt>
            <dd className="text-paper">{fill.renterName || "—"}</dd>
          </div>
          <div>
            <dt className="font-caps text-[18px] text-muted">Room being rented</dt>
            <dd className="text-paper">{fill.roomName}</dd>
          </div>
          <div>
            <dt className="font-caps text-[18px] text-muted">Rental duration</dt>
            <dd className="text-paper">{rentalDurationLabel(fill)}</dd>
          </div>
        </dl>
      </header>

      <section>
        <h2 className="font-caps text-[18px] tracking-[0.16em] text-cyan">
          Terms of rental
        </h2>
        <ol className="mt-4 list-decimal space-y-4 pl-5">
          <li>
            <strong className="text-paper">Non-Refundable Deposit.</strong> A
            deposit of <strong className="text-paper">${fill.deposit}</strong>{" "}
            is required and must be paid by{" "}
            <strong className="text-paper">{fill.depositDueDate}</strong>.{" "}
            {depositPolicyNote()}
          </li>
          <li>
            <strong className="text-paper">Total Payment of the Rental Fee.</strong>{" "}
            The total fee of{" "}
            <strong className="text-paper">${fill.total}</strong> (including the
            deposit) must be paid by{" "}
            <strong className="text-paper">{fill.balanceDueDate}</strong>. If the
            remaining balance of{" "}
            <strong className="text-paper">${fill.balance}</strong> is not paid
            by{" "}
            <strong className="text-paper">{fill.balanceDueDate}</strong> (session
            date / arrival), the customer must reschedule.
          </li>
          <li>
            <strong className="text-paper">Cancellation Policy.</strong>{" "}
            Cancellations must be made at least{" "}
            <strong className="text-paper">{fill.cancellationNotice}</strong> in
            advance. If cancelled outside this period, a fee of{" "}
            <strong className="text-paper">{fill.cancellationFeeLabel}</strong>{" "}
            applies.
          </li>
          <li>
            <strong className="text-paper">Clean-Up Service Charge.</strong> A
            charge of{" "}
            <strong className="text-paper">${fill.cleanUpFee}</strong> applies if
            the room is left unclean (including smoke residue or odors).
          </li>
          <li>
            <strong className="text-paper">Credit Card Authorization.</strong> The
            renter authorizes charges for: clean-up services ($
            {fill.cleanUpFee}), any lost or broken equipment, and any damage to
            the studio or contents (smoke residue, spilled drinks/food, etc.).
          </li>
          <li>
            <strong className="text-paper">Indemnification.</strong> The renter
            agrees to hold {STUDIO.name} LLC and its owner harmless from claims
            or liabilities arising from the rental, except to the extent caused
            by the studio&apos;s gross negligence or willful misconduct.
          </li>
          <li>
            <strong className="text-paper">Disclaimer of Liability.</strong>{" "}
            {STUDIO.name} LLC is not liable for sound/video recording issues;
            recording rights or files left on the studio computer; or loss or
            damage to the renter&apos;s recordings, equipment, or materials.
          </li>
          <li>
            <strong className="text-paper">Surveillance and Recording.</strong>{" "}
            The renter consents to being recorded by security surveillance during
            the rental.
          </li>
          <li>
            <strong className="text-paper">Use of Facilities.</strong> The renter
            will receive an access code and may access only the rented room and
            bathroom. Running or jumping is prohibited so as not to disturb the
            doctor&apos;s office below.
          </li>
          <li>
            <strong className="text-paper">Equipment Liability.</strong> The
            studio is not liable for damage or theft of the renter&apos;s
            personal equipment. Renters are encouraged to carry their own
            insurance.
          </li>
          <li>
            <strong className="text-paper">Emergency Procedures.</strong> The
            renter acknowledges awareness of emergency procedures, exits, and
            emergency contact information.
          </li>
          <li>
            <strong className="text-paper">Recording Storage Policy.</strong> The
            studio will store recordings for{" "}
            <strong className="text-paper">
              {fill.recordingStorageDuration}
            </strong>
            . The renter is responsible for retrieving their recordings.
          </li>
          <li>
            <strong className="text-paper">Dispute Resolution.</strong> Disputes
            will first be addressed through mediation under the laws of the
            state of Florida.
          </li>
          <li>
            <strong className="text-paper">Usage Rights.</strong> The renter owns
            their recordings. The studio may use them for promotion only if
            agreed in writing.
          </li>
          <li>
            <strong className="text-paper">NO SMOKING,</strong> drugs, or alcohol
            in the building.
          </li>
          <li>
            <strong className="text-paper">Governing Law.</strong> This agreement
            is governed by the laws of the state of Florida.
          </li>
        </ol>
      </section>

      <p className="italic">
        IN WITNESS WHEREOF, the parties hereto have executed this Rental
        Agreement as of the date first above written.
      </p>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="font-caps text-[18px] text-muted">Renter&apos;s signature</p>
          {renterSignature ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={renterSignature}
              alt="Renter signature"
              className="mt-2 h-24 w-full border border-rule bg-ink object-contain"
            />
          ) : (
            <div className="mt-2 h-24 border border-dashed border-rule" />
          )}
          <p className="mt-2 text-xs text-muted">
            Date: {renterSignedAt ? renterSignedAt.slice(0, 10) : "—"}
          </p>
        </div>
        <div>
          <p className="font-caps text-[18px] text-muted">
            Studio owner&apos;s signature
          </p>
          {ownerSignature ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ownerSignature}
              alt="Studio owner signature"
              className="mt-2 h-24 w-full border border-rule bg-ink object-contain"
            />
          ) : (
            <div className="mt-2 h-24 border border-dashed border-rule" />
          )}
          <p className="mt-2 text-xs text-muted">
            Date: {ownerSignedAt ? ownerSignedAt.slice(0, 10) : "—"}
          </p>
        </div>
      </div>
    </article>
  );
}
