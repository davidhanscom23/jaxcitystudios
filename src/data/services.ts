export type Service = {
  id: string;
  slug: string;
  title: string;
  short: string;
  image: string;
  inTheRoom: string;
  inSession: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
};

export const SERVICES: Service[] = [
  {
    id: "music-tracking",
    slug: "music-tracking",
    title: "Music tracking",
    short: "Vocals, instruments, full band takes — captured with an engineer on the session.",
    image: "/images/lineup-music-tracking.png",
    inTheRoom:
      "It sounds like a take that breathes. Quiet floors, honest monitors, and an engineer riding levels so you stay in the performance.",
    inSession:
      "Usually the heart of the booking: setup, get tones, then stack or cut live until the idea is on tape.",
    seoTitle: "Music Tracking Recording Studio Jacksonville | JaxCity Studios",
    seoDescription:
      "Music tracking at JaxCity Studios in Jacksonville, Florida. Engineered sessions from $60/hr first-time, $50/hr returning. Affordable recording studio Jacksonville.",
    keywords: [
      "recording studio Jacksonville",
      "hourly recording studio Jacksonville",
      "affordable recording studio Jacksonville",
    ],
  },
  {
    id: "mixing-mastering",
    slug: "mixing-and-mastering",
    title: "Mixing and mastering",
    short: "Finish the record in the same building that tracked it.",
    image: "/images/lineup-mixing.png",
    inTheRoom:
      "Hands on the console, meters moving, decisions made by ear — not by a template dumped overnight.",
    inSession:
      "Follows tracking, or stands alone when you bring stems. Deliverables land after the booked mix window.",
    seoTitle: "Mixing and Mastering Jacksonville | JaxCity Studios",
    seoDescription:
      "Mixing and mastering in Jacksonville at JaxCity Studios. Professional recording studio prices Jacksonville artists can plan around.",
    keywords: [
      "recording studio prices Jacksonville",
      "recording studio Jacksonville",
      "inexpensive recording studio Jacksonville",
    ],
  },
  {
    id: "podcast-recording",
    slug: "podcast-recording",
    title: "In-studio podcast recording",
    short: "Sit down, hit record, leave with a conversation that sounds finished.",
    image: "/images/lineup-podcast.png",
    inTheRoom:
      "Table talk with weight. Mic placement that disappears, hosts that lean in, laughs that stay clean.",
    inSession:
      "After levels and a short warm-up, the episode runs as planned — intro, conversation, breaks, outro.",
    seoTitle: "Podcast Studio Jacksonville | In-Studio Recording | JaxCity",
    seoDescription:
      "Podcast recording studio Jacksonville. Book engineered podcast sessions at JaxCity Studios. Podcast recording studio near me for Northeast Florida.",
    keywords: [
      "podcast studio Jacksonville",
      "podcast recording studio near me",
      "podcast recording studio Jacksonville",
    ],
  },
  {
    id: "multicam-video",
    slug: "multi-camera-video-podcast",
    title: "Multi-camera video podcast",
    short: "Switchable angles, lit for the cut you will actually post.",
    image: "/images/lineup-multicam.png",
    inTheRoom:
      "A conversation you can see — eyes, gestures, reactions — framed for long-form and short clips.",
    inSession:
      "Cameras roll with audio. Best for Earth or Mars depending on guest count and camera count.",
    seoTitle: "Multi-Camera Video Podcast Studio Jacksonville | JaxCity",
    seoDescription:
      "Multi-camera video podcast production in Jacksonville at JaxCity Studios. Affordable podcast studio Jacksonville for creators and brands.",
    keywords: [
      "podcast studio Jacksonville",
      "podcast recording studio Jacksonville",
      "affordable recording studio Jacksonville",
    ],
  },
  {
    id: "livestream",
    slug: "livestream-and-remote-guests",
    title: "Livestream and remote guests",
    short: "Go live, or pull a guest in clean from another city.",
    image: "/images/lineup-livestream.png",
    inTheRoom:
      "Local presence with a remote seat that does not sound like a phone call.",
    inSession:
      "Tech check first, then the live or hybrid run. Clips and masters follow the edit path you choose.",
    seoTitle: "Livestream Podcast Studio Jacksonville | Remote Guests | JaxCity",
    seoDescription:
      "Livestream and remote guest podcast recording in Jacksonville. JaxCity Studios — podcast studio Jacksonville for hybrid shows.",
    keywords: [
      "podcast studio Jacksonville",
      "podcast recording studio near me",
      "recording studio Jacksonville",
    ],
  },
  {
    id: "voiceover",
    slug: "voiceover-and-audiobook",
    title: "Voiceover and audiobook",
    short: "Quiet booths, long takes, narration that holds.",
    image: "/images/lineup-voiceover.png",
    inTheRoom:
      "Close, dry, controlled. Breaths managed, pages turned soft, the voice stays front.",
    inSession:
      "Often Mercury or Venus. Punch-ins and pickups land at the end of the chapter.",
    seoTitle: "Voiceover and Audiobook Recording Jacksonville | JaxCity Studios",
    seoDescription:
      "Voiceover and audiobook recording studio Jacksonville. Hourly recording studio Jacksonville rates from $50–$60 engineered.",
    keywords: [
      "hourly recording studio Jacksonville",
      "cheap recording studio Jacksonville",
      "recording studio Jacksonville",
    ],
  },
  {
    id: "full-service",
    slug: "full-service-podcast-production",
    title: "Full-service podcast production and editing",
    short: "From room to publish — audio, video, and the cuts in between.",
    image: "/images/lineup-full-service.png",
    inTheRoom:
      "You show up ready to talk. We run the session and carry the file through edit.",
    inSession:
      "Recording day plus post. Use Build Your Show to map stages, hours, and deliverables before you book.",
    seoTitle: "Full-Service Podcast Production Jacksonville | JaxCity Studios",
    seoDescription:
      "Full-service podcast production and editing in Jacksonville. Sample series and retainer packages built on real JaxCity studio rates.",
    keywords: [
      "podcast studio Jacksonville",
      "affordable recording studio Jacksonville",
      "podcast recording studio near me",
    ],
  },
  {
    id: "on-location",
    slug: "on-location-and-mobile-recording",
    title: "On-location and mobile recording",
    short: "When the room is somewhere else — we come to it.",
    image: "/images/lineup-onlocation.png",
    inTheRoom:
      "Whatever the location gives you — live rooms, offices, stages — captured with the same engineer mindset.",
    inSession:
      "Travel and setup fold into the booking. Ask for the on-location add-on when you book.",
    seoTitle: "On-Location Recording Jacksonville | Mobile Studio | JaxCity",
    seoDescription:
      "On-location and mobile recording across Jacksonville and Northeast Florida. Recording studio Jacksonville that travels when the session needs it.",
    keywords: [
      "recording studio Jacksonville",
      "recording studio near me Jacksonville",
      "inexpensive recording studio Jacksonville",
    ],
  },
];

export function getService(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}
