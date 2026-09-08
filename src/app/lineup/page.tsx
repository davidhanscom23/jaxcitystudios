import type { Metadata } from "next";
import { LineupPage } from "@/components/LineupPage";
import { SERVICES } from "@/data/services";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Studio Lineup | Music & Podcast Services Jacksonville | JaxCity",
  description:
    "Music tracking, mixing, podcast recording, multi-camera video, livestream, voiceover, full-service production, and on-location recording at JaxCity Studios, Jacksonville.",
  path: "/lineup",
});

export default function Page() {
  return (
    <>
      <LineupPage />
      {/* Hidden SEO blocks per service — page-level treatment without separate routes clutter */}
      <div className="sr-only">
        {SERVICES.map((s) => (
          <article key={s.id}>
            <h2>{s.seoTitle}</h2>
            <p>{s.seoDescription}</p>
            <p>{s.keywords.join(", ")}</p>
          </article>
        ))}
      </div>
    </>
  );
}
