"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useBooking } from "@/components/booking/BookingProvider";

const LINKS = [
  { href: "/lineup", label: "Lineup" },
  { href: "/pricing", label: "Pricing" },
  { href: "/planner", label: "Build Your Show" },
  { href: "/agreement", label: "Agreement" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { openBooking } = useBooking();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-rule/80 bg-ink/85 backdrop-blur-md">
      <div className="wide-margin flex items-center justify-between gap-6 py-3">
        <Link href="/" className="group flex items-center gap-3 no-underline">
          <Image
            src="/images/logo-header.png"
            alt="JaxCity Studios"
            width={160}
            height={107}
            className="h-12 w-auto sm:h-14"
            priority
          />
          <span className="sr-only">JaxCity Studios — Jacksonville, FL</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-caps text-[0.72rem] no-underline transition-colors ${
                pathname?.startsWith(l.href)
                  ? "text-cyan text-glow-cyan"
                  : "text-muted hover:text-paper"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button type="button" className="btn btn-solid" onClick={() => openBooking()}>
            Book
          </button>
          <Link
            href="/app"
            className="font-caps text-[0.72rem] text-muted no-underline hover:text-paper"
          >
            Phone app
          </Link>
        </nav>

        <button
          type="button"
          className="font-caps text-[0.75rem] text-cyan lg:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="border-t border-rule bg-charcoal lg:hidden">
          <nav className="wide-margin flex flex-col gap-4 py-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-caps text-sm no-underline"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              className="btn btn-solid w-fit"
              onClick={() => {
                setOpen(false);
                openBooking();
              }}
            >
              Book
            </button>
            <Link
              href="/app"
              className="font-caps text-sm text-muted no-underline"
              onClick={() => setOpen(false)}
            >
              Phone app
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
