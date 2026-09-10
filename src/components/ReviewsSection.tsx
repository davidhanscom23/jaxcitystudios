"use client";

import { useEffect, useRef, useState } from "react";
import { HOME_REVIEWS, type StudioReview } from "@/data/reviews";
import { STUDIO } from "@/lib/rates";

function ReviewCard({ review }: { review: StudioReview }) {
  return (
    <article
      className="review-card flex w-[min(78vw,22rem)] shrink-0 flex-col justify-between border border-rule bg-graphite/80 p-6 sm:w-[24rem] sm:p-7"
      data-side={review.side}
    >
      <div>
        <p
          className={`font-caps text-[18px] tracking-[0.16em] ${
            review.side === "music" ? "text-magenta" : "text-cyan"
          }`}
        >
          {review.side === "music" ? "Music" : "Podcast"}
        </p>
        <blockquote className="mt-4 text-[18px] leading-snug text-paper-dim">
          “{review.quote}”
        </blockquote>
      </div>
      <footer className="mt-8 border-t border-rule pt-4">
        <p className="font-caps text-[18px] tracking-[0.14em] text-paper">
          {review.name}
        </p>
        <p className="mt-1 text-sm text-muted">{review.role}</p>
      </footer>
    </article>
  );
}

export function ReviewsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let frame = 0;
    let last = performance.now();
    const speed = 28; // px per second

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!paused) {
        el.scrollLeft += speed * dt;
        const loopWidth = el.scrollWidth / 2;
        if (loopWidth > 0 && el.scrollLeft >= loopWidth) {
          el.scrollLeft -= loopWidth;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);

  const loop: StudioReview[] = [...HOME_REVIEWS, ...HOME_REVIEWS];

  return (
    <section className="section-space border-t border-rule">
      <div className="wide-margin">
        <p className="font-caps text-[18px] text-muted">Reviews</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display max-w-[16ch] text-4xl sm:text-5xl">
              From the rooms
            </h2>
            <p className="mt-4 text-paper-dim">
              What artists and hosts say after a night or a show day in the
              room. More live quotes coming as they land.
            </p>
          </div>
          <a
            href={STUDIO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-solid inline-flex w-fit no-underline"
          >
            Follow {STUDIO.instagram}
          </a>
        </div>
      </div>

      <div
        className="relative mt-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <div
          ref={scrollerRef}
          className="review-scroller flex gap-4 overflow-x-auto px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          aria-label="Scrolling studio reviews"
          onPointerDown={() => setPaused(true)}
          onTouchStart={() => setPaused(true)}
        >
          {loop.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
