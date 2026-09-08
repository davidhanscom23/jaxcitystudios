"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useBooking } from "@/components/booking/BookingProvider";

const LINKS = [
  { href: "/lineup", label: "Lineup" },
  { href: "/pricing", label: "Pricing" },
  { href: "/planner", label: "Build Your Show" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { openBooking } = useBooking();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-rule/80 bg-ink/90 backdrop-blur-md">
      <div className="wide-margin flex items-center justify-between gap-6 py-4">
        <Link href="/" className="group no-underline">
          <span className="font-caps text-[0.7rem] text-muted">
            Jacksonville · FL
          </span>
          <div className="font-display text-xl tracking-tight text-paper group-hover:text-paper-dim sm:text-2xl">
            JaxCity Studios
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`font-caps text-[0.72rem] no-underline transition-colors ${
                pathname?.startsWith(l.href)
                  ? "text-paper"
                  : "text-muted hover:text-paper"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button type="button" className="btn btn-solid" onClick={() => openBooking()}>
            Book
          </button>
        </nav>

        <button
          type="button"
          className="font-caps text-[0.75rem] text-paper lg:hidden"
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
          </nav>
        </div>
      )}
    </header>
  );
}
