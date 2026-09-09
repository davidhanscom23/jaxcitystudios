/**
 * Soft-launch product: done-for-you company content show for Northeast Florida.
 * Podcast is the format; the product is a month of content from one batch day.
 */

export const COMPANY_SHOW = {
  name: "The Company Show",
  tagline: "You show up. We handle everything else.",
  promise:
    "Give us one afternoon a month. We turn it into your company’s video and podcast content — hosted, recorded, edited, clipped, and published.",
  regionNote: "Northeast Florida businesses only for this soft launch.",
  host: {
    name: "David Hanscom",
    title: "Host & producer",
    photo: "/images/host-david-hanscom.jpg",
    photoAlt:
      "David Hanscom in the studio with a broadcast microphone — host of The Company Show",
    siteUrl: "https://davidhanscom.com",
    blurb:
      "David runs the interview, keeps executives comfortable, and steers the conversation so your company sounds sharp without reading a script.",
    bio: [
      "David Hanscom is a Jacksonville-based speaker, entertainer, and educator with more than two decades leading high-impact live experiences. He founded Y? Entertainment in 1998, co-founded Vident Productions in 2023, and brings that same command of a room to The Company Show — so owners and executives can talk, not produce.",
      "A 2025 DJ Hall of Fame inductee and the Jacksonville Jaguars’ official DJ for 12 years (1999–2010), David built fan-experience strategies for major sports audiences and headlined high-stakes stages — including Super Bowl XXXIX — sharing bills with artists like Wu-Tang Clan, Ice Cube, Snoop Dogg, and Naughty by Nature. He also leads as President (2024 & 2025) of Meeting Professionals International’s award-winning North Florida chapter.",
      "As a host, that résumé shows up as presence under pressure: reading people, asking sharper follow-ups, and turning expertise into a conversation Northeast Florida buyers actually want to watch.",
    ],
    highlights: [
      "2025 DJ Hall of Fame inductee",
      "Official DJ, Jacksonville Jaguars (12 years)",
      "Super Bowl XXXIX headlining DJ talent",
      "President, MPI North Florida (2024 & 2025)",
      "Founder, Y? Entertainment (1998)",
      "Co-founder, Vident Productions (2023)",
      "AI keynotes & experiential corporate education",
    ],
  },
  founding: {
    id: "founding-company-program",
    name: "Founding Company Program",
    monthlyPrice: 1495,
    normalMonthlyPrice: 1995,
    months: 3,
    spots: 5,
    note: "Soft launch for five Northeast Florida businesses. After the founding cohort, new clients move to the standard Business rate.",
  },
  pilot: {
    id: "company-show-pilot",
    name: "Pilot episode",
    price: 750,
    note: "One-time. Experience the host, room, and finished deliverables before a monthly commitment.",
    includes: [
      "Show concept",
      "Professional host / interviewer",
      "Episode Blueprint",
      "~30-minute recording",
      "Multi-camera video + pro audio",
      "Finished episode (YouTube + podcast ready)",
      "3 short clips",
      "Thumbnail + show notes",
    ],
  },
} as const;

export const SHOW_FORMATS = [
  {
    id: "authority",
    name: "Authority Show",
    headline: "Thought leadership",
    blurb:
      "Your host interviews owners and executives about expertise, trends, and how buyers should decide.",
    fits: [
      "Law firms",
      "Financial advisors",
      "Healthcare",
      "Real estate",
      "Hospitality",
      "Consultants",
      "Technology",
      "Contractors",
    ],
  },
  {
    id: "customer-stories",
    name: "Customer Stories",
    headline: "Proof without the hard sell",
    blurb:
      "We interview your customers about the problem, the experience, and the outcome — an extended video case study that doesn’t feel like a testimonial ad.",
    fits: ["Service businesses", "B2B", "Home services", "Agencies"],
  },
  {
    id: "community",
    name: "Community Show",
    headline: "Industry & local conversations",
    blurb:
      "Your company sponsors the show while we interview people in your industry or community — access that feels like an invitation, not a sales call.",
    fits: [
      "Jacksonville Business Stories",
      "North Florida Health Conversations",
      "Moving Jacksonville",
    ],
  },
] as const;

export type CompanyShowPlanId = "starter" | "business" | "authority";

export const COMPANY_SHOW_PLANS: {
  id: CompanyShowPlanId;
  name: string;
  monthlyPrice: number;
  featured?: boolean;
  episodes: number;
  clips: number;
  thumbnails: number;
  guestCoordination: boolean;
  blogArticles: number;
  socialCopy: boolean;
  analytics: boolean;
  summary: string;
}[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 995,
    episodes: 1,
    clips: 3,
    thumbnails: 1,
    guestCoordination: false,
    blogArticles: 0,
    socialCopy: false,
    analytics: false,
    summary: "One host-led episode a month — ideal to prove the format.",
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: 1995,
    featured: true,
    episodes: 4,
    clips: 12,
    thumbnails: 4,
    guestCoordination: true,
    blogArticles: 0,
    socialCopy: false,
    analytics: false,
    summary:
      "The plan we recommend: one batch afternoon → four episodes and a month of clips.",
  },
  {
    id: "authority",
    name: "Authority",
    monthlyPrice: 2995,
    episodes: 4,
    clips: 20,
    thumbnails: 4,
    guestCoordination: true,
    blogArticles: 4,
    socialCopy: true,
    analytics: true,
    summary: "Full content engine — clips, articles, social copy, and monthly analytics.",
  },
];

/** Included on every paid Company Show plan. */
export const COMPANY_SHOW_CORE = [
  "Professional host / interviewer",
  "Episode Blueprint (objectives, questions, CTA — not a stiff script)",
  "Studio, equipment, and crew",
  "Multi-camera video + professional audio",
  "Editing",
  "Podcast publishing",
  "YouTube publishing",
  "Show notes",
] as const;

export const COMPANY_SHOW_ADDONS = [
  { name: "Social media management", from: 500 },
  { name: "Additional clips", from: 300 },
  { name: "Extra recording session", from: 600 },
  { name: "On-location recording", from: 300 },
  { name: "Customer / guest scheduling", from: 300 },
  { name: "Blog / SEO conversion", from: 400 },
  { name: "LinkedIn content", from: 300 },
  { name: "Email / newsletter content", from: 250 },
] as const;

export const COMPANY_SHOW_BATCH = {
  title: "One afternoon. A month of content.",
  hours: "About 2½–3 hours once a month",
  exampleTopics: [
    "What’s changing in your industry?",
    "Biggest mistakes customers make",
    "Customer story / case study",
    "Questions buyers should ask before they hire you",
  ],
} as const;
