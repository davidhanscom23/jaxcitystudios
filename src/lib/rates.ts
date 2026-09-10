/**
 * Verified rate card facts for JaxCity Studios.
 * Do not invent or round these numbers.
 */

export const STUDIO = {
  name: "JaxCity Studios",
  city: "Jacksonville, Florida",
  region: "Jacksonville, the Beaches, and all of Northeast Florida",
  brandLine: "Press Record.",
  email: "jaxcitystudios@gmail.com",
  phone: "904-536-7211",
  phoneTel: "+19045367211",
  instagram: "@jaxcity.studios",
  instagramUrl: "https://www.instagram.com/jaxcity.studios/",
  addressPlaceholder: "Studio address — to be added.",
  seriousInquiries: "Serious Inquiries Only.",
} as const;

/** Engineered sessions include the room. Two-hour minimum. */
export const ENGINEERED = {
  firstTimeHourly: 60,
  firstTimeMinimum: 120,
  returningHourly: 50,
  returningMinimum: 100,
  minimumHours: 2,
} as const;

/** Room-only rates (bring your own engineer). Companion to the day rate. Does not stack with engineered. */
export const ROOMS = [
  {
    id: "mercury",
    name: "Mercury",
    hourly: 25,
    maxPeople: 2,
    maxCameras: 1,
    fit: "Solo takes, voiceover, intimate one-on-one.",
    color: "#b24bf3",
    colorName: "violet",
    planet: "/images/planets/mercury.png",
  },
  {
    id: "venus",
    name: "Venus",
    hourly: 35,
    maxPeople: 3,
    maxCameras: 2,
    fit: "Duo podcasts, acoustic pairs, two-camera setups.",
    color: "#f5c518",
    colorName: "gold",
    planet: "/images/planets/venus.png",
  },
  {
    id: "earth",
    name: "Earth",
    hourly: 45,
    maxPeople: 4,
    maxCameras: 3,
    fit: "Panel conversations, band tracking, three-camera video.",
    color: "#2ee6ff",
    colorName: "cyan",
    planet: "/images/planets/earth.png",
  },
  {
    id: "mars",
    name: "Mars",
    hourly: 65,
    maxPeople: 6,
    maxCameras: 4,
    fit: "Full live rooms, four-camera shoots, larger ensembles.",
    color: "#ff3b5c",
    colorName: "hot-red",
    planet: "/images/planets/mars.png",
  },
] as const;

export type RoomId = (typeof ROOMS)[number]["id"];

export const DAY_RATE = {
  startingAt: 200,
  note: "Full day room rental without engineer, or bring your own engineer. Starting at $200 per day.",
} as const;

export const DEPOSIT = {
  percent: 50,
  policy:
    "A 50% non-refundable deposit secures the booking. The remaining balance is due upon arrival before the session begins.",
} as const;

/** Real intro promotion from the studio rate card. First session only. */
export const INTRO_PROMO = {
  id: "intro-2h-80",
  label: "2 hours for $80",
  hours: 2,
  price: 80,
  appliesTo: "first session",
  note: "Introductory promotion for a first session: 2 hours for $80.",
} as const;

/**
 * Sample package pricing researched against Jacksonville / Northeast Florida studios
 * (IA Digital memberships $497–$1,197/mo; AGUYB Podcast Launch Bundle $1,249;
 * Mix Theory video suites $140–$175/hr). Studio hours use published JaxCity rates;
 * bundled edit/production figures are labeled sample.
 */
export const PACKAGES = {
  session: {
    id: "session",
    name: "The Session",
    tagline: "One booking. Room plus engineer.",
    kind: "published" as const,
    description:
      "Straight hourly engineered time with the studio’s two-hour minimum. The hourly rate includes the room.",
    firstTime: {
      hourly: ENGINEERED.firstTimeHourly,
      minimum: ENGINEERED.firstTimeMinimum,
      exampleHours: 2,
      exampleTotal: ENGINEERED.firstTimeMinimum,
    },
    returning: {
      hourly: ENGINEERED.returningHourly,
      minimum: ENGINEERED.returningMinimum,
      exampleHours: 2,
      exampleTotal: ENGINEERED.returningMinimum,
    },
  },
  series: {
    id: "series",
    name: "The Series",
    tagline: "A run of episodes or sessions.",
    kind: "sample" as const,
    description:
      "Four engineered sessions of two hours each (eight hours total) at the published returning-client rate of $50/hour ($400 studio time), plus a sample post-production estimate for edited audio across the run.",
    studioHours: 8,
    studioCostPublished: 8 * ENGINEERED.returningHourly, // $400
    samplePostProduction: 580,
    sampleTotal: 980,
    researchNote:
      "Sample pricing. Comparable Jacksonville packages include AGUYB’s Podcast Launch Bundle at $1,249 (4 studio hours + 2 episode edits) and Mix Theory video suites from $140–$175/hour. JaxCity studio hours here use the published $50 returning engineered rate; the $580 post-production portion is an estimate, not a published studio figure.",
  },
  partner: {
    id: "partner",
    name: "The Studio Partner",
    tagline: "Monthly retainer. Ongoing production.",
    kind: "sample" as const,
    description:
      "Eight engineered hours per month at the published returning-client rate of $50/hour ($400 studio time), plus a sample monthly edit and clip package.",
    studioHoursPerMonth: 8,
    studioCostPublished: 8 * ENGINEERED.returningHourly, // $400
    sampleProduction: 320,
    sampleMonthlyTotal: 720,
    researchNote:
      "Sample pricing. Jacksonville studio memberships researched include IA Digital Starter at $497/month (2×1hr sessions + edits/clips) and Accelerator at $1,197/month. JaxCity studio hours use the published $50 returning engineered rate; the $320 production portion is an estimate, not a published studio figure.",
  },
} as const;

