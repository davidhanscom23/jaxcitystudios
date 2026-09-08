import { STUDIO, DEPOSIT } from "@/lib/rates";
import { pageMeta } from "@/lib/seo";
import { ContactForm } from "@/components/ContactForm";

export const metadata = pageMeta({
  title: "Contact JaxCity Studios | Recording Studio Jacksonville",
  description:
    "Contact JaxCity Studios — 904-536-7211, jaxcitystudios@gmail.com, @jaxcity.studios. Podcast and recording studio Jacksonville. Studio address — to be added.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="wide-margin section-space">
      <p className="font-caps text-[0.7rem] text-muted">Contact</p>
      <h1 className="font-display crop-type mt-4 text-[clamp(3rem,9vw,6rem)]">
        Serious Inquiries Only.
      </h1>
      <p className="mt-6 max-w-xl text-paper-dim">
        No public street address yet. Reach the studio by phone, email, or
        Instagram — same details everywhere an address would normally sit.
      </p>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <ul className="space-y-6 text-lg">
          <li>
            <p className="font-caps text-[0.65rem] text-muted">Phone</p>
            <a href={`tel:${STUDIO.phoneTel}`}>{STUDIO.phone}</a>
          </li>
          <li>
            <p className="font-caps text-[0.65rem] text-muted">Email</p>
            <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>
          </li>
          <li>
            <p className="font-caps text-[0.65rem] text-muted">Instagram</p>
            <a
              href={STUDIO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {STUDIO.instagram}
            </a>
          </li>
          <li>
            <p className="font-caps text-[0.65rem] text-muted">Address</p>
            <p className="text-paper-dim">{STUDIO.addressPlaceholder}</p>
          </li>
          <li>
            <p className="font-caps text-[0.65rem] text-muted">Booking policy</p>
            <p className="text-sm text-paper-dim">{DEPOSIT.policy}</p>
          </li>
        </ul>
        <ContactForm />
      </div>
    </div>
  );
}
