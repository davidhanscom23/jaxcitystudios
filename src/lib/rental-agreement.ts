import { DEPOSIT, ROOMS, STUDIO, type RoomId } from "@/lib/rates";
import { formatClock12, formatTimeRange12 } from "@/lib/time";

/** Current published template version — bump when legal text/policy defaults change. */
export const AGREEMENT_TEMPLATE_VERSION = 1;

/**
 * Studio-controlled blanks that are not derived from a booking selection.
 * Edit here (and bump AGREEMENT_TEMPLATE_VERSION) when policy changes.
 */
export const AGREEMENT_POLICY = {
  cancellationNotice: "24 hours",
  /** Charged when cancelled inside the notice window; aligns with non-refundable deposit. */
  cancellationFeeLabel: "the non-refundable deposit",
  recordingStorageDuration: "30 days",
  cleanUpFee: 50,
} as const;

export type AgreementFill = {
  agreementDate: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  roomId: RoomId;
  roomName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  startLabel: string;
  endLabel: string;
  durationHours: number;
  total: number;
  deposit: number;
  balance: number;
  depositDueDate: string;
  balanceDueDate: string;
  cancellationNotice: string;
  cancellationFeeLabel: string;
  recordingStorageDuration: string;
  cleanUpFee: number;
  templateVersion: number;
};

export type AgreementInput = {
  renterName: string;
  renterEmail?: string;
  renterPhone?: string;
  roomId: RoomId;
  sessionDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  total: number;
  deposit: number;
  agreementDate?: string;
  cancellationNotice?: string;
  cancellationFeeLabel?: string;
  recordingStorageDuration?: string;
};

export function buildAgreementFill(input: AgreementInput): AgreementFill {
  const room = ROOMS.find((r) => r.id === input.roomId);
  if (!room) throw new Error("Unknown room.");
  const agreementDate =
    input.agreementDate || new Date().toISOString().slice(0, 10);
  const balance = Math.max(0, Math.round((input.total - input.deposit) * 100) / 100);

  return {
    agreementDate,
    renterName: input.renterName.trim(),
    renterEmail: (input.renterEmail || "").trim(),
    renterPhone: (input.renterPhone || "").trim(),
    roomId: input.roomId,
    roomName: room.name,
    sessionDate: input.sessionDate,
    startTime: input.startTime,
    endTime: input.endTime,
    startLabel: formatClock12(input.startTime),
    endLabel: formatClock12(input.endTime),
    durationHours: input.durationHours,
    total: input.total,
    deposit: input.deposit,
    balance,
    depositDueDate: agreementDate,
    balanceDueDate: input.sessionDate,
    cancellationNotice:
      input.cancellationNotice || AGREEMENT_POLICY.cancellationNotice,
    cancellationFeeLabel:
      input.cancellationFeeLabel || AGREEMENT_POLICY.cancellationFeeLabel,
    recordingStorageDuration:
      input.recordingStorageDuration ||
      AGREEMENT_POLICY.recordingStorageDuration,
    cleanUpFee: AGREEMENT_POLICY.cleanUpFee,
    templateVersion: AGREEMENT_TEMPLATE_VERSION,
  };
}

export function agreementTitle(): string {
  return `RENTAL AGREEMENT FOR ${STUDIO.name.toUpperCase()} LLC, RECORDING STUDIO`;
}

export function depositPolicyNote(): string {
  return DEPOSIT.policy;
}

export function rentalDurationLabel(fill: AgreementFill): string {
  return `${fill.sessionDate} ${fill.startLabel} to ${fill.sessionDate} ${fill.endLabel} (${formatTimeRange12(fill.startTime, fill.endTime)}, ${fill.durationHours}h)`;
}
