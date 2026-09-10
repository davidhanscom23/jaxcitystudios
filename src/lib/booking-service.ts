import {
  COMPANY_SHOW,
  COMPANY_SHOW_PLANS,
  type CompanyShowPlanId,
} from "@/data/company-show";
import { roomOnlyTotal, type RoomId } from "@/lib/rates";

export type BookingService = "music" | "podcast";

export type PodcastOfferId =
  | "diy"
  | "pilot"
  | "founding"
  | CompanyShowPlanId;

/** Visual first-step cards — no pricing on these tiles. */
export const BOOKING_SERVICE_CARDS = {
  music: {
    id: "music" as const,
    title: "Music recording",
    /** Forced line breaks so wide display type never clips in the card. */
    titleLines: ["Music", "recording"] as const,
    blurb: "Tracking, mixing, and engineered sessions with a JaxCity engineer.",
    image: "/images/studio-session-purple.jpg",
    imageAlt:
      "Engineer and artist at the JaxCity Studios console during a music recording session",
  },
  podcast: {
    id: "podcast" as const,
    title: "Podcast",
    titleLines: ["Podcast"] as const,
    blurb:
      "The Company Show done-for-you plans — or DIY room and equipment only.",
    image: "/images/hero-podcast-table.png",
    imageAlt:
      "Two people recording a podcast conversation with boom microphones and headphones",
  },
} as const;

export const PODCAST_DIY_DISCLAIMER =
  "DIY podcast room rental is room and equipment only — no host, no engineer, no editing, and no production help. You run the session yourself.";

/** Default studio block for Company Show batch / pilot shoots. */
export const COMPANY_SHOW_SESSION_HOURS = 3;

export function isCompanyShowPlanId(id: string): id is CompanyShowPlanId {
  return COMPANY_SHOW_PLANS.some((p) => p.id === id);
}

export function isPodcastOfferId(id: string): id is PodcastOfferId {
  return (
    id === "diy" ||
    id === "pilot" ||
    id === "founding" ||
    isCompanyShowPlanId(id)
  );
}

export function podcastOfferPrice(
  offer: PodcastOfferId,
  roomId: RoomId,
  hours: number,
): number {
  if (offer === "diy") return roomOnlyTotal(roomId, hours);
  if (offer === "pilot") return COMPANY_SHOW.pilot.price;
  if (offer === "founding") return COMPANY_SHOW.founding.monthlyPrice;
  const plan = COMPANY_SHOW_PLANS.find((p) => p.id === offer);
  return plan?.monthlyPrice ?? 0;
}

export function podcastOfferLabel(offer: PodcastOfferId): string {
  if (offer === "diy") return "DIY room + equipment only";
  if (offer === "pilot") return `${COMPANY_SHOW.pilot.name} · $${COMPANY_SHOW.pilot.price}`;
  if (offer === "founding") {
    return `${COMPANY_SHOW.founding.name} · $${COMPANY_SHOW.founding.monthlyPrice}/mo`;
  }
  const plan = COMPANY_SHOW_PLANS.find((p) => p.id === offer);
  return plan
    ? `${COMPANY_SHOW.name} ${plan.name} · $${plan.monthlyPrice}/mo`
    : COMPANY_SHOW.name;
}

export function podcastOfferShortLabel(offer: PodcastOfferId): string {
  if (offer === "diy") return "DIY room-only";
  if (offer === "pilot") return COMPANY_SHOW.pilot.name;
  if (offer === "founding") return "Founding program";
  const plan = COMPANY_SHOW_PLANS.find((p) => p.id === offer);
  return plan ? plan.name : COMPANY_SHOW.name;
}
