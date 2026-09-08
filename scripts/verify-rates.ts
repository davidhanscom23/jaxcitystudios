/**
 * Quick rate-card proof checks. Run: npx tsx scripts/verify-rates.ts
 */
import {
  ENGINEERED,
  ROOMS,
  DAY_RATE,
  DEPOSIT,
  INTRO_PROMO,
  PACKAGES,
  engineeredTotal,
  depositAmount,
  balanceOnArrival,
  recommendRoom,
} from "../src/lib/rates";
import { answerPricingQuestion } from "../src/lib/chat";
import { computePlanner, DEFAULT_SHOW } from "../src/lib/planner";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(ENGINEERED.firstTimeHourly === 60, "first-time hourly");
assert(ENGINEERED.returningHourly === 50, "returning hourly");
assert(ENGINEERED.firstTimeMinimum === 120, "first min");
assert(ENGINEERED.returningMinimum === 100, "returning min");
assert(ROOMS.map((r) => r.hourly).join(",") === "25,35,45,65", "room ladder");
assert(DAY_RATE.startingAt === 200, "day rate");
assert(INTRO_PROMO.price === 80 && INTRO_PROMO.hours === 2, "intro promo");
assert(engineeredTotal(1, "first-time") === 120, "2hr min first");
assert(engineeredTotal(4, "returning") === 200, "4hr returning");
assert(engineeredTotal(4, "first-time") === 240, "4hr first");
assert(depositAmount(240) === 120, "50% deposit");
assert(balanceOnArrival(240) === 120, "balance");
assert(DEPOSIT.percent === 50, "deposit pct");
assert(PACKAGES.series.studioCostPublished === 400, "series studio");
assert(PACKAGES.partner.studioCostPublished === 400, "partner studio");
assert(recommendRoom(4, 4).id === "mars", "4cam -> mars");
assert(recommendRoom(2, 1).id === "mercury", "duo/cam1 mercury or venus");

const marsEng = answerPricingQuestion(
  "how much for a four hour session in Mars with an engineer",
);
assert(marsEng.includes("240") && marsEng.includes("200"), "chat mars engineered");
assert(marsEng.toLowerCase().includes("include"), "chat mentions room included");

const venusDay = answerPricingQuestion(
  "what does a day in Venus cost if I bring my own engineer",
);
assert(venusDay.includes("200"), "day rate in chat");
assert(venusDay.toLowerCase().includes("venus"), "venus mentioned");

const plan = computePlanner({ ...DEFAULT_SHOW, customDeliverables: [] });
assert(plan.bookedHours >= 2, "planner min hours");
assert(plan.studioCost === engineeredTotal(plan.bookedHours, "first-time"), "planner matches engineered");

console.log("All rate/chat/planner checks passed.");
