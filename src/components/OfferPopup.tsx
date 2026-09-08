"use client";

import { FormEvent, useEffect, useState } from "react";
import { INTRO_PROMO, STUDIO } from "@/lib/rates";

type Step = "closed" | "email" | "phone" | "done";

export function OfferPopup() {
  const [step, setStep] = useState<Step>("closed");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("jaxcity-offer-seen")) return;
    const t = window.setTimeout(() => setStep("email"), 1000);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    sessionStorage.setItem("jaxcity-offer-seen", "1");
    setStep("closed");
  }

  async function submitLead(payload: {
    email?: string;
    phone?: string;
    stage: string;
  }) {
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      /* local capture still proceeds */
    }
  }

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Drop a real email — we’ll send the code, not a newsletter novel.");
      return;
    }
    setError("");
    await submitLead({ email, stage: "intro-2hrs-80" });
    setStep("phone");
  }

  async function onPhone(e: FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Need a real number for the tour follow-up.");
      return;
    }
    setError("");
    await submitLead({ email, phone, stage: "intro-plus-tour" });
    sessionStorage.setItem("jaxcity-offer-seen", "1");
    setStep("done");
  }

  if (step === "closed") return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-title"
        className="w-full max-w-md border border-rule bg-charcoal p-6 shadow-none sm:p-8"
      >
        {step === "email" && (
          <>
            <p className="font-caps text-[0.68rem] text-accent">Today’s move</p>
            <h2 id="offer-title" className="font-display mt-3 text-3xl">
              {INTRO_PROMO.label}
            </h2>
            <p className="mt-3 text-paper-dim">
              First session. Two engineered hours. Eighty bucks. Not a forever
              rate — just the door kick for people who actually show up.
            </p>
            <p className="mt-2 text-sm text-muted">
              Email unlocks the intro. Gen Z energy, Millennial follow-through.
            </p>
            <form onSubmit={onEmail} className="mt-6 space-y-3">
              <input
                className="input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-sm text-accent">{error}</p>}
              <button type="submit" className="btn btn-accent w-full">
                Lock the {INTRO_PROMO.label}
              </button>
            </form>
            <button
              type="button"
              className="mt-4 font-caps text-[0.65rem] text-muted"
              onClick={dismiss}
            >
              Not now
            </button>
          </>
        )}

        {step === "phone" && (
          <>
            <p className="font-caps text-[0.68rem] text-accent">One more beat</p>
            <h2 id="offer-title" className="font-display mt-3 text-3xl">
              Stack a little more
            </h2>
            <p className="mt-3 text-paper-dim">
              Drop your number for an extra slice off that first session plus a
              free room tour. We’ll text like humans — {STUDIO.phone} energy.
            </p>
            <form onSubmit={onPhone} className="mt-6 space-y-3">
              <input
                className="input"
                type="tel"
                placeholder="904-555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {error && <p className="text-sm text-accent">{error}</p>}
              <button type="submit" className="btn btn-accent w-full">
                Yes — tour + extra off
              </button>
            </form>
            <button
              type="button"
              className="mt-4 font-caps text-[0.65rem] text-muted"
              onClick={() => {
                sessionStorage.setItem("jaxcity-offer-seen", "1");
                setStep("done");
              }}
            >
              Keep just the email offer
            </button>
          </>
        )}

        {step === "done" && (
          <>
            <h2 id="offer-title" className="font-display text-3xl">
              You’re in.
            </h2>
            <p className="mt-3 text-paper-dim">
              Watch {email || "your inbox"} for the first-session code:{" "}
              {INTRO_PROMO.label}. Text {STUDIO.phone} or DM {STUDIO.instagram}{" "}
              when you’re ready to lock a date — 50% deposit holds it.
            </p>
            <button type="button" className="btn btn-solid mt-6" onClick={dismiss}>
              Back to the site
            </button>
          </>
        )}
      </div>
    </div>
  );
}