/** Sample add-on offers shown in booking (labeled where not published). */
export const ADDONS = [
  {
    id: "extra-camera",
    name: "Extra camera angle",
    original: 90,
    packagePrice: 60,
    kind: "sample" as const,
  },
  {
    id: "same-day-rough",
    name: "Same-day rough mix",
    original: 120,
    packagePrice: 80,
    kind: "sample" as const,
  },
  {
    id: "three-clip",
    name: "Three-clip social package",
    original: 150,
    packagePrice: 95,
    kind: "sample" as const,
  },
  {
    id: "on-location",
    name: "On-location recording",
    original: 200,
    packagePrice: 150,
    kind: "sample" as const,
  },
] as const;

export function engineeredTotal(
  hours: number,
  clientType: "first-time" | "returning",
): number {
  const h = Math.max(hours, ENGINEERED.minimumHours);
  const rate =
    clientType === "first-time"
      ? ENGINEERED.firstTimeHourly
      : ENGINEERED.returningHourly;
  return h * rate;
}

/**
 * Engineered session subtotal, optionally applying the one-time intro promo
 * (exactly INTRO_PROMO.hours at INTRO_PROMO.price for a first-time client).
 */
export function sessionStudioTotal(opts: {
  hours: number;
  clientType: "first-time" | "returning";
  applyIntroPromo?: boolean;
}): number {
  const h = Math.max(opts.hours, ENGINEERED.minimumHours);
  if (
    opts.applyIntroPromo &&
    opts.clientType === "first-time" &&
    h === INTRO_PROMO.hours
  ) {
    return INTRO_PROMO.price;
  }
  return engineeredTotal(opts.hours, opts.clientType);
}

export function roomOnlyTotal(roomId: RoomId, hours: number): number {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return 0;
  return Math.max(hours, 1) * room.hourly;
}

/** Engineered (room included) vs bring-your-own-engineer room-only. */
export type RateMode = "engineered" | "room-only";

/**
 * Studio subtotal for checkout / booking summary.
 * Room-only uses the selected planet hourly; engineered ignores room price
 * (room is included) and may apply the one-time intro promo.
 */
export function bookingStudioTotal(opts: {
  rateMode: RateMode;
  roomId: RoomId;
  hours: number;
  clientType: "first-time" | "returning";
  applyIntroPromo?: boolean;
  packageId?: string;
}): number {
  const pkg = opts.packageId || "session";
  if (pkg === "series") return PACKAGES.series.sampleTotal;
  if (pkg === "partner") return PACKAGES.partner.sampleMonthlyTotal;
  if (opts.rateMode === "room-only") {
    return roomOnlyTotal(opts.roomId, opts.hours);
  }
  return sessionStudioTotal({
    hours: opts.hours,
    clientType: opts.clientType,
    applyIntroPromo: opts.applyIntroPromo,
  });
}

export function dayRateStarting(): number {
  return DAY_RATE.startingAt;
}

export function depositAmount(total: number): number {
  return Math.round(total * (DEPOSIT.percent / 100) * 100) / 100;
}

export function balanceOnArrival(total: number): number {
  return Math.round((total - depositAmount(total)) * 100) / 100;
}

export function recommendRoom(
  people: number,
  cameras: number,
): (typeof ROOMS)[number] {
  const fit = ROOMS.find((r) => r.maxPeople >= people && r.maxCameras >= cameras);
  return fit ?? ROOMS[ROOMS.length - 1];
}

export function roomFits(
  roomId: RoomId,
  people: number,
  cameras: number,
): boolean {
  const room = ROOMS.find((r) => r.id === roomId);
  if (!room) return false;
  return room.maxPeople >= people && room.maxCameras >= cameras;
}
