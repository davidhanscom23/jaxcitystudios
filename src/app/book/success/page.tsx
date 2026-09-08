import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { DEPOSIT, STUDIO } from "@/lib/rates";

export const metadata = pageMeta({
  title: "Deposit received | JaxCity Studios",
  description: "Your JaxCity Studios booking deposit checkout completed.",
  path: "/book/success",
});

export default function SuccessPage() {
  return (
    <div className="wide-margin section-space max-w-2xl">
      <p className="font-caps text-[0.7rem] text-accent">Checkout</p>
      <h1 className="font-display mt-4 text-5xl">Deposit path complete</h1>
      <p className="mt-6 text-paper-dim">{DEPOSIT.policy}</p>
      <p className="mt-4 text-paper-dim">
        Confirmation lands in your email from Stripe. Questions:{" "}
        <a href={`tel:${STUDIO.phoneTel}`}>{STUDIO.phone}</a> ·{" "}
        <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>
      </p>
      <Link href="/" className="btn btn-solid mt-10 inline-flex no-underline">
        Home
      </Link>
    </div>
  );
}
