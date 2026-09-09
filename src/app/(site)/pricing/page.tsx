import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  DAY_RATE,
  DEPOSIT,
  ENGINEERED,
  INTRO_PROMO,
  PACKAGES,
  ROOMS,
} from "@/lib/rates";
import { pageMeta } from "@/lib/seo";
import { PricingActions } from "@/components/PricingActions";
import { RoomName } from "@/components/RoomName";

export const metadata = pageMeta({
  title: "Recording Studio Prices Jacksonville | JaxCity Studios Rates",
  description:
    "Honest Jacksonville recording studio prices: engineered $60/hr first-time, $50/hr returning; room-only Mercury $25–Mars $65; day from $200. Cheap and affordable options without fake discounts.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[18px] text-muted">Rate card</p>
      <h1 className="font-display crop-type mt-4 max-w-[14ch] text-[clamp(3rem,9vw,6.5rem)]">
        Upfront pricing
      </h1>
      <p className="mt-6 max-w-2xl text-paper-dim">
        How the two rates relate: the hourly rate of ${ENGINEERED.firstTimeHourly}{" "}
        or ${ENGINEERED.returningHourly} is an engineered session and includes
        the room. The room rates of ${ROOMS[0].hourly} to $
        {ROOMS[ROOMS.length - 1].hourly} are room-only, for clients bringing
        their own engineer, and are the hourly companion to the $
        {DAY_RATE.startingAt} day rate. The two do not stack.
      </p>

      <div className="photo-wrap neon-frame relative mt-12 aspect-[21/9] min-h-[12rem] overflow-hidden sm:mt-16">
        <Image
          src="/images/studio-session-purple.jpg"
          alt="Engineered session at JaxCity Studios — control room desk, dual monitors, booth beyond the glass"
          fill
          className="object-cover object-[center_40%]"
          sizes="100vw"
          priority
        />
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        <PackageCard
          name={PACKAGES.session.name}
          tagline={PACKAGES.session.tagline}
          badge="Published rates"
          body={
            <>
              <p>{PACKAGES.session.description}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  First-time: ${PACKAGES.session.firstTime.hourly}/hr · $
                  {PACKAGES.session.firstTime.minimum} minimum (
                  {ENGINEERED.minimumHours} hours)
                </li>
                <li>
                  Returning (loyalty): ${PACKAGES.session.returning.hourly}/hr · $
                  {PACKAGES.session.returning.minimum} minimum
                </li>
                <li>Example 2-hour first session: ${PACKAGES.session.firstTime.exampleTotal}</li>
                <li>Example 2-hour returning: ${PACKAGES.session.returning.exampleTotal}</li>
              </ul>
            </>
          }
          packageId="session"
        />
        <PackageCard
          name={PACKAGES.series.name}
          tagline={PACKAGES.series.tagline}
          badge="Sample pricing"
          body={
            <>
              <p>{PACKAGES.series.description}</p>
              <p className="mt-4 font-display text-3xl">
                ${PACKAGES.series.sampleTotal}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>
                  Published studio time: {PACKAGES.series.studioHours}h × $
                  {ENGINEERED.returningHourly} = $
                  {PACKAGES.series.studioCostPublished}
                </li>
                <li>
                  Sample post-production estimate: $
                  {PACKAGES.series.samplePostProduction}
                </li>
              </ul>
              <p className="mt-4 text-xs text-accent">{PACKAGES.series.researchNote}</p>
            </>
          }
          packageId="series"
        />
        <PackageCard
          name={PACKAGES.partner.name}
          tagline={PACKAGES.partner.tagline}
          badge="Sample pricing"
          body={
            <>
              <p>{PACKAGES.partner.description}</p>
              <p className="mt-4 font-display text-3xl">
                ${PACKAGES.partner.sampleMonthlyTotal}
                <span className="font-caps ml-2 text-[18px] text-muted">
                  /mo sample
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li>
                  Published studio time: {PACKAGES.partner.studioHoursPerMonth}h
                  × ${ENGINEERED.returningHourly} = $
                  {PACKAGES.partner.studioCostPublished}
                </li>
                <li>
                  Sample production estimate: ${PACKAGES.partner.sampleProduction}
                </li>
              </ul>
              <p className="mt-4 text-xs text-accent">{PACKAGES.partner.researchNote}</p>
            </>
          }
          packageId="partner"
        />
      </div>

      <section className="mt-24">
        <h2 className="font-display text-4xl">Room-only table</h2>
        <p className="mt-4 max-w-xl text-paper-dim">
          Bring your own engineer. Companion to the day rate. Not stacked with
          engineered sessions.
        </p>
        <div className="mt-8 overflow-x-auto border border-rule">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-rule font-caps text-[18px] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Hourly</th>
                <th className="px-4 py-3 font-medium">Fit</th>
              </tr>
            </thead>
            <tbody>
              {ROOMS.map((r) => (
                <tr key={r.id} className="border-b border-rule/70">
                  <td className="px-4 py-4 text-xl">
                    <RoomName roomId={r.id} size="md" />
                  </td>
                  <td className="px-4 py-4" style={{ color: r.color }}>
                    ${r.hourly}/hr
                  </td>
                  <td className="px-4 py-4 text-muted">{r.fit}</td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-4 font-display text-xl">Full day</td>
                <td className="px-4 py-4">From ${DAY_RATE.startingAt}/day</td>
                <td className="px-4 py-4 text-muted">{DAY_RATE.note}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16 grid gap-8 border-t border-rule pt-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Loyalty rate</h2>
          <p className="mt-4 text-paper-dim">
            Returning clients pay ${ENGINEERED.returningHourly}/hr engineered
            (${ENGINEERED.returningMinimum} two-hour minimum) — the loyalty
            benefit on the published card. First-time is $
            {ENGINEERED.firstTimeHourly}/hr (${ENGINEERED.firstTimeMinimum}{" "}
            minimum).
          </p>
        </div>
        <div>
          <h2 className="font-display text-3xl">Deposit</h2>
          <p className="mt-4 text-paper-dim">{DEPOSIT.policy}</p>
          <p className="mt-4 text-sm text-muted">
            Intro promotion: {INTRO_PROMO.note}
          </p>
        </div>
      </section>

      <div className="mt-16 flex flex-wrap gap-3">
        <Link href="/planner" className="btn btn-solid no-underline">
          Build Your Show
        </Link>
        <PricingActions />
      </div>
    </div>
  );
}

function PackageCard({
  name,
  tagline,
  badge,
  body,
  packageId,
}: {
  name: string;
  tagline: string;
  badge: string;
  body: ReactNode;
  packageId: string;
}) {
  return (
    <article className="flex flex-col border border-rule bg-charcoal p-6">
      <p className="font-caps text-[18px] text-accent">{badge}</p>
      <h2 className="font-display mt-3 text-3xl">{name}</h2>
      <p className="mt-2 text-sm text-muted">{tagline}</p>
      <div className="mt-6 flex-1 text-paper-dim">{body}</div>
      <PricingActions packageId={packageId} />
    </article>
  );
}
