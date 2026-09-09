"use client";

import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/data/services";
import { useBooking } from "@/components/booking/BookingProvider";

export function ServiceDetail({ service }: { service: Service }) {
  const { openBooking } = useBooking();
  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[18px] text-muted">
        <Link href="/lineup" className="no-underline">
          Lineup
        </Link>
      </p>
      <h1 className="font-display crop-type mt-4 max-w-[14ch] text-[clamp(2.8rem,8vw,5.5rem)]">
        {service.title}
      </h1>
      <p className="mt-6 max-w-xl text-paper-dim">{service.short}</p>
      <div className="duotone-wrap relative mt-12 aspect-[16/9] overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="duotone object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-caps text-[18px] text-muted">In the room</h2>
          <p className="mt-3 text-lg text-paper-dim">{service.inTheRoom}</p>
        </div>
        <div>
          <h2 className="font-caps text-[18px] text-muted">In the session</h2>
          <p className="mt-3 text-lg text-paper-dim">{service.inSession}</p>
        </div>
      </div>
      <p className="mt-10 text-sm text-muted">
        Keywords: {service.keywords.join(" · ")}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-solid" onClick={() => openBooking()}>
          Book
        </button>
        <Link href="/planner" className="btn no-underline">
          Build Your Show
        </Link>
      </div>
    </div>
  );
}
