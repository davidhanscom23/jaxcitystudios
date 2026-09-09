"use client";

import Image from "next/image";
import Link from "next/link";
import { RoomName } from "@/components/RoomName";
import { ENGINEERED, ROOMS, STUDIO } from "@/lib/rates";
import { ReviewsSection } from "@/components/ReviewsSection";

export function HomePage() {
  return (
    <>
      {/* HERO — B&W session photo + Press Record */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="photo-wrap hero-photo absolute inset-0 z-0 min-h-[100svh] w-full">
          <Image
            src="/images/hero-session-bw.jpg"
            alt="Black-and-white recording studio session — engineer at the console, vocal booth beyond the glass"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between wide-margin pb-16 pt-10 sm:pb-24">
          <div className="fade-in pt-4">
            <Image
              src="/images/logo-header.png"
              alt="JaxCity Studios"
              width={220}
              height={147}
              className="h-20 w-auto drop-shadow-[0_0_18px_rgba(46,230,255,0.35)] sm:h-24"
              priority
            />
          </div>
          <div>
            <p className="font-caps fade-in text-[18px] text-cyan">
              {STUDIO.city} · Music & podcast
            </p>
            <h1 className="font-display fade-in-delay crop-type mt-4 max-w-[12ch] text-[clamp(3.8rem,14vw,9.5rem)] text-paper text-glow-cyan">
              {STUDIO.brandLine}
            </h1>
            <p className="fade-in-late mt-6 max-w-md text-lg text-paper-dim">
              Music recording and podcast production — the room and the engineer
              are the whole session.
            </p>
            <div className="fade-in-late mt-10 flex flex-wrap gap-3">
              <Link href="/lineup#music" className="btn btn-solid no-underline">
                Music recording
              </Link>
              <Link href="/company-show" className="btn no-underline">
                The Company Show
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dual doors — real lounge/booth + control detail */}
      <section className="section-space wide-margin border-t border-rule">
        <p className="font-caps text-[18px] text-cyan">Two front doors</p>
        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <article>
            <div className="photo-wrap neon-frame relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/studio-session-purple.jpg"
                alt="Engineered music session in the control room — DAW open, booth lit beyond the glass"
                fill
                className="object-cover object-[center_35%]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <h2 className="font-display mt-8 text-4xl text-glow-cyan sm:text-5xl">
              Music
            </h2>
            <p className="mt-4 max-w-md text-paper-dim">
              Tracking, mixing, full-band nights. An engineer runs the session —
              not a vacant room with a password on the door.
            </p>
            <Link
              href="/lineup#music"
              className="mt-6 inline-block font-caps text-[18px] text-cyan"
            >
              See music lineup →
            </Link>
          </article>
          <article>
            <div className="photo-wrap neon-frame-pink relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/studio-lounge.jpg"
                alt="Studio lounge looking into the blue-lit recording booth"
                fill
                className="object-cover object-[center_45%]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <h2 className="font-display mt-8 text-4xl text-glow-magenta sm:text-5xl">
              Podcast
            </h2>
            <p className="mt-4 max-w-md text-paper-dim">
              À la carte studio sessions — or The Company Show: you show up once
              a month, we host, record, edit, clip, and publish a full content
              batch for Northeast Florida businesses.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/company-show"
                className="font-caps text-[18px] text-magenta"
              >
                The Company Show →
              </Link>
              <Link
                href="/lineup#podcast"
                className="font-caps text-[18px] text-muted"
              >
                Podcast lineup →
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Room system spine — flyer color accents */}
      <section className="section-space border-t border-rule bg-charcoal">
        <div className="wide-margin">
          <p className="font-caps text-[18px] text-cyan">Choose your room</p>
          <h2 className="font-display crop-type mt-4 max-w-[10ch] text-[clamp(2.8rem,8vw,6rem)]">
            Mercury to Mars
          </h2>
          <p className="mt-6 max-w-xl text-paper-dim">
            Four rooms. One price ladder. Room-only hourly for bring-your-own-engineer
            — separate from engineered sessions that already include the room.
          </p>
          <ol className="mt-16 divide-y divide-rule border-y border-rule">
            {ROOMS.map((room, i) => (
              <li
                key={room.id}
                className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-8 sm:grid-cols-[4rem_1fr_8rem_auto]"
              >
                <span className="font-caps text-[18px] text-muted">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="text-3xl sm:text-4xl">
                    <RoomName roomId={room.id} size="lg" />
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted">{room.fit}</p>
                </div>
                <p className="hidden font-caps text-[18px] text-muted sm:block">
                  Up to {room.maxPeople} · {room.maxCameras} cam
                </p>
                <p className="font-display text-2xl sm:text-3xl" style={{ color: room.color }}>
                  ${room.hourly}
                  <span className="font-caps ml-1 text-[18px] text-muted">
                    /hr room
                  </span>
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-muted">
            Engineered sessions:{" "}
            <span className="text-cyan">
              ${ENGINEERED.firstTimeHourly}/hr first-time
            </span>{" "}
            ·{" "}
            <span className="text-magenta">
              ${ENGINEERED.returningHourly}/hr returning
            </span>{" "}
            — room included. Full day room rental from $200.
          </p>
          <Link href="/pricing" className="btn mt-8 inline-flex no-underline">
            Full rate card
          </Link>
        </div>
      </section>

      {/* Session in progress — real control-room night */}
      <section className="relative min-h-[70vh]">
        <div className="photo-wrap absolute inset-0">
          <Image
            src="/images/studio-session-red.jpg"
            alt="Engineer and client at the JaxCity Studios console under magenta session lighting"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 flex min-h-[70vh] items-end wide-margin pb-16">
          <div className="max-w-lg">
            <p className="font-caps text-[18px] text-cyan">The rooms</p>
            <h2 className="font-display mt-3 text-4xl text-glow-cyan sm:text-6xl">
              The engineer runs the night
            </h2>
            <p className="mt-4 text-paper-dim">
              Serving {STUDIO.region}. Serious inquiries only — then we work.
            </p>
          </div>
        </div>
      </section>

      <ReviewsSection />
    </>
  );
}
