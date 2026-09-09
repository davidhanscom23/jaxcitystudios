import Image from "next/image";
import Link from "next/link";
import { STUDIO } from "@/lib/rates";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-rule bg-charcoal">
      <div className="wide-margin section-space">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-caps text-[18px] text-cyan">Brand line</p>
            <p className="font-display crop-type mt-3 text-[clamp(3rem,12vw,8rem)] text-paper text-glow-cyan">
              {STUDIO.brandLine}
            </p>
            <p className="mt-4 max-w-xl font-body text-paper-dim">
              Music recording and podcast production for {STUDIO.region}. The room
              and the engineer are the session.
            </p>
          </div>
          <Image
            src="/images/logo.png"
            alt="JaxCity Studios logo"
            width={280}
            height={187}
            className="h-28 w-auto sm:h-36"
          />
        </div>

        <div className="mt-14 grid gap-10 border-t border-rule pt-10 md:grid-cols-3">
          <div>
            <p className="font-caps text-[18px] text-muted">Contact</p>
            <ul className="mt-4 space-y-2 text-paper-dim">
              <li>
                <a href={`tel:${STUDIO.phoneTel}`}>{STUDIO.phone}</a>
              </li>
              <li>
                <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>
              </li>
              <li>
                <a
                  href={STUDIO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {STUDIO.instagram}
                </a>
              </li>
              <li className="text-muted">{STUDIO.addressPlaceholder}</li>
            </ul>
          </div>
          <div>
            <p className="font-caps text-[18px] text-muted">Navigate</p>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/lineup">Lineup</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/planner">Build Your Show</Link>
              </li>
              <li>
                <Link href="/blog">Journal</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-caps text-[18px] text-muted">Note</p>
            <p className="mt-4 text-hot">{STUDIO.seriousInquiries}</p>
          </div>
        </div>

        <p className="mt-14 font-caps text-[18px] text-muted">
          © {new Date().getFullYear()} {STUDIO.name}. {STUDIO.city}.
        </p>
      </div>
    </footer>
  );
}
