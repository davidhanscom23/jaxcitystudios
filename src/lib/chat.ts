import {
  DAY_RATE,
  DEPOSIT,
  ENGINEERED,
  INTRO_PROMO,
  ROOMS,
  STUDIO,
} from "@/lib/rates";

const WORD_HOURS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function parseHours(q: string): number | null {
  const digit = q.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)/);
  if (digit) return Number(digit[1]);
  const word = q.match(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:hour|hr|hours|hrs)\b/,
  );
  if (word) return WORD_HOURS[word[1]] ?? null;
  return null;
}

/**
 * Deterministic pricing chatbot using published rate card logic.
 */
export function answerPricingQuestion(message: string): string {
  const q = message.toLowerCase();

  if (/deposit|hold|secure/.test(q)) {
    return DEPOSIT.policy;
  }

  if (/intro|promotion|2 hours for|eighty|\$80|80 bucks/.test(q)) {
    return `${INTRO_PROMO.note} After that, first-time engineered sessions are $${ENGINEERED.firstTimeHourly}/hr ($${ENGINEERED.firstTimeMinimum} minimum).`;
  }

  if (/day|full day|daily/.test(q) && /venus|mercury|earth|mars|room/.test(q)) {
    const room = ROOMS.find((r) => q.includes(r.id) || q.includes(r.name.toLowerCase()));
    return `Full day room rentals start at $${DAY_RATE.startingAt} per day without our engineer (or bring your own). ${
      room
        ? `Hourly room-only for ${room.name} is $${room.hourly}/hr if you are not taking the day rate.`
        : "Hourly room-only companions: Mercury $25, Venus $35, Earth $45, Mars $65."
    } Day rate and engineered rates do not stack.`;
  }

  if (/day|full day|daily/.test(q)) {
    return `${DAY_RATE.note} This is room-only (no JaxCity engineer, or BYO engineer). It does not stack with engineered session rates.`;
  }

  // Engineered session with hours + optional room
  const hours = parseHours(q);
  const room = ROOMS.find(
    (r) => q.includes(r.id) || q.includes(r.name.toLowerCase()),
  );
  const wantsEngineer =
    /engineer|engineered|with engineer|tracking|mixed by you|you engineer/.test(q) ||
    (!/room.?only|own engineer|byo|bring my own|without engineer/.test(q) &&
      /session|book|cost|how much|price|rate/.test(q) &&
      hours !== null);
  const roomOnly =
    /room.?only|own engineer|byo|bring my own|without engineer|no engineer/.test(q);

  if (hours !== null && roomOnly && room) {
    const h = Math.max(hours, 1);
    const total = h * room.hourly;
    return `${room.name} room-only is $${room.hourly}/hr. For ${h} hour${h === 1 ? "" : "s"}: $${total}. Rate used: ${room.name} room-only (bring your own engineer). This does not include a JaxCity engineer and does not stack with engineered session pricing. Full day option starts at $${DAY_RATE.startingAt}.`;
  }

  if (hours !== null && roomOnly) {
    const lines = ROOMS.map((r) => {
      const h = Math.max(hours, 1);
      return `${r.name}: $${h * r.hourly} (${h} × $${r.hourly})`;
    }).join("; ");
    return `Room-only for ${hours} hour(s): ${lines}. Or full day starting at $${DAY_RATE.startingAt}. No engineer included.`;
  }

  if (hours !== null && (wantsEngineer || !roomOnly)) {
    const h = Math.max(hours, ENGINEERED.minimumHours);
    const first = h * ENGINEERED.firstTimeHourly;
    const returning = h * ENGINEERED.returningHourly;
    const roomNote = room
      ? ` Room choice (${room.name}) is included in the engineered rate — you do not add ${room.name}’s $${room.hourly}/hr on top.`
      : " The engineered rate includes the room.";
    return `Engineered session for ${h} hour${h === 1 ? "" : "s"} (two-hour minimum applied${hours < ENGINEERED.minimumHours ? ` — you asked for ${hours}h` : ""}): first-time $${first} at $${ENGINEERED.firstTimeHourly}/hr; returning $${returning} at $${ENGINEERED.returningHourly}/hr.${roomNote} Rates used: published engineered card. Room-only rates ($${ROOMS[0].hourly}–$${ROOMS[ROOMS.length - 1].hourly}) are separate and do not stack.`;
  }

  if (room && /how much|cost|price|rate|hour/.test(q)) {
    return `${room.name} room-only: $${room.hourly}/hr (BYO engineer). Engineered sessions are $${ENGINEERED.firstTimeHourly}/hr first-time or $${ENGINEERED.returningHourly}/hr returning and already include a room — they do not stack with $${room.hourly}/hr. Fit note: up to ${room.maxPeople} people / ${room.maxCameras} camera(s).`;
  }

  if (/returning|loyalty|second time/.test(q)) {
    return `Returning clients: $${ENGINEERED.returningHourly}/hr engineered, two-hour minimum ($${ENGINEERED.returningMinimum}). First-time is $${ENGINEERED.firstTimeHourly}/hr ($${ENGINEERED.firstTimeMinimum} minimum). Both include the room.`;
  }

  if (/first.?time|new client/.test(q)) {
    return `First-time engineered: $${ENGINEERED.firstTimeHourly}/hr, two-hour minimum ($${ENGINEERED.firstTimeMinimum}). Intro promo: ${INTRO_PROMO.label} for a first session. Room included — do not add Mercury–Mars hourly on top.`;
  }

  if (/mercury|venus|earth|mars|room/.test(q)) {
    return `Room-only hourly: ${ROOMS.map((r) => `${r.name} $${r.hourly}`).join(", ")}. Full day from $${DAY_RATE.startingAt}. Engineered: $${ENGINEERED.firstTimeHourly}/$${ENGINEERED.returningHourly} (first/returning) includes room. The two do not stack.`;
  }

  if (/contact|phone|email|instagram|address|where/.test(q)) {
    return `Call ${STUDIO.phone}, email ${STUDIO.email}, Instagram ${STUDIO.instagram}. ${STUDIO.addressPlaceholder}`;
  }

  return `Published card — Engineered (includes room): first-time $${ENGINEERED.firstTimeHourly}/hr ($${ENGINEERED.firstTimeMinimum} min), returning $${ENGINEERED.returningHourly}/hr ($${ENGINEERED.returningMinimum} min). Room-only: Mercury $${ROOMS[0].hourly}, Venus $${ROOMS[1].hourly}, Earth $${ROOMS[2].hourly}, Mars $${ROOMS[3].hourly}. Day from $${DAY_RATE.startingAt}. ${DEPOSIT.policy} Ask something like “4 hours in Mars with an engineer” for a calculated total.`;
}
