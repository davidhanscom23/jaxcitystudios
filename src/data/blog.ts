export type BlogPost = {
  slug: string;
  title: string;
  neighborhood:
    | "Riverside and Avondale"
    | "San Marco"
    | "Jacksonville Beach"
    | "Ponte Vedra";
  excerpt: string;
  pullQuote: string;
  date: string;
  featured: boolean;
  image?: string;
  sections: { heading: string; body: string }[];
  seoTitle: string;
  seoDescription: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "riverside-avondale-first-session",
    title: "Your first session if you live in Riverside or Avondale",
    neighborhood: "Riverside and Avondale",
    excerpt:
      "How artists and hosts west of the river usually book: engineered time, the two-hour floor, and what to bring.",
    pullQuote: "The room and the engineer are the session — not an add-on.",
    date: "2026-08-12",
    featured: true,
    image: "/images/blog-featured-riverside.png",
    sections: [
      {
        heading: "Start with engineered time",
        body: "For a first visit from Riverside or Avondale, book an engineered session. First-time clients are $60 per hour with a two-hour minimum ($120). That rate includes the room. You are not stacking a separate room fee on top.",
      },
      {
        heading: "What the two hours are for",
        body: "Hour one settles levels, tones, and nerves. Hour two is where the take usually lives. If you need more, stay — the clock is honest and the rate does not change mid-session.",
      },
      {
        heading: "Returning after the first cut",
        body: "Once you are a returning client, engineered sessions are $50 per hour with a $100 two-hour minimum. Same rooms. Same engineer-led approach. Less friction.",
      },
    ],
    seoTitle: "Recording Studio Near Riverside Avondale Jacksonville | JaxCity",
    seoDescription:
      "First session guide for Riverside and Avondale. JaxCity Studios engineered rates: $60/hr first-time, $50/hr returning. Recording studio Jacksonville.",
  },
  {
    slug: "avondale-podcast-table",
    title: "Podcast tables that fit Avondale schedules",
    neighborhood: "Riverside and Avondale",
    excerpt:
      "Weeknight conversations, two mics, and why room-only only makes sense if you bring an engineer.",
    pullQuote: "Room-only and engineered do not stack. Pick one door.",
    date: "2026-07-28",
    featured: false,
    sections: [
      {
        heading: "Engineered vs room-only",
        body: "If JaxCity runs the session, you pay the engineered rate ($60 or $50 hourly) and the room is included. If you bring your own engineer, book room-only: Mercury $25, Venus $35, Earth $45, or Mars $65 per hour — or a full day starting at $200.",
      },
      {
        heading: "A simple Avondale weeknight",
        body: "Two hosts, one guest, audio-first: Venus usually fits. Build the episode in the planner, then lock the date with a 50% non-refundable deposit.",
      },
    ],
    seoTitle: "Podcast Studio Near Avondale Jacksonville | JaxCity Studios",
    seoDescription:
      "Podcast recording for Avondale creators. Clear engineered vs room-only pricing at JaxCity Studios, Jacksonville.",
  },
  {
    slug: "san-marco-tracking-night",
    title: "Tracking after dark from San Marco",
    neighborhood: "San Marco",
    excerpt:
      "Why night sessions suit San Marco musicians — and how Mars vs Earth changes the bill.",
    pullQuote: "Mars is $65 an hour room-only. Engineered is still $50 or $60 — room included.",
    date: "2026-08-02",
    featured: false,
    sections: [
      {
        heading: "Pick the room for the band",
        body: "Earth holds up to four people and three cameras. Mars opens to six and four cameras. Room-only pricing climbs with the room; engineered sessions keep the published hourly and include whichever room fits.",
      },
      {
        heading: "Deposit before you load in",
        body: "A 50% non-refundable deposit secures the booking. The remaining balance is due upon arrival before the session begins.",
      },
    ],
    seoTitle: "Recording Studio Near San Marco Jacksonville | JaxCity Studios",
    seoDescription:
      "Music tracking near San Marco. JaxCity Studios rooms Mercury–Mars and engineered session rates for Jacksonville artists.",
  },
  {
    slug: "san-marco-video-podcast",
    title: "San Marco brands and the video podcast table",
    neighborhood: "San Marco",
    excerpt:
      "Multi-camera shows for local businesses — what fits Earth, what needs Mars, and how sample series pricing is labeled.",
    pullQuote: "Four cameras and four people do not fit Mercury. The planner will say so.",
    date: "2026-06-18",
    featured: false,
    sections: [
      {
        heading: "Camera count is a room decision",
        body: "Mercury maxes at one camera. Venus two. Earth three. Mars four. The Build Your Show planner recommends a room from your host, guest, and camera picks.",
      },
      {
        heading: "Series pricing, honestly labeled",
        body: "The Series package uses eight published returning engineered hours ($400) plus a sample post-production estimate. Comparable Jacksonville bundles we researched include AGUYB’s Podcast Launch Bundle at $1,249.",
      },
    ],
    seoTitle: "Video Podcast Studio San Marco Jacksonville | JaxCity",
    seoDescription:
      "Multi-camera video podcast production near San Marco. Transparent Jacksonville podcast studio pricing at JaxCity Studios.",
  },
  {
    slug: "jacksonville-beach-first-tape",
    title: "Beaches artists: book the first tape without guessing rates",
    neighborhood: "Jacksonville Beach",
    excerpt:
      "From Jax Beach to the control room — intro promo, first-time rate, and what “2 hours for $80” actually covers.",
    pullQuote: "2 hours for $80 — first session only. Then the published card applies.",
    date: "2026-08-20",
    featured: true,
    image: "/images/blog-featured-beaches.png",
    sections: [
      {
        heading: "The intro offer",
        body: "JaxCity’s published introductory promotion is 2 hours for $80 on a first session. It is engineered time — room included — not a room-only deal.",
      },
      {
        heading: "After the intro",
        body: "Standard first-time engineered sessions are $60 per hour ($120 minimum). Returning clients drop to $50 per hour ($100 minimum). Room-only remains Mercury $25 through Mars $65.",
      },
    ],
    seoTitle: "Recording Studio Near Jacksonville Beach | JaxCity Studios",
    seoDescription:
      "Affordable recording studio for Jacksonville Beach artists. First session promo 2 hours for $80. Hourly rates published.",
  },
  {
    slug: "jax-beach-podcast-remote",
    title: "Remote guests when you record from the Beaches",
    neighborhood: "Jacksonville Beach",
    excerpt:
      "Hybrid episodes: local hosts, out-of-town guests, and how livestream sits in a normal session timeline.",
    pullQuote: "Press Record. The guest can be elsewhere.",
    date: "2026-07-09",
    featured: false,
    sections: [
      {
        heading: "Hybrid is still a room day",
        body: "Livestream and remote guests book like any engineered session. Plan setup time for the remote seat before the intro hits.",
      },
      {
        heading: "Budget language, premium room",
        body: "Searching cheap or inexpensive recording studio Jacksonville still lands on the same card: published hours, no invented packages, sample figures labeled when we estimate post.",
      },
    ],
    seoTitle: "Podcast Recording Studio Near Jacksonville Beach | JaxCity",
    seoDescription:
      "Podcast studio near Jacksonville Beach with remote guest support. Clear rates from JaxCity Studios.",
  },
  {
    slug: "ponte-vedra-day-rate",
    title: "Ponte Vedra producers and the $200 day",
    neighborhood: "Ponte Vedra",
    excerpt:
      "When bring-your-own-engineer makes sense — and how the day rate sits beside hourly room-only.",
    pullQuote: "Full day room rentals start at $200 — without our engineer, or with yours.",
    date: "2026-05-30",
    featured: false,
    sections: [
      {
        heading: "Hourly room-only ladder",
        body: "Mercury $25, Venus $35, Earth $45, Mars $65. These are the hourly companion to the day rate. They do not stack with engineered session pricing.",
      },
      {
        heading: "When a day wins",
        body: "If you are blocking a long edit day or stacking multiple setups with your own engineer, ask about a full day starting at $200 before multiplying hourly room time.",
      },
    ],
    seoTitle: "Room Rental Recording Studio Ponte Vedra Area | JaxCity",
    seoDescription:
      "Day rate and room-only pricing for Ponte Vedra producers. JaxCity Studios full day from $200. Recording studio prices Jacksonville area.",
  },
  {
    slug: "ponte-vedra-partner-retainer",
    title: "Monthly shows from Ponte Vedra: reading sample retainers",
    neighborhood: "Ponte Vedra",
    excerpt:
      "How The Studio Partner is built from real hours plus a labeled sample production estimate.",
    pullQuote: "Eight returning engineered hours are $400. The rest of the retainer is sample.",
    date: "2026-06-22",
    featured: false,
    sections: [
      {
        heading: "What is published vs sample",
        body: "The Studio Partner lists eight engineered hours per month at the published $50 returning rate ($400). The additional monthly production estimate is sample pricing, researched against Jacksonville memberships such as IA Digital’s $497 and $1,197 tiers.",
      },
      {
        heading: "Book the honesty",
        body: "Serious inquiries only — and serious math. Use the planner, check the pricing page, then deposit 50% to lock the date.",
      },
    ],
    seoTitle: "Monthly Podcast Retainer Ponte Vedra | JaxCity Studios",
    seoDescription:
      "Sample monthly podcast retainer built on JaxCity’s published $50/hr returning rate. Podcast studio Jacksonville for recurring shows.",
  },
];

export function getPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
