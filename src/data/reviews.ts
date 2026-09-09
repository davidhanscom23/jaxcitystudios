export type StudioReview = {
  id: string;
  quote: string;
  name: string;
  role: string;
  side: "music" | "podcast";
};

/**
 * Placeholder session notes for the home reviews strip.
 * Replace with real client quotes as they come in — keep the music/podcast balance.
 */
export const HOME_REVIEWS: StudioReview[] = [
  {
    id: "m1",
    quote:
      "Tracked vocals and a full band night without fighting the room. The engineer knew when to push and when to stay out of the way — mix came back clean.",
    name: "Marcus T.",
    role: "Artist · Riverside",
    side: "music",
  },
  {
    id: "p1",
    quote:
      "Two-camera podcast table, remote guest, and a rough same-day listen-back. Felt like a real show day, not a vacant room with a password.",
    name: "Alicia R.",
    role: "Host · San Marco",
    side: "podcast",
  },
  {
    id: "m2",
    quote:
      "First engineered session here. Console, mic chain, and headphones all ready — we pressed record and got usable takes in the first hour.",
    name: "Jordan K.",
    role: "Producer · Beaches",
    side: "music",
  },
  {
    id: "p2",
    quote:
      "Business podcast for Northeast Florida clients. Clear levels, multi-cam angles that actually matched, and zero fluff between takes.",
    name: "Danielle P.",
    role: "Founder · Jacksonville",
    side: "podcast",
  },
  {
    id: "m3",
    quote:
      "Mars held the live room energy without turning to mud. Returning rate locked us in for the next EP nights.",
    name: "Chris & Maya",
    role: "Band · Avondale",
    side: "music",
  },
  {
    id: "p3",
    quote:
      "Interview show with three voices and one camera add-on. The room fit the panel, the engineer kept the clock honest, and we walked with files.",
    name: "Evan S.",
    role: "Podcast lead · Jax Beach",
    side: "podcast",
  },
];
