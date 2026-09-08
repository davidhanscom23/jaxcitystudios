"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { SERVICES, type Service } from "@/data/services";
import { useBooking } from "@/components/booking/BookingProvider";

export function LineupPage() {
  const [active, setActive] = useState<Service | null>(null);
  const { openBooking } = useBooking();

  const music = useMemo(
    () => SERVICES.filter((s) => ["music-tracking", "mixing-mastering", "voiceover", "on-location"].includes(s.id)),
    [],
  );
  const podcast = useMemo(
    () =>
      SERVICES.filter((s) =>
        [
          "podcast-recording",
          "multicam-video",
          "livestream",
          "full-service",
        ].includes(s.id),
      ),
    [],
  );

  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[0.7rem] text-muted">Lineup</p>
      <h1 className="font-display crop-type mt-4 max-w-[12ch] text-[clamp(3rem,10vw,7rem)]">
        Eight ways in
      </h1>
      <p className="mt-6 max-w-xl text-paper-dim">
        Click a card for the room feel and where it sits in a session. Equal
        weight for music and podcast — neither buried.
      </p>

      <div id="music" className="mt-20 scroll-mt-28">
        <h2 className="font-caps text-[0.72rem] text-muted">Music recording</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {music.map((s) => (
            <ServiceCard key={s.id} service={s} onOpen={() => setActive(s)} />
          ))}
        </div>
      </div>

      <div id="podcast" className="mt-24 scroll-mt-28">
        <h2 className="font-caps text-[0.72rem] text-muted">Podcast production</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {podcast.map((s) => (
            <ServiceCard key={s.id} service={s} onOpen={() => setActive(s)} />
          ))}
        </div>
      </div>

      {/* All eight in order for SEO crawl of titles */}
      <div className="mt-24 border-t border-rule pt-16">
        <h2 className="font-caps text-[0.72rem] text-muted">Full lineup</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <ServiceCard key={`all-${s.id}`} service={s} onOpen={() => setActive(s)} compact />
          ))}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-rule bg-charcoal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="duotone-wrap relative aspect-[16/10]">
              <Image
                src={active.image}
                alt={active.title}
                fill
                className="duotone object-cover"
                sizes="672px"
              />
            </div>
            <div className="p-6 sm:p-8">
              <button
                type="button"
                className="font-caps text-[0.65rem] text-muted"
                onClick={() => setActive(null)}
              >
                Close
              </button>
              <h2 id="service-modal-title" className="font-display mt-4 text-4xl">
                {active.title}
              </h2>
              <p className="mt-6 font-caps text-[0.65rem] text-muted">
                In the room
              </p>
              <p className="mt-2 text-paper-dim">{active.inTheRoom}</p>
              <p className="mt-6 font-caps text-[0.65rem] text-muted">
                In the session
              </p>
              <p className="mt-2 text-paper-dim">{active.inSession}</p>
              <button
                type="button"
                className="btn btn-solid mt-8"
                onClick={() => {
                  setActive(null);
                  openBooking();
                }}
              >
                Book this
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  onOpen,
  compact,
}: {
  service: Service;
  onOpen: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group border border-rule bg-ink text-left transition-colors hover:border-paper-dim"
    >
      <div
        className={`duotone-wrap relative overflow-hidden ${
          compact ? "aspect-[4/3]" : "aspect-[4/3]"
        }`}
      >
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="duotone object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-2xl leading-none">{service.title}</h3>
        {!compact && (
          <p className="mt-3 text-sm text-muted">{service.short}</p>
        )}
      </div>
    </button>
  );
}
