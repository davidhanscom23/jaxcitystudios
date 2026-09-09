import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { cancelBooking } from "@/lib/bookings-admin";

export const metadata = pageMeta({
  title: "Checkout canceled | JaxCity Studios",
  description: "Deposit checkout was canceled. Your date is not held.",
  path: "/book/cancel",
});

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ booking_id?: string }>;
}) {
  const params = await searchParams;
  if (params.booking_id) {
    cancelBooking(params.booking_id);
  }

  return (
    <div className="wide-margin section-space max-w-2xl">
      <h1 className="font-display text-5xl">Checkout canceled</h1>
      <p className="mt-6 text-paper-dim">
        No deposit was taken. Any temporary hold on that room and time has been
        released. Open Book again when you’re ready — the date is not locked
        without the 50% non-refundable deposit.
      </p>
      <Link href="/pricing" className="btn mt-10 inline-flex no-underline">
        Back to pricing
      </Link>
    </div>
  );
}
