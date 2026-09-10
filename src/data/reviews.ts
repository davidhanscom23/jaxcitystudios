export type StudioReview = {
  id: string;
  quote: string;
  name: string;
  role: string;
  side: "music" | "podcast";
};

/**
 * Home reviews strip — music and podcast balance.
 * Replace with verified client quotes as they come in.
 */
export const HOME_REVIEWS: StudioReview[] = [
  {
    id: "m1",
    quote:
      "I finally stopped worrying about the room and just sang. They got what I was going for without me having to explain every take — and the mix sounded like us, not like homework.",
    name: "Marcus T.",
    role: "Artist · Riverside",
    side: "music",
  },
  {
    id: "p1",
    quote:
      "My guest said it felt like a real conversation, not a stiff studio sit-down. I walked out proud of the episode instead of stressed about whether we’d captured anything usable.",
    name: "Alicia R.",
    role: "Host · San Marco",
    side: "podcast",
  },
  {
    id: "m2",
    quote:
      "First time booking here and it felt like they’d been waiting for us. No scramble, no awkward dead air — we got in the pocket fast and left with takes I actually want to release.",
    name: "Jordan K.",
    role: "Producer · Beaches",
    side: "music",
  },
  {
    id: "p2",
    quote:
      "I needed something that would make our company sound sharp to Northeast Florida clients. JaxCity made us look and sound like we belonged on the internet — without turning the day into a production circus.",
    name: "Danielle P.",
    role: "Founder · Jacksonville",
    side: "podcast",
  },
  {
    id: "m3",
    quote:
      "The live room finally matched the energy of our band. We’re already booked for the next EP nights — this is home base for us now.",
    name: "Chris & Maya",
    role: "Band · Avondale",
    side: "music",
  },
  {
    id: "p3",
    quote:
      "Three of us on mics and somehow it still felt easy. Everyone stayed comfortable, the conversation stayed honest, and I didn’t have to babysit the session to get a show worth publishing.",
    name: "Evan S.",
    role: "Podcast lead · Jax Beach",
    side: "podcast",
  },
];
