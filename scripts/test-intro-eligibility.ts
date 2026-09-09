/**
 * Smoke test: intro / first-time eligibility by email+phone.
 * Run: DATABASE_PATH=/tmp/jaxcity-eligibility-test.db npx tsx scripts/test-intro-eligibility.ts
 */
import fs from "fs";
import path from "path";
import { getDb } from "../src/lib/db";
import { createBooking } from "../src/lib/availability";
import { getClientEligibility } from "../src/lib/client-eligibility";
import { INTRO_PROMO, sessionStudioTotal } from "../src/lib/rates";

const dbPath =
  process.env.DATABASE_PATH ||
  path.join("/tmp", `jaxcity-eligibility-${Date.now()}.db`);

process.env.DATABASE_PATH = dbPath;
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

// Fresh DB
getDb();

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

const email = "newbie@example.com";
const phone = "9045550100";

let e = getClientEligibility(email, phone);
assert(e.canUseFirstTime && e.canUseIntroPromo, "fresh contact should be eligible");

assert(
  sessionStudioTotal({
    hours: 2,
    clientType: "first-time",
    applyIntroPromo: true,
  }) === INTRO_PROMO.price,
  "intro total should be $80",
);

const held = createBooking({
  roomId: "venus",
  date: "2099-06-01",
  start: "12:00",
  end: "14:00",
  status: "held",
  clientName: "New Client",
  clientEmail: email,
  clientPhone: phone,
  clientType: "first-time",
  promoId: INTRO_PROMO.id,
  packageId: "session",
  hours: 2,
  totalCents: 8000,
  depositCents: 4000,
});
assert(held.ok, "create intro booking");

e = getClientEligibility("unrelated@example.com", "904-555-0199");
assert(
  e.canUseFirstTime && e.canUseIntroPromo,
  "unrelated contact should stay eligible",
);

e = getClientEligibility(email, undefined);
assert(!e.canUseFirstTime && !e.canUseIntroPromo && e.usedIntroPromo, "email reuse blocked");

e = getClientEligibility("other@example.com", "(904) 555-0100");
assert(!e.canUseFirstTime && e.usedIntroPromo, "phone reuse blocked");

e = getClientEligibility("sample@jaxcity.local", undefined);
assert(!e.canUseFirstTime, "seed email counts as prior session");
assert(!e.usedIntroPromo, "seed bookings did not use intro promo id");

console.log("OK intro eligibility", { dbPath, introId: INTRO_PROMO.id });
