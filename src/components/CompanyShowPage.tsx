"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  COMPANY_SHOW,
  COMPANY_SHOW_ADDONS,
  COMPANY_SHOW_BATCH,
  COMPANY_SHOW_CORE,
  COMPANY_SHOW_PLANS,
  SHOW_FORMATS,
} from "@/data/company-show";
import { STUDIO } from "@/lib/rates";

export function CompanyShowPage() {
  return (
    <div>
      {/* Soft-launch banner */}
      <section className="border-b border-rule bg-graphite">
        <div className="wide-margin flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-caps text-[18px] text-magenta text-glow-magenta">
            Soft launch · {COMPANY_SHOW.founding.spots} founding spots · Northeast
            Florida
          </p>
          <p className="text-paper-dim">
            Founding rate ${COMPANY_SHOW.founding.monthlyPrice}/mo for{" "}
            {COMPANY_SHOW.founding.months} months (normally $
            {COMPANY_SHOW.founding.normalMonthlyPrice}).
          </p>
        </div>
      </section>

      <section className="section-space wide-margin">
        <p className="font-caps text-[18px] text-cyan">Podcast product</p>
        <h1 className="font-display crop-type mt-4 max-w-[14ch] text-[clamp(3rem,10vw,7rem)] text-glow-cyan">
          {COMPANY_SHOW.name}
        </h1>
        <p className="mt-4 font-caps text-[18px] tracking-[0.14em] text-magenta">
          {COMPANY_SHOW.tagline}
        </p>
        <p className="mt-6 max-w-2xl text-lg text-paper-dim">
          {COMPANY_SHOW.promise}
        </p>
        <p className="mt-3 max-w-2xl text-paper-dim">{COMPANY_SHOW.regionNote}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#inquire" className="btn btn-solid no-underline">
            Claim a founding spot
          </a>
          <a href="#pilot" className="btn no-underline">
            Book the ${COMPANY_SHOW.pilot.price} pilot
          </a>
        </div>
      </section>

      {/* Value reframe */}
      <section className="section-space border-t border-rule bg-charcoal">
        <div className="wide-margin grid gap-10 lg:grid-cols-2">
          <div>
            <p className="font-caps text-[18px] text-muted">The sales equation</p>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">
              Not four podcasts — a month of content
            </h2>
            <p className="mt-6 text-paper-dim">
              {COMPANY_SHOW_BATCH.title} {COMPANY_SHOW_BATCH.hours}. We prepare
              topics, host the interviews, record, edit, clip, and publish. You
              leave with long-form video, podcast episodes, short clips,
              thumbnails, and show notes — without becoming a content creator.
            </p>
          </div>
          <ul className="space-y-3 border border-rule bg-ink/40 p-6 text-paper-dim">
            {COMPANY_SHOW_BATCH.exampleTopics.map((t) => (
              <li key={t} className="border-b border-rule pb-3 last:border-0 last:pb-0">
                <span className="font-caps text-[18px] text-cyan">Episode · </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Formats */}
      <section className="section-space wide-margin border-t border-rule">
        <p className="font-caps text-[18px] text-muted">Show formats</p>
        <h2 className="font-display mt-4 max-w-[16ch] text-4xl sm:text-5xl">
          Same machine. Different story.
        </h2>
        <p className="mt-4 max-w-xl text-paper-dim">
          {COMPANY_SHOW.name} is the umbrella. Pick the format that fits your
          business — or mix them across the month.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {SHOW_FORMATS.map((f) => (
            <article key={f.id} className="border border-rule bg-graphite/60 p-6">
              <p className="font-caps text-[18px] text-cyan">{f.headline}</p>
              <h3 className="font-display mt-3 text-3xl">{f.name}</h3>
              <p className="mt-4 text-paper-dim">{f.blurb}</p>
              <p className="font-caps mt-6 text-[18px] text-muted">Fits</p>
              <ul className="mt-2 space-y-1 text-paper-dim">
                {f.fits.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Host */}
      <section className="section-space border-t border-rule bg-graphite">
        <div className="wide-margin grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-caps text-[18px] text-magenta">Host</p>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">
              {COMPANY_SHOW.host.name}
            </h2>
            <p className="font-caps mt-2 text-[18px] text-muted">
              {COMPANY_SHOW.host.title}
            </p>
            <p className="mt-6 text-lg text-paper-dim">
              {COMPANY_SHOW.host.blurb}
            </p>
            {COMPANY_SHOW.host.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="mt-4 text-paper-dim">
                {paragraph}
              </p>
            ))}
            <ul className="mt-8 space-y-2 border-t border-rule pt-6">
              {COMPANY_SHOW.host.highlights.map((item) => (
                <li
                  key={item}
                  className="font-caps text-[18px] tracking-[0.08em] text-cyan"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-paper-dim">
              Soft launch sessions are hosted by {COMPANY_SHOW.host.name}.{" "}
              <a
                href={COMPANY_SHOW.host.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan"
              >
                More at davidhanscom.com
              </a>
              .
            </p>
          </div>
          <div className="photo-wrap neon-frame-pink relative aspect-[3/4] w-full overflow-hidden lg:justify-self-end lg:max-w-md">
            <Image
              src={COMPANY_SHOW.host.photo}
              alt={COMPANY_SHOW.host.photoAlt}
              fill
              className="object-cover object-[center_20%]"
              sizes="(max-width: 1024px) 100vw, 28rem"
              priority={false}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" className="section-space wide-margin border-t border-rule">
        <p className="font-caps text-[18px] text-muted">Monthly plans</p>
        <h2 className="font-display mt-4 text-4xl sm:text-5xl">Published pricing</h2>
        <p className="mt-4 max-w-2xl text-paper-dim">
          Every plan includes the core production stack below. The Business plan
          is the default recommendation for most companies.
        </p>

        <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANY_SHOW_CORE.map((item) => (
            <li
              key={item}
              className="border border-rule bg-charcoal px-4 py-3 text-paper-dim"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {COMPANY_SHOW_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col border p-6 ${
                plan.featured
                  ? "border-cyan bg-ink shadow-[0_0_24px_rgba(46,230,255,0.18)]"
                  : "border-rule bg-graphite/50"
              }`}
            >
              {plan.featured && (
                <p className="font-caps text-[18px] text-cyan">Recommended</p>
              )}
              <h3 className="font-display mt-2 text-3xl">{plan.name}</h3>
              <p className="mt-4 font-display text-4xl text-glow-cyan">
                ${plan.monthlyPrice}
                <span className="font-caps ml-2 text-[18px] text-muted">/mo</span>
              </p>
              <p className="mt-3 text-paper-dim">{plan.summary}</p>
              <ul className="mt-6 flex-1 space-y-2 text-paper-dim">
                <li>{plan.episodes} episode{plan.episodes === 1 ? "" : "s"} / month</li>
                <li>{plan.clips} short clips</li>
                <li>{plan.thumbnails} thumbnail{plan.thumbnails === 1 ? "" : "s"}</li>
                <li>
                  {plan.guestCoordination
                    ? "Guest coordination included"
                    : "Guest coordination optional"}
                </li>
                {plan.blogArticles > 0 && (
                  <li>{plan.blogArticles} blog / article conversions</li>
                )}
                {plan.socialCopy && <li>Social copy</li>}
                {plan.analytics && <li>Monthly analytics</li>}
              </ul>
              <a
                href={`#inquire`}
                className={`btn mt-8 no-underline ${plan.featured ? "btn-solid" : ""}`}
                onClick={() => {
                  const el = document.getElementById("plan-field") as HTMLSelectElement | null;
                  if (el) el.value = plan.id;
                }}
              >
                Inquire · {plan.name}
              </a>
            </article>
          ))}
        </div>

        <div
          id="pilot"
          className="mt-12 grid gap-8 border border-rule bg-charcoal p-6 lg:grid-cols-2 lg:p-10"
        >
          <div>
            <p className="font-caps text-[18px] text-magenta">Try before retain</p>
            <h3 className="font-display mt-3 text-3xl">{COMPANY_SHOW.pilot.name}</h3>
            <p className="mt-4 font-display text-4xl">${COMPANY_SHOW.pilot.price}</p>
            <p className="mt-3 text-paper-dim">{COMPANY_SHOW.pilot.note}</p>
          </div>
          <ul className="space-y-2 text-paper-dim">
            {COMPANY_SHOW.pilot.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <p className="font-caps text-[18px] text-muted">Optional add-ons</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COMPANY_SHOW_ADDONS.map((a) => (
              <div key={a.name} className="border border-rule px-4 py-3">
                <p className="text-paper">{a.name}</p>
                <p className="font-caps mt-1 text-[18px] text-cyan">
                  from ${a.from}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founding + inquire */}
      <section id="inquire" className="section-space border-t border-rule bg-graphite">
        <div className="wide-margin grid gap-12 lg:grid-cols-2">
          <div>
            <p className="font-caps text-[18px] text-cyan">Soft launch</p>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">
              {COMPANY_SHOW.founding.name}
            </h2>
            <p className="mt-6 text-lg text-paper-dim">
              ${COMPANY_SHOW.founding.monthlyPrice}/month for{" "}
              {COMPANY_SHOW.founding.months} months — then we learn production
              hours, clip usage, and which industries close fastest. Limited to{" "}
              {COMPANY_SHOW.founding.spots} Northeast Florida companies.
            </p>
            <p className="mt-4 text-paper-dim">{COMPANY_SHOW.founding.note}</p>
            <p className="mt-8 text-paper-dim">
              Prefer to talk first? Call{" "}
              <a href={`tel:${STUDIO.phoneTel}`}>{STUDIO.phone}</a> or email{" "}
              <a href={`mailto:${STUDIO.email}`}>{STUDIO.email}</a>.
            </p>
            <p className="mt-6">
              <Link href="/lineup#podcast" className="font-caps text-[18px] text-muted">
                Prefer à la carte podcast studio time →
              </Link>
            </p>
          </div>
          <CompanyShowInquiryForm />
        </div>
      </section>
    </div>
  );
}

function CompanyShowInquiryForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    const fd = new FormData(e.currentTarget);
    const plan = String(fd.get("plan") || "founding");
    const format = String(fd.get("format") || "");
    const company = String(fd.get("company") || "");
    const message = String(fd.get("message") || "");
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fd.get("email"),
          phone: fd.get("phone"),
          stage: `company-show:${plan}:${format}:${company}:${message.slice(0, 140)}`,
        }),
      });
      setStatus(
        "Got it — we’ll follow up about The Company Show soft launch from jaxcitystudios@gmail.com.",
      );
      e.currentTarget.reset();
    } catch {
      setStatus("Could not send — try calling or emailing the studio directly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-rule bg-ink/50 p-6">
      <p className="font-caps text-[18px] text-muted">Inquire</p>
      <input className="input" name="name" placeholder="Name" required />
      <input className="input" name="company" placeholder="Company" required />
      <input
        className="input"
        name="email"
        type="email"
        placeholder="Email"
        required
      />
      <input className="input" name="phone" type="tel" placeholder="Phone" required />
      <label className="block">
        <span className="font-caps text-[18px] text-muted">Interest</span>
        <select id="plan-field" name="plan" className="input mt-2" defaultValue="founding">
          <option value="founding">
            Founding program · ${COMPANY_SHOW.founding.monthlyPrice}/mo
          </option>
          <option value="pilot">Pilot · ${COMPANY_SHOW.pilot.price}</option>
          {(
            COMPANY_SHOW_PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · ${p.monthlyPrice}/mo
              </option>
            ))
          )}
        </select>
      </label>
      <label className="block">
        <span className="font-caps text-[18px] text-muted">Format</span>
        <select name="format" className="input mt-2" defaultValue="authority">
          {SHOW_FORMATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
      <textarea
        className="textarea min-h-28"
        name="message"
        placeholder="Industry, goals, timeline…"
        required
      />
      <button type="submit" className="btn btn-solid" disabled={busy}>
        {busy ? "Sending…" : "Request soft-launch details"}
      </button>
      {status && <p className="text-paper-dim">{status}</p>}
    </form>
  );
}
