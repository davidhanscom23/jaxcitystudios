import { randomBytes, randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import {
  AGREEMENT_TEMPLATE_VERSION,
  buildAgreementFill,
  type AgreementFill,
  type AgreementInput,
} from "@/lib/rental-agreement";
import type { RoomId } from "@/lib/rates";

export type AgreementStatus = "draft" | "signed";

export type AgreementRow = {
  id: string;
  access_code: string;
  booking_id: string | null;
  status: AgreementStatus;
  template_version: number;
  revision: number;
  fill_json: string;
  renter_signature: string | null;
  renter_signed_at: string | null;
  owner_signature: string | null;
  owner_signed_at: string | null;
  created_at: string;
  updated_at: string;
};

export function ensureAgreementTables(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS agreements (
      id TEXT PRIMARY KEY,
      access_code TEXT NOT NULL UNIQUE,
      booking_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('draft', 'signed')),
      template_version INTEGER NOT NULL,
      revision INTEGER NOT NULL DEFAULT 1,
      fill_json TEXT NOT NULL,
      renter_signature TEXT,
      renter_signed_at TEXT,
      owner_signature TEXT,
      owner_signed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_agreements_booking
      ON agreements(booking_id);
    CREATE INDEX IF NOT EXISTS idx_agreements_email
      ON agreements(access_code);
  `);
}

function makeAccessCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function parseFill(row: AgreementRow): AgreementFill {
  return JSON.parse(row.fill_json) as AgreementFill;
}

export function createAgreement(opts: {
  input: AgreementInput;
  bookingId?: string | null;
}): AgreementRow {
  ensureAgreementTables();
  const fill = buildAgreementFill(opts.input);
  const now = new Date().toISOString();
  const row: AgreementRow = {
    id: randomUUID(),
    access_code: makeAccessCode(),
    booking_id: opts.bookingId ?? null,
    status: "draft",
    template_version: AGREEMENT_TEMPLATE_VERSION,
    revision: 1,
    fill_json: JSON.stringify(fill),
    renter_signature: null,
    renter_signed_at: null,
    owner_signature: null,
    owner_signed_at: null,
    created_at: now,
    updated_at: now,
  };
  getDb()
    .prepare(
      `INSERT INTO agreements (
        id, access_code, booking_id, status, template_version, revision,
        fill_json, renter_signature, renter_signed_at, owner_signature,
        owner_signed_at, created_at, updated_at
      ) VALUES (
        @id, @access_code, @booking_id, @status, @template_version, @revision,
        @fill_json, @renter_signature, @renter_signed_at, @owner_signature,
        @owner_signed_at, @created_at, @updated_at
      )`,
    )
    .run(row);
  return row;
}

export function getAgreementById(id: string): AgreementRow | null {
  ensureAgreementTables();
  return (
    (getDb()
      .prepare("SELECT * FROM agreements WHERE id = ?")
      .get(id) as AgreementRow | undefined) ?? null
  );
}

export function getAgreementByAccess(
  id: string,
  accessCode: string,
): AgreementRow | null {
  const row = getAgreementById(id);
  if (!row) return null;
  if (row.access_code.toUpperCase() !== accessCode.toUpperCase()) return null;
  return row;
}

export function findAgreementsByEmail(email: string): AgreementRow[] {
  ensureAgreementTables();
  const needle = email.trim().toLowerCase();
  if (!needle) return [];
  const rows = getDb()
    .prepare("SELECT * FROM agreements ORDER BY updated_at DESC")
    .all() as AgreementRow[];
  return rows.filter((r) => {
    try {
      const fill = parseFill(r);
      return fill.renterEmail.toLowerCase() === needle;
    } catch {
      return false;
    }
  });
}

export function updateAgreementFill(
  id: string,
  accessCode: string,
  patch: Partial<AgreementInput> & {
    clearSignatures?: boolean;
  },
): AgreementRow | { error: string } {
  const row = getAgreementByAccess(id, accessCode);
  if (!row) return { error: "Agreement not found or access code invalid." };

  const current = parseFill(row);
  const nextInput: AgreementInput = {
    renterName: patch.renterName ?? current.renterName,
    renterEmail: patch.renterEmail ?? current.renterEmail,
    renterPhone: patch.renterPhone ?? current.renterPhone,
    roomId: (patch.roomId as RoomId) ?? current.roomId,
    sessionDate: patch.sessionDate ?? current.sessionDate,
    startTime: patch.startTime ?? current.startTime,
    endTime: patch.endTime ?? current.endTime,
    durationHours: patch.durationHours ?? current.durationHours,
    total: patch.total ?? current.total,
    deposit: patch.deposit ?? current.deposit,
    agreementDate: patch.agreementDate ?? current.agreementDate,
    cancellationNotice: patch.cancellationNotice ?? current.cancellationNotice,
    cancellationFeeLabel:
      patch.cancellationFeeLabel ?? current.cancellationFeeLabel,
    recordingStorageDuration:
      patch.recordingStorageDuration ?? current.recordingStorageDuration,
  };

  const fill = buildAgreementFill(nextInput);
  const now = new Date().toISOString();
  const wasSigned = row.status === "signed";
  const clear = patch.clearSignatures ?? wasSigned;

  const updated: AgreementRow = {
    ...row,
    status: clear ? "draft" : row.status,
    revision: wasSigned || clear ? row.revision + 1 : row.revision,
    template_version: AGREEMENT_TEMPLATE_VERSION,
    fill_json: JSON.stringify(fill),
    renter_signature: clear ? null : row.renter_signature,
    renter_signed_at: clear ? null : row.renter_signed_at,
    owner_signature: clear ? null : row.owner_signature,
    owner_signed_at: clear ? null : row.owner_signed_at,
    updated_at: now,
  };

  getDb()
    .prepare(
      `UPDATE agreements SET
        status = @status,
        revision = @revision,
        template_version = @template_version,
        fill_json = @fill_json,
        renter_signature = @renter_signature,
        renter_signed_at = @renter_signed_at,
        owner_signature = @owner_signature,
        owner_signed_at = @owner_signed_at,
        updated_at = @updated_at
      WHERE id = @id`,
    )
    .run(updated);

  return updated;
}

export function signAgreement(opts: {
  id: string;
  accessCode: string;
  role: "renter" | "owner";
  signatureDataUrl: string;
  ownerCode?: string;
}): AgreementRow | { error: string } {
  const row = getAgreementByAccess(opts.id, opts.accessCode);
  if (!row) return { error: "Agreement not found or access code invalid." };
  if (!opts.signatureDataUrl.startsWith("data:image/")) {
    return { error: "Signature image required." };
  }

  if (opts.role === "owner") {
    const expected = process.env.AGREEMENT_OWNER_CODE || "jaxcity";
    if ((opts.ownerCode || "") !== expected) {
      return { error: "Studio owner code invalid." };
    }
  }

  const now = new Date().toISOString();
  const next: AgreementRow = { ...row, updated_at: now };
  if (opts.role === "renter") {
    next.renter_signature = opts.signatureDataUrl;
    next.renter_signed_at = now;
  } else {
    next.owner_signature = opts.signatureDataUrl;
    next.owner_signed_at = now;
  }
  if (next.renter_signature) {
    next.status = "signed";
  }

  getDb()
    .prepare(
      `UPDATE agreements SET
        status = @status,
        renter_signature = @renter_signature,
        renter_signed_at = @renter_signed_at,
        owner_signature = @owner_signature,
        owner_signed_at = @owner_signed_at,
        updated_at = @updated_at
      WHERE id = @id`,
    )
    .run(next);

  return next;
}

export function publicAgreement(row: AgreementRow) {
  const fill = parseFill(row);
  return {
    id: row.id,
    accessCode: row.access_code,
    bookingId: row.booking_id,
    status: row.status,
    templateVersion: row.template_version,
    revision: row.revision,
    fill,
    renterSignedAt: row.renter_signed_at,
    ownerSignedAt: row.owner_signed_at,
    hasRenterSignature: Boolean(row.renter_signature),
    hasOwnerSignature: Boolean(row.owner_signature),
    renterSignature: row.renter_signature,
    ownerSignature: row.owner_signature,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
