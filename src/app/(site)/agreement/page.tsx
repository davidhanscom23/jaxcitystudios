import { pageMeta } from "@/lib/seo";
import { AgreementStartForm } from "@/components/agreement/AgreementStartForm";
import type { RoomId } from "@/lib/rates";

export const metadata = pageMeta({
  title: "Rental Agreement | JaxCity Studios",
  description:
    "Electronic JaxCity Studios rental agreement — autofill from your booking, e-sign, save, and update when details change.",
  path: "/agreement",
});

export default async function AgreementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const initial = {
    bookingId: p.bookingId,
    renterName: p.name,
    renterEmail: p.email,
    renterPhone: p.phone,
    roomId: p.room as RoomId | undefined,
    sessionDate: p.date,
    startTime: p.start,
    durationHours: p.hours ? Number(p.hours) : undefined,
    total: p.total ? Number(p.total) : undefined,
    deposit: p.deposit ? Number(p.deposit) : undefined,
  };

  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[0.7rem] text-muted">Legal</p>
      <h1 className="font-display crop-type mt-4 max-w-[16ch] text-[clamp(2.6rem,8vw,5rem)]">
        Rental agreement
      </h1>
      <p className="mt-6 max-w-2xl text-paper-dim">
        Electronic form of the JaxCity Studios LLC recording-studio rental
        agreement. Booking selections autofill deposit, room, and session
        window. Sign on-screen, store with an access code, and update later if
        anything changes (signed copies require re-sign).
      </p>
      <div className="mt-12">
        <AgreementStartForm initial={initial} />
      </div>
    </div>
  );
}
