"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useBooking } from "@/components/booking/BookingProvider";
import { RoomName } from "@/components/RoomName";
import { PayPalDepositButtons } from "@/components/booking/PayPalDepositButtons";
import { DateCalendarPicker } from "@/components/booking/DateCalendarPicker";
import {
  COMPANY_SHOW,
  COMPANY_SHOW_CORE,
  COMPANY_SHOW_PLANS,
} from "@/data/company-show";
import {
  BOOKING_SERVICE_CARDS,
  COMPANY_SHOW_SESSION_HOURS,
  PODCAST_DIY_DISCLAIMER,
  podcastOfferLabel,
  podcastOfferPrice,
  podcastOfferShortLabel,
  type BookingService,
  type PodcastOfferId,
} from "@/lib/booking-service";
import {
  ADDONS,
  DEPOSIT,
  ENGINEERED,
  INTRO_PROMO,
  PACKAGES,
  ROOMS,
  STUDIO,
  balanceOnArrival,
  bookingStudioTotal,
  depositAmount,
  type RateMode,
  type RoomId,
} from "@/lib/rates";
import { PUBLIC_PAYMENTS } from "@/lib/payments-public";
import {
  addHoursToTime,
  formatClock12,
  formatTimeRange12,
} from "@/lib/time";
import { BookingAgreementStep } from "@/components/booking/BookingAgreementStep";
import type { AgreementFill } from "@/lib/rental-agreement";

type Step =
  | "service"
  | "date-room"
  | "podcast-offer"
  | "package"
  | "times"
  | "contact"
  | "addon"
  | "checkout"
  | "agreement"
  | "done";

const DURATION_OPTIONS = [2, 3, 4, 6, 8];

export function BookingModal() {
  const {
    open,
    closeBooking,
    initialRoomId,
    initialPackageId,
    planner,
    presentation,
  } = useBooking();
  const isApp = presentation === "standalone";
  const scrollRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<BookingService | null>(null);
  const [podcastOffer, setPodcastOffer] = useState<PodcastOfferId | null>(
    null,
  );
  const [date, setDate] = useState("");
  const [roomId, setRoomId] = useState<RoomId>("venus");
  const [rateMode, setRateMode] = useState<RateMode>("engineered");
  const [packageId, setPackageId] = useState("session");
  const [durationHours, setDurationHours] = useState<number>(
    ENGINEERED.minimumHours,
  );
  const [start, setStart] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clientType, setClientType] = useState<"first-time" | "returning">(
    "first-time",
  );
  const [eligibility, setEligibility] = useState<{
    canUseFirstTime: boolean;
    canUseIntroPromo: boolean;
    reason: string | null;
  } | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [addonIndex, setAddonIndex] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneMsg, setDoneMsg] = useState("");
  const [availableStarts, setAvailableStarts] = useState<string[]>([]);
  const [bookedBlocks, setBookedBlocks] = useState<
    { start: string; end: string; status: string }[]
  >([]);
  const [studioOpen, setStudioOpen] = useState("10:00");
  const [studioClose, setStudioClose] = useState("02:00");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [payMethod, setPayMethod] = useState<"paypal" | "zelle">("paypal");
  const [bookingId, setBookingId] = useState("");
  const [agreementId, setAgreementId] = useState("");
  const [agreementCode, setAgreementCode] = useState("");
  const [agreementFill, setAgreementFill] = useState<AgreementFill | null>(
    null,
  );
  const [agreementSigned, setAgreementSigned] = useState(false);
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  useEffect(() => {
    if (!open) return;
    setStep("service");
    setService(null);
    setPodcastOffer(null);
    setAddonIndex(0);
    setSelectedAddons([]);
    setError("");
    setDoneMsg("");
    setStart("");
    setAvailableStarts([]);
    setBookedBlocks([]);
    setBookingId("");
    setAgreementId("");
    setAgreementCode("");
    setAgreementFill(null);
    setAgreementSigned(false);
    setPayMethod("paypal");
    setEligibility(null);
    setEligibilityLoading(false);
    setRateMode("engineered");
    setDate("");
    if (initialRoomId) setRoomId(initialRoomId);
    if (planner?.roomId) setRoomId(planner.roomId);
    if (isApp) {
      setPackageId("session");
    } else if (initialPackageId) {
      setPackageId(initialPackageId);
    }
    if (planner?.clientType) setClientType(planner.clientType);
    if (planner?.bookedHours) {
      setDurationHours(
        Math.max(ENGINEERED.minimumHours, planner.bookedHours),
      );
    } else {
      setDurationHours(ENGINEERED.minimumHours);
    }
  }, [open, initialRoomId, initialPackageId, planner, isApp]);

  const isPodcast = service === "podcast";
  const isMusic = service === "music";
  const podcastIsDiy = isPodcast && podcastOffer === "diy";
  const podcastIsCompanyShow =
    isPodcast && podcastOffer != null && podcastOffer !== "diy";

  /** Music room-only / app / all podcast paths skip sample packages & add-ons. */
  const skipPackagesAndAddons =
    isApp || rateMode === "room-only" || isPodcast;

  const flowSteps = useMemo((): Step[] => {
    if (!service) return ["service"];
    if (service === "podcast") {
      return [
        "service",
        "date-room",
        "podcast-offer",
        "times",
        "contact",
        "checkout",
      ];
    }
    if (isApp || rateMode === "room-only") {
      return ["service", "date-room", "times", "contact", "checkout"];
    }
    return [
      "service",
      "date-room",
      "package",
      "times",
      "contact",
      "addon",
      "checkout",
    ];
  }, [service, isApp, rateMode]);

  function stepEyebrow(current: Step): string {
    const idx = flowSteps.indexOf(current);
    if (idx < 0) return "Step";
    return `Step ${idx + 1}`;
  }

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [step, open, addonIndex]);

  useEffect(() => {
    if (!open || !date || !roomId) return;
    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError("");
    fetch(
      `/api/availability?room=${roomId}&date=${date}&hours=${durationHours}`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load availability");
        if (cancelled) return;
        setAvailableStarts(data.availableStarts || []);
        setBookedBlocks(data.bookedBlocks || []);
        setStudioOpen(data.hours?.openTime || "10:00");
        setStudioClose(data.hours?.closeTime || "02:00");
        setStart((prev) =>
          data.availableStarts?.includes(prev)
            ? prev
            : data.availableStarts?.[0] || "",
        );
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setAvailableStarts([]);
        setAvailabilityError(err.message);
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, date, roomId, durationHours]);

  const refreshEligibility = useCallback(async (nextEmail: string, nextPhone: string) => {
    if (!nextEmail.includes("@") && nextPhone.replace(/\D/g, "").length < 10) {
      setEligibility(null);
      return null;
    }
    setEligibilityLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextEmail.includes("@")) params.set("email", nextEmail.trim());
      if (nextPhone.replace(/\D/g, "").length >= 10) {
        params.set("phone", nextPhone.trim());
      }
      const res = await fetch(`/api/client-eligibility?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not check eligibility");
      const next = {
        canUseFirstTime: Boolean(data.canUseFirstTime),
        canUseIntroPromo: Boolean(data.canUseIntroPromo),
        reason: (data.reason as string | null) || null,
      };
      setEligibility(next);
      if (!next.canUseFirstTime) setClientType("returning");
      return next;
    } catch {
      setEligibility(null);
      return null;
    } finally {
      setEligibilityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || step !== "contact") return;
    if (!email.includes("@") && phone.replace(/\D/g, "").length < 10) return;
    const t = window.setTimeout(() => {
      void refreshEligibility(email, phone);
    }, 400);
    return () => window.clearTimeout(t);
  }, [open, step, email, phone, refreshEligibility]);

  const end = start ? addHoursToTime(start, durationHours) : "";
  const hours = durationHours;
  const selectedRoom = ROOMS.find((r) => r.id === roomId) ?? ROOMS[0];

  const applyIntroPromo =
    isMusic &&
    rateMode === "engineered" &&
    packageId === "session" &&
    clientType === "first-time" &&
    hours === INTRO_PROMO.hours &&
    (eligibility?.canUseIntroPromo ?? true);

  const studioSubtotal = useMemo(() => {
    if (!service) return 0;
    if (service === "podcast") {
      if (!podcastOffer) return 0;
      return podcastOfferPrice(podcastOffer, roomId, hours);
    }
    return bookingStudioTotal({
      rateMode,
      roomId,
      hours,
      clientType,
      applyIntroPromo,
      packageId,
    });
  }, [
    service,
    podcastOffer,
    rateMode,
    roomId,
    hours,
    clientType,
    applyIntroPromo,
    packageId,
  ]);

  const addonTotal =
    !isMusic || rateMode === "room-only"
      ? 0
      : selectedAddons.reduce((sum, id) => {
          const a = ADDONS.find((x) => x.id === id);
          return sum + (a?.packagePrice ?? 0);
        }, 0);

  const total = studioSubtotal + addonTotal;
  const deposit = depositAmount(total);
  const balance = balanceOnArrival(total);
  const showPricing = Boolean(
    service && (service === "music" || podcastOffer),
  );

  const rateLabel = !service
    ? "Choose music or podcast"
    : service === "podcast"
      ? podcastOffer
        ? podcastOfferLabel(podcastOffer)
        : "Pick a podcast offer"
      : rateMode === "room-only"
        ? `$${selectedRoom.hourly}/hr room-only · ${selectedRoom.name}`
        : packageId === "session"
          ? applyIntroPromo
            ? `${INTRO_PROMO.label} intro (first session)`
            : clientType === "first-time"
              ? `$${ENGINEERED.firstTimeHourly}/hr first-time engineered`
              : `$${ENGINEERED.returningHourly}/hr returning engineered`
          : packageId === "series"
            ? "The Series (sample package total)"
            : "The Studio Partner (sample monthly total)";

  function chooseService(next: BookingService) {
    setService(next);
    setPodcastOffer(null);
    setError("");
    if (next === "music") {
      setRateMode("engineered");
      setPackageId("session");
      setDurationHours(ENGINEERED.minimumHours);
    } else {
      setRateMode("room-only");
      setPackageId("session");
      setSelectedAddons([]);
      setDurationHours(COMPANY_SHOW_SESSION_HOURS);
    }
    setStep("date-room");
  }

  function choosePodcastOffer(offer: PodcastOfferId) {
    setPodcastOffer(offer);
    setError("");
    if (offer === "diy") {
      setRateMode("room-only");
      setDurationHours((h) => Math.max(ENGINEERED.minimumHours, h));
    } else {
      setRateMode("engineered");
      setDurationHours(COMPANY_SHOW_SESSION_HOURS);
    }
  }

  function nextFrom(current: Step) {
    if (current === "addon") {
      if (addonIndex < ADDONS.length - 1) {
        setAddonIndex((i) => i + 1);
        return;
      }
      void openAgreementStep();
      return;
    }
    if (skipPackagesAndAddons && current === "contact") {
      void openAgreementStep();
      return;
    }
    const idx = flowSteps.indexOf(current);
    if (idx >= 0 && idx < flowSteps.length - 1) setStep(flowSteps[idx + 1]);
  }

  function backFrom(current: Step) {
    if (current === "addon" && addonIndex > 0) {
      setAddonIndex((i) => i - 1);
      return;
    }
    if (current === "checkout") {
      setStep("agreement");
      return;
    }
    if (current === "agreement") {
      if (skipPackagesAndAddons) {
        setStep("contact");
        return;
      }
      setStep("addon");
      setAddonIndex(ADDONS.length - 1);
      return;
    }
    if (current === "addon") {
      setStep("contact");
      return;
    }
    if (current === "date-room") {
      setService(null);
      setPodcastOffer(null);
      setStep("service");
      return;
    }
    const idx = flowSteps.indexOf(current);
    if (idx > 0) setStep(flowSteps[idx - 1]);
  }

  async function linkAgreementToBooking(nextBookingId: string) {
    if (!agreementId || !agreementCode) return;
    try {
      await fetch(`/api/agreements/${agreementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: agreementCode,
          bookingId: nextBookingId,
        }),
      });
    } catch {
      // Non-blocking — payment still succeeded.
    }
  }

  const createPayPalCheckout = useCallback(async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        roomId,
        packageId,
        rateMode: podcastIsDiy
          ? "room-only"
          : podcastIsCompanyShow
            ? "engineered"
            : rateMode,
        service,
        podcastOffer,
        start,
        end,
        hours,
        name,
        email,
        phone,
        clientType,
        selectedAddons:
          !isMusic || rateMode === "room-only" ? [] : selectedAddons,
        total,
        deposit,
        balance,
        planner,
        paymentMethod: "paypal",
        applyIntroPromo,
        promoId: applyIntroPromo ? INTRO_PROMO.id : null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Could not start PayPal checkout");
    }
    if (!data.orderId) {
      throw new Error(data.error || "PayPal order missing");
    }
    setBookingId(data.bookingId || "");
    return {
      orderId: data.orderId as string,
      bookingId: data.bookingId as string,
    };
  }, [
    date,
    roomId,
    packageId,
    rateMode,
    service,
    podcastOffer,
    podcastIsDiy,
    podcastIsCompanyShow,
    isMusic,
    start,
    end,
    hours,
    name,
    email,
    phone,
    clientType,
    selectedAddons,
    total,
    deposit,
    balance,
    planner,
    applyIntroPromo,
  ]);

  const onPayPalApproved = useCallback(
    async (info: { orderId: string; bookingId: string }) => {
      setBusy(true);
      setError("");
      try {
        const res = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(info),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not capture PayPal payment");
          return;
        }
        const id = (data.bookingId || info.bookingId) as string;
        setBookingId(id);
        await linkAgreementToBooking(id);
        setDoneMsg(
          `Deposit received via PayPal/Venmo. Booking ${id} is confirmed. Remaining balance $${balance} due on arrival.`,
        );
        setStep("done");
      } catch {
        setError("Network error capturing PayPal payment.");
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [balance, agreementId, agreementCode],
  );

  async function openAgreementStep() {
    setBusy(true);
    setError("");
    try {
      // Reuse an already-prepared draft if the renter went back and forward.
      if (agreementId && agreementFill && agreementCode) {
        const res = await fetch(`/api/agreements/${agreementId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: agreementCode,
            renterName: name,
            renterEmail: email,
            renterPhone: phone,
            roomId,
            sessionDate: date,
            startTime: start,
            endTime: end,
            durationHours: hours,
            total,
            deposit,
            clearSignatures: true,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not refresh agreement");
        setAgreementFill(data.agreement.fill);
        setAgreementCode(data.agreement.accessCode);
        setAgreementSigned(false);
        setStep("agreement");
        return;
      }

      const res = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renterName: name,
          renterEmail: email,
          renterPhone: phone,
          roomId,
          sessionDate: date,
          startTime: start,
          endTime: end,
          durationHours: hours,
          total,
          deposit,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not prepare rental agreement");
      }
      setAgreementId(data.agreement.id);
      setAgreementCode(data.agreement.accessCode);
      setAgreementFill(data.agreement.fill);
      setAgreementSigned(false);
      setStep("agreement");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not prepare rental agreement",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitZelleHold() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          roomId,
          packageId,
          rateMode: podcastIsDiy
            ? "room-only"
            : podcastIsCompanyShow
              ? "engineered"
              : rateMode,
          service,
          podcastOffer,
          start,
          end,
          hours,
          name,
          email,
          phone,
          clientType,
          selectedAddons:
            !isMusic || rateMode === "room-only" ? [] : selectedAddons,
          total,
          deposit,
          balance,
          planner,
          paymentMethod: "zelle",
          applyIntroPromo,
          promoId: applyIntroPromo ? INTRO_PROMO.id : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not hold this slot for Zelle.");
        return;
      }
      const id = (data.bookingId || "") as string;
      setBookingId(id);
      await linkAgreementToBooking(id);
      setDoneMsg(
        `Slot held pending Zelle. Send $${deposit} to ${PUBLIC_PAYMENTS.zelleDestination} (name: ${PUBLIC_PAYMENTS.zelleName}). Include your name and ${date} ${formatClock12(start)} in the memo. Remaining $${balance} due on arrival. Ref: ${id}`,
      );
      setStep("done");
    } catch {
      setError("Network error starting Zelle hold.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const currentAddon = ADDONS[addonIndex];

  return (
    <div
      className={
        isApp
          ? "fixed inset-0 z-40 flex items-stretch justify-center bg-ink p-0"
          : "no-print fixed inset-0 z-[60] flex items-stretch justify-center bg-ink/80 p-0 sm:items-center sm:p-6"
      }
    >
      <div
        className={
          isApp
            ? "relative flex h-[100dvh] w-full max-w-xl flex-col bg-charcoal pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
            : "relative flex h-full w-full max-w-xl flex-col border border-rule bg-charcoal sm:h-[min(44rem,92vh)]"
        }
      >
        {isApp ? (
          <div className="flex items-center justify-between border-b border-rule px-4 py-3">
            <div>
              <p className="font-caps text-[18px] tracking-[0.16em] text-accent">
                JaxCity Book
              </p>
              <p className="font-display text-lg leading-none">{STUDIO.name}</p>
            </div>
            <Link
              href="/"
              className="font-caps text-[18px] tracking-[0.14em] text-muted no-underline"
            >
              Full site
            </Link>
          </div>
        ) : (
          <button
            type="button"
            className="absolute right-4 top-4 z-10 font-caps text-[18px] text-muted"
            onClick={closeBooking}
          >
            Close
          </button>
        )}

        <div
          ref={scrollRef}
          className={`modal-scroll flex-1 px-6 sm:px-8 ${
            isApp ? "pb-32 pt-6" : "pb-28 pt-10"
          }`}
        >
          {step === "service" && (
            <div>
              <p className="font-caps text-[18px] text-muted">Step 1</p>
              <h2 className="font-display mt-3 text-4xl sm:text-5xl">
                What are you booking?
              </h2>
              <p className="mt-3 max-w-xl text-paper-dim">
                Pick a path first. Pricing for that path only shows after you
                choose.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    BOOKING_SERVICE_CARDS.music,
                    BOOKING_SERVICE_CARDS.podcast,
                  ] as const
                ).map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className="group relative aspect-[4/5] overflow-hidden border border-rule text-left transition-[border-color,box-shadow] hover:border-paper focus-visible:border-cyan sm:aspect-[3/4]"
                    onClick={() => chooseService(card.id)}
                  >
                    <Image
                      src={card.image}
                      alt={card.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, 40vw"
                      priority
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
                    <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <span className="font-display block text-[1.75rem] leading-[0.95] tracking-tight text-paper sm:text-[2rem] lg:text-[2.35rem]">
                        {card.titleLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </span>
                      <span className="mt-2 block text-sm leading-snug text-paper-dim sm:text-base">
                        {card.blurb}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "date-room" && service && (
            <StepShell
              eyebrow={stepEyebrow("date-room")}
              title="Date and room"
              onBack={() => backFrom("date-room")}
              onNext={() => {
                if (!date) {
                  setError("Pick a date.");
                  return;
                }
                setError("");
                nextFrom("date-room");
              }}
              error={error}
            >
              <p className="mb-4 font-caps text-[18px] tracking-[0.12em] text-cyan">
                {isMusic ? "Music recording" : "Podcast"} path
              </p>
              <DateCalendarPicker
                value={date}
                onChange={setDate}
                roomId={roomId}
                durationHours={durationHours}
                autoOpen
              />

              {isMusic && (
                <>
                  <div className="mt-6">
                    <span className="font-caps text-[18px] text-muted">
                      How you&apos;re booking
                    </span>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        className={`border px-4 py-3 text-left ${
                          rateMode === "engineered"
                            ? "border-cyan bg-graphite text-cyan"
                            : "border-rule hover:border-paper-dim"
                        }`}
                        onClick={() => setRateMode("engineered")}
                      >
                        <span className="font-caps text-[18px] tracking-[0.1em]">
                          Engineered
                        </span>
                        <span className="mt-1 block text-sm text-muted">
                          JaxCity engineer · room included · $
                          {ENGINEERED.firstTimeHourly}/$
                          {ENGINEERED.returningHourly}/hr
                        </span>
                      </button>
                      <button
                        type="button"
                        className={`border px-4 py-3 text-left ${
                          rateMode === "room-only"
                            ? "border-magenta bg-graphite text-magenta"
                            : "border-rule hover:border-paper-dim"
                        }`}
                        onClick={() => {
                          setRateMode("room-only");
                          setPackageId("session");
                          setSelectedAddons([]);
                        }}
                      >
                        <span className="font-caps text-[18px] tracking-[0.1em]">
                          Room-only
                        </span>
                        <span className="mt-1 block text-sm text-muted">
                          Bring your own engineer · priced by planet hourly
                        </span>
                      </button>
                    </div>
                  </div>

                  <label className="mt-6 block">
                    <span className="font-caps text-[18px] text-muted">
                      Session length
                    </span>
                    <select
                      className="select mt-2"
                      value={durationHours}
                      onChange={(e) =>
                        setDurationHours(Number(e.target.value))
                      }
                    >
                      {DURATION_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {h} hours
                          {h === ENGINEERED.minimumHours ? " (minimum)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              {isPodcast && (
                <p className="mt-6 border border-rule bg-graphite p-4 text-sm text-paper-dim">
                  Next you&apos;ll choose The Company Show (host + production)
                  or DIY room rental. Room pick here locks the calendar room —
                  no podcast pricing until the next step.
                </p>
              )}

              <div className="mt-6 grid gap-2">
                {ROOMS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`border px-4 py-3 text-left transition-colors ${
                      roomId === r.id
                        ? "border-paper bg-graphite"
                        : "border-rule hover:border-paper-dim"
                    }`}
                    style={
                      roomId === r.id
                        ? {
                            borderColor: r.color,
                            boxShadow: `0 0 14px ${r.color}55`,
                          }
                        : undefined
                    }
                    onClick={() => setRoomId(r.id)}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <RoomName roomId={r.id} size="md" className="text-xl" />
                      {isMusic && (
                        <span className="font-caps text-[18px] text-paper">
                          {rateMode === "room-only"
                            ? `$${r.hourly * durationHours}`
                            : applyIntroPromo
                              ? `$${INTRO_PROMO.price}`
                              : `$${
                                  durationHours *
                                  (clientType === "first-time"
                                    ? ENGINEERED.firstTimeHourly
                                    : ENGINEERED.returningHourly)
                                }`}
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block text-sm text-muted">
                      {isMusic
                        ? rateMode === "room-only"
                          ? `Room-only $${r.hourly}/hr × ${durationHours}h`
                          : `Engineered includes room · $${r.hourly}/hr if room-only`
                        : `${r.fit}`}
                    </span>
                  </button>
                ))}
              </div>
              {planner && isMusic && (
                <p className="mt-4 border border-rule bg-graphite p-3 text-sm text-paper-dim">
                  Planner attached: {planner.bookedHours}h studio · $
                  {planner.studioCost} engineered estimate
                  {planner.title ? ` · ${planner.title}` : ""}.
                </p>
              )}
            </StepShell>
          )}

          {step === "podcast-offer" && isPodcast && (
            <StepShell
              eyebrow={stepEyebrow("podcast-offer")}
              title="Podcast offer"
              onBack={() => backFrom("podcast-offer")}
              onNext={() => {
                if (!podcastOffer) {
                  setError("Pick a Company Show plan or DIY room rental.");
                  return;
                }
                setError("");
                nextFrom("podcast-offer");
              }}
              error={error}
            >
              <p className="text-paper-dim">
                Soft-launch pricing from {COMPANY_SHOW.name}. Or rent the room
                alone — without host or engineer.
              </p>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  className={`w-full border px-4 py-4 text-left ${
                    podcastOffer === "pilot"
                      ? "border-cyan bg-graphite"
                      : "border-rule"
                  }`}
                  onClick={() => choosePodcastOffer("pilot")}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-2xl">
                      {COMPANY_SHOW.pilot.name}
                    </span>
                    <span className="font-caps text-[18px] text-paper">
                      ${COMPANY_SHOW.pilot.price}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-paper-dim">
                    {COMPANY_SHOW.pilot.note}
                  </p>
                </button>

                <button
                  type="button"
                  className={`w-full border px-4 py-4 text-left ${
                    podcastOffer === "founding"
                      ? "border-cyan bg-graphite"
                      : "border-rule"
                  }`}
                  onClick={() => choosePodcastOffer("founding")}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-2xl">
                      {COMPANY_SHOW.founding.name}
                    </span>
                    <span className="font-caps text-[18px] text-paper">
                      ${COMPANY_SHOW.founding.monthlyPrice}/mo
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-paper-dim">
                    {COMPANY_SHOW.founding.months} months ·{" "}
                    {COMPANY_SHOW.founding.spots} founding spots · normally $
                    {COMPANY_SHOW.founding.normalMonthlyPrice}/mo
                  </p>
                </button>

                {COMPANY_SHOW_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className={`w-full border px-4 py-4 text-left ${
                      podcastOffer === plan.id
                        ? "border-cyan bg-graphite"
                        : "border-rule"
                    }`}
                    onClick={() => choosePodcastOffer(plan.id)}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-2xl">{plan.name}</span>
                      <span className="font-caps text-[18px] text-paper">
                        ${plan.monthlyPrice}/mo
                      </span>
                    </div>
                    {plan.featured && (
                      <span className="mt-2 inline-block font-caps text-[18px] text-accent">
                        Recommended
                      </span>
                    )}
                    <p className="mt-2 text-sm text-paper-dim">{plan.summary}</p>
                    <p className="mt-2 text-sm text-muted">
                      {plan.episodes} episode{plan.episodes === 1 ? "" : "s"} ·{" "}
                      {plan.clips} clips · includes host, studio, edit & publish
                    </p>
                  </button>
                ))}
              </div>

              <p className="mt-4 text-sm text-muted">
                Every Company Show plan includes:{" "}
                {COMPANY_SHOW_CORE.slice(0, 4).join(" · ")}…
              </p>

              <div className="mt-8 border-t border-rule pt-6">
                <p className="font-caps text-[18px] text-magenta">
                  DIY room rental
                </p>
                <p className="mt-3 border border-magenta/50 bg-graphite p-4 text-sm text-paper-dim">
                  {PODCAST_DIY_DISCLAIMER}
                </p>
                <button
                  type="button"
                  className={`mt-3 w-full border px-4 py-4 text-left ${
                    podcastOffer === "diy"
                      ? "border-magenta bg-graphite"
                      : "border-rule"
                  }`}
                  onClick={() => choosePodcastOffer("diy")}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-2xl">
                      Room + equipment only
                    </span>
                    <span className="font-caps text-[18px] text-paper">
                      ${selectedRoom.hourly}/hr
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-paper-dim">
                    {selectedRoom.name}: ${selectedRoom.hourly}/hr ×{" "}
                    {durationHours}h = $
                    {selectedRoom.hourly * durationHours} (adjust hours on the
                    next step). No host. No engineer. No editing.
                  </p>
                </button>
                {podcastOffer === "diy" && (
                  <div className="mt-3 grid gap-2">
                    {ROOMS.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={`border px-3 py-2 text-left text-sm ${
                          roomId === r.id
                            ? "border-magenta bg-graphite"
                            : "border-rule"
                        }`}
                        onClick={() => setRoomId(r.id)}
                      >
                        <RoomName roomId={r.id} size="sm" className="text-base" />
                        <span className="mt-0.5 block text-muted">
                          ${r.hourly}/hr · ${r.hourly * durationHours} for{" "}
                          {durationHours}h · room & gear only
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </StepShell>
          )}

          {step === "package" && !skipPackagesAndAddons && isMusic && (
            <StepShell
              eyebrow={stepEyebrow("package")}
              title="Package"
              onBack={() => backFrom("package")}
              onNext={() => nextFrom("package")}
            >
              {(
                [
                  PACKAGES.session,
                  PACKAGES.series,
                  PACKAGES.partner,
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`mb-2 w-full border px-4 py-4 text-left ${
                    packageId === p.id
                      ? "border-paper bg-graphite"
                      : "border-rule"
                  }`}
                  onClick={() => {
                    setPackageId(p.id);
                    setRateMode("engineered");
                  }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-2xl">{p.name}</span>
                    {p.kind === "sample" && (
                      <span className="font-caps text-[18px] text-accent">
                        Sample pricing
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-paper-dim">{p.tagline}</p>
                </button>
              ))}
            </StepShell>
          )}

          {step === "times" && (
            <StepShell
              eyebrow={stepEyebrow("times")}
              title="Available times"
              onBack={() => backFrom("times")}
              onNext={() => {
                if (!start || !availableStarts.includes(start)) {
                  setError("Pick an available start time for this room and day.");
                  return;
                }
                setError("");
                nextFrom("times");
              }}
              error={error}
            >
              <label className="block">
                <span className="font-caps text-[18px] text-muted">
                  Session length
                </span>
                <select
                  className="select mt-2"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  disabled={podcastIsCompanyShow}
                >
                  {DURATION_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h} hours
                      {h === ENGINEERED.minimumHours ? " (minimum)" : ""}
                      {podcastIsCompanyShow && h === COMPANY_SHOW_SESSION_HOURS
                        ? " · Company Show block"
                        : ""}
                    </option>
                  ))}
                </select>
              </label>
              {podcastIsCompanyShow && (
                <p className="mt-2 text-sm text-muted">
                  Company Show sessions are booked as a{" "}
                  {COMPANY_SHOW_SESSION_HOURS}-hour studio block.
                </p>
              )}
              {podcastIsDiy && (
                <p className="mt-2 border border-magenta/40 bg-graphite p-3 text-sm text-paper-dim">
                  {PODCAST_DIY_DISCLAIMER}
                </p>
              )}

              <div className="mt-6">
                <span className="font-caps text-[18px] text-muted">Room</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ROOMS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`border px-3 py-2.5 text-left transition-colors ${
                        roomId === r.id
                          ? "border-paper bg-graphite"
                          : "border-rule hover:border-paper-dim"
                      }`}
                      style={
                        roomId === r.id
                          ? {
                              borderColor: r.color,
                              boxShadow: `0 0 12px ${r.color}55`,
                            }
                          : undefined
                      }
                      onClick={() => {
                        if (r.id === roomId) return;
                        setRoomId(r.id);
                        setStart("");
                        setError("");
                      }}
                    >
                      <RoomName roomId={r.id} size="sm" className="text-base" />
                      <span className="mt-0.5 block text-xs text-muted">
                        {isMusic
                          ? rateMode === "room-only"
                            ? `$${r.hourly}/hr · $${r.hourly * durationHours} total`
                            : "Engineered includes room"
                          : podcastIsDiy
                            ? `$${r.hourly}/hr DIY room only`
                            : "Company Show includes studio"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-sm text-muted">
                Studio hours {formatTimeRange12(studioOpen, studioClose)}. Open
                starts for{" "}
                <RoomName roomId={roomId} size="sm" className="text-sm" /> on{" "}
                {date} update when you switch rooms.
              </p>

              {availabilityLoading && (
                <p className="mt-4 text-paper-dim">Checking the calendar…</p>
              )}
              {availabilityError && (
                <p className="mt-4 text-sm text-accent">{availabilityError}</p>
              )}

              {!availabilityLoading && !availabilityError && (
                <>
                  {bookedBlocks.length > 0 && (
                    <div className="mt-4 border border-rule bg-graphite p-3 text-sm text-muted">
                      <p className="font-caps text-[18px] text-muted">
                        Already booked this day
                      </p>
                      <ul className="mt-2 space-y-1">
                        {bookedBlocks.map((b) => (
                          <li key={`${b.start}-${b.end}`}>
                            {formatTimeRange12(b.start, b.end)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {availableStarts.length === 0 ? (
                    <p className="mt-6 text-paper-dim">
                      No open {durationHours}-hour starts left in this room on{" "}
                      {date}. Try another day, room, or shorter session.
                    </p>
                  ) : (
                    <div className="mt-4 grid max-h-48 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                      {availableStarts.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`border px-2 py-3 font-caps text-[18px] ${
                            start === slot
                              ? "border-cyan bg-graphite text-cyan"
                              : "border-rule text-paper-dim hover:border-paper-dim"
                          }`}
                          onClick={() => setStart(slot)}
                        >
                          {formatClock12(slot)}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {start && end && showPricing && (
                <p className="mt-4 text-paper-dim">
                  Selected window: {formatTimeRange12(start, end)} ({hours}h).
                  Live total uses {rateLabel}: ${studioSubtotal}.
                </p>
              )}
              {isMusic && rateMode === "room-only" && start && (
                <p className="mt-2 text-sm text-muted">
                  Math: {hours} × ${selectedRoom.hourly} ({selectedRoom.name}{" "}
                  room-only) = ${studioSubtotal}. Bring your own engineer.
                </p>
              )}
              {isMusic &&
                rateMode === "engineered" &&
                packageId === "session" &&
                start && (
                  <p className="mt-2 text-sm text-muted">
                    {applyIntroPromo
                      ? `Intro math: ${INTRO_PROMO.hours} hours for $${INTRO_PROMO.price} (first session only). Room included.`
                      : `Math: ${hours} × $${
                          clientType === "first-time"
                            ? ENGINEERED.firstTimeHourly
                            : ENGINEERED.returningHourly
                        } = $${studioSubtotal}. Room included.`}
                  </p>
                )}
              {isMusic &&
                rateMode === "engineered" &&
                packageId !== "session" && (
                  <p className="mt-2 text-sm text-accent">
                    Package subtotal ${studioSubtotal} includes sample
                    components — see Pricing for the published vs sample split.
                  </p>
                )}
              {podcastIsDiy && start && (
                <p className="mt-2 text-sm text-muted">
                  DIY math: {hours} × ${selectedRoom.hourly} = ${studioSubtotal}
                  . Room and equipment only.
                </p>
              )}
              {podcastIsCompanyShow && podcastOffer && start && (
                <p className="mt-2 text-sm text-muted">
                  {podcastOfferShortLabel(podcastOffer)} deposit is 50% of $
                  {studioSubtotal} due now.
                </p>
              )}
            </StepShell>
          )}

          {step === "contact" && (
            <StepShell
              eyebrow={stepEyebrow("contact")}
              title="You"
              onBack={() => backFrom("contact")}
              onNext={async () => {
                if (!name || !email || !phone) {
                  setError("Name, email, and phone — all three.");
                  return;
                }
                if (isMusic && rateMode === "engineered") {
                  const check = await refreshEligibility(email, phone);
                  if (
                    check &&
                    !check.canUseFirstTime &&
                    clientType === "first-time"
                  ) {
                    setClientType("returning");
                    setError(
                      check.reason ||
                        "First-time rates already used for this contact — switched to returning.",
                    );
                    return;
                  }
                }
                setError("");
                nextFrom("contact");
              }}
              nextLabel={
                skipPackagesAndAddons
                  ? busy
                    ? "Preparing…"
                    : "Continue to agreement"
                  : "Continue"
              }
              error={error}
            >
              <div className="space-y-3">
                <input
                  className="input"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="input"
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {isMusic && rateMode === "engineered" && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      className={`border px-3 py-3 font-caps text-[18px] ${
                        clientType === "first-time"
                          ? "border-paper bg-graphite"
                          : "border-rule"
                      } ${
                        eligibility && !eligibility.canUseFirstTime
                          ? "cursor-not-allowed opacity-40"
                          : ""
                      }`}
                      disabled={Boolean(
                        eligibility && !eligibility.canUseFirstTime,
                      )}
                      onClick={() => setClientType("first-time")}
                    >
                      First-time · ${ENGINEERED.firstTimeHourly}/hr
                    </button>
                    <button
                      type="button"
                      className={`border px-3 py-3 font-caps text-[18px] ${
                        clientType === "returning"
                          ? "border-paper bg-graphite"
                          : "border-rule"
                      }`}
                      onClick={() => setClientType("returning")}
                    >
                      Returning · ${ENGINEERED.returningHourly}/hr
                    </button>
                  </div>
                )}
                {(podcastIsDiy ||
                  (isMusic && rateMode === "room-only")) && (
                  <p className="pt-2 text-sm text-muted">
                    Room-only total: ${studioSubtotal} for {hours}h in{" "}
                    {selectedRoom.name} (${selectedRoom.hourly}/hr). Deposit $
                    {deposit}.
                  </p>
                )}
                {podcastIsCompanyShow && podcastOffer && (
                  <p className="pt-2 text-sm text-muted">
                    {podcastOfferLabel(podcastOffer)} · deposit ${deposit} now.
                  </p>
                )}
                {eligibilityLoading &&
                  isMusic &&
                  rateMode === "engineered" && (
                    <p className="text-sm text-muted">
                      Checking first-session eligibility…
                    </p>
                  )}
                {isMusic &&
                  rateMode === "engineered" &&
                  eligibility &&
                  !eligibility.canUseFirstTime && (
                    <p className="text-sm text-accent">
                      {eligibility.reason ||
                        "This contact already booked — returning rates apply."}
                    </p>
                  )}
                {isMusic &&
                  rateMode === "engineered" &&
                  eligibility?.canUseIntroPromo &&
                  packageId === "session" &&
                  hours === INTRO_PROMO.hours &&
                  clientType === "first-time" && (
                    <p className="text-sm text-paper-dim">
                      Intro unlocked: {INTRO_PROMO.label} will apply at checkout
                      (one-time, first session only).
                    </p>
                  )}
              </div>
            </StepShell>
          )}

          {step === "addon" && !skipPackagesAndAddons && currentAddon && (
            <StepShell
              eyebrow={`Add-on ${addonIndex + 1} of ${ADDONS.length}`}
              title={currentAddon.name}
              onBack={() => backFrom("addon")}
              onNext={() => nextFrom("addon")}
              nextLabel="Skip"
              secondary={{
                label: `Add · $${currentAddon.packagePrice}`,
                onClick: () => {
                  setSelectedAddons((ids) =>
                    ids.includes(currentAddon.id)
                      ? ids
                      : [...ids, currentAddon.id],
                  );
                  nextFrom("addon");
                },
              }}
            >
              <p className="text-paper-dim">
                <span className="line-through text-muted">
                  ${currentAddon.original}
                </span>{" "}
                <span className="text-paper">${currentAddon.packagePrice}</span>
                {currentAddon.kind === "sample" && (
                  <span className="ml-2 font-caps text-[18px] text-accent">
                    Sample offer pricing
                  </span>
                )}
              </p>
              <p className="mt-4 text-sm text-muted">
                Take it or skip — one at a time. No pile-on screen.
              </p>
            </StepShell>
          )}

          {step === "checkout" && (
            <StepShell
              eyebrow="Final step"
              title="Pay the deposit"
              onBack={() => backFrom("checkout")}
              onNext={
                payMethod === "zelle"
                  ? submitZelleHold
                  : null
              }
              nextLabel={
                payMethod === "zelle"
                  ? busy
                    ? "Holding slot…"
                    : `Hold slot · pay $${deposit} by Zelle`
                  : undefined
              }
              error={error}
            >
              <p className="text-paper-dim">{DEPOSIT.policy}</p>
              <dl className="mt-6 space-y-2 border border-rule p-4 text-sm">
                <Row label="Session total" value={`$${total}`} />
                <Row label="Deposit due now (50%)" value={`$${deposit}`} />
                <Row label="Balance on arrival" value={`$${balance}`} />
                <Row
                  label="Room"
                  value={<RoomName roomId={roomId} size="sm" className="text-sm" />}
                />
                <Row label="Date" value={date} />
                <Row
                  label="Time"
                  value={`${formatTimeRange12(start, end)} (${hours}h)`}
                />
              </dl>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`border px-3 py-3 font-caps text-[18px] ${
                    payMethod === "paypal"
                      ? "border-cyan bg-graphite text-cyan"
                      : "border-rule"
                  }`}
                  onClick={() => {
                    setPayMethod("paypal");
                    setError("");
                  }}
                >
                  PayPal / Venmo
                </button>
                <button
                  type="button"
                  className={`border px-3 py-3 font-caps text-[18px] ${
                    payMethod === "zelle"
                      ? "border-cyan bg-graphite text-cyan"
                      : "border-rule"
                  }`}
                  onClick={() => {
                    setPayMethod("zelle");
                    setError("");
                  }}
                >
                  Zelle
                </button>
              </div>

              {payMethod === "paypal" && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-muted">
                    Pay the ${deposit} deposit with PayPal. Venmo shows for
                    eligible US buyers inside PayPal Checkout.
                    {PUBLIC_PAYMENTS.venmoHandle
                      ? ` Studio Venmo: ${PUBLIC_PAYMENTS.venmoHandle}.`
                      : ""}
                  </p>
                  <PayPalDepositButtons
                    clientId={paypalClientId}
                    deposit={deposit}
                    createOrder={createPayPalCheckout}
                    onApproved={onPayPalApproved}
                    onError={(message) => setError(message)}
                  />
                </div>
              )}

              {payMethod === "zelle" && (
                <div className="mt-4 border border-rule bg-graphite p-4 text-sm text-paper-dim">
                  <p className="font-caps text-[18px] text-cyan">
                    Manual Zelle — no website API
                  </p>
                  <p className="mt-3">
                    Send <strong className="text-paper">${deposit}</strong> via
                    Zelle to{" "}
                    <strong className="text-paper">
                      {PUBLIC_PAYMENTS.zelleDestination}
                    </strong>
                    {PUBLIC_PAYMENTS.zelleName
                      ? ` (${PUBLIC_PAYMENTS.zelleName})`
                      : ""}
                    .
                  </p>
                  <p className="mt-2">
                    Memo: your name · {date} · {formatClock12(start)}. Remaining
                    ${balance} due
                    on arrival. The studio confirms the calendar hold after the
                    transfer posts.
                  </p>
                  <p className="mt-2 text-muted">
                    Also reachable at {STUDIO.phone} / {STUDIO.email}.
                  </p>
                </div>
              )}
            </StepShell>
          )}

          {step === "agreement" && agreementFill && (
            <div>
              <BookingAgreementStep
                agreementId={agreementId}
                accessCode={agreementCode}
                fill={agreementFill}
                alreadySigned={agreementSigned}
                onBack={() => backFrom("agreement")}
                onError={setError}
                onSigned={() => {
                  setAgreementSigned(true);
                  setError("");
                  setStep("checkout");
                }}
              />
              {error && <p className="mt-4 text-sm text-accent">{error}</p>}
            </div>
          )}

          {step === "done" && (
            <div>
              <p className="font-caps text-[18px] text-accent">Complete</p>
              <h2 className="font-display mt-3 text-4xl">You&apos;re booked</h2>
              <p className="mt-4 text-paper-dim">{doneMsg}</p>
              {bookingId && (
                <p className="mt-3 font-caps text-[18px] text-muted">
                  Booking ref · {bookingId}
                </p>
              )}
              {agreementCode && (
                <p className="mt-2 font-caps text-[18px] text-cyan">
                  Agreement code · {agreementCode}
                </p>
              )}
              <p className="mt-4 text-sm text-muted">
                Questions: {STUDIO.phone} · {STUDIO.email}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {agreementId && agreementCode && (
                  <a
                    className="btn no-underline"
                    href={`/agreement/${agreementId}?code=${encodeURIComponent(agreementCode)}`}
                  >
                    View agreement
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={closeBooking}
                >
                  {isApp ? "Book another" : "Close"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slim summary bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-rule bg-ink/95 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 font-caps text-[18px] tracking-[0.14em] text-muted">
            {!service ? (
              <span className="text-muted">Music or podcast — pick a path</span>
            ) : (
              <>
                <span className="inline-flex flex-wrap items-center gap-2 normal-case tracking-normal">
                  <span className="font-caps tracking-[0.14em] text-cyan">
                    {isMusic ? "Music" : "Podcast"}
                  </span>
                  {step !== "service" && (
                    <>
                      <RoomName roomId={roomId} size="sm" className="text-sm" />
                      <span className="font-caps tracking-[0.14em]">
                        · {hours}h · {rateLabel}
                      </span>
                    </>
                  )}
                </span>
                {showPricing ? (
                  <span className="text-paper">
                    ${total} · deposit ${deposit}
                  </span>
                ) : (
                  <span className="text-muted">Pricing after you choose</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  secondary,
  error,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  onBack: (() => void) | null;
  onNext: ((e?: FormEvent) => void | Promise<void>) | (() => void | Promise<void>) | null;
  nextLabel?: string;
  secondary?: { label: string; onClick: () => void };
  error?: string;
}) {
  return (
    <div>
      <p className="font-caps text-[18px] text-muted">{eyebrow}</p>
      <h2 className="font-display mt-2 text-[clamp(2rem,6vw,3.2rem)] leading-none">
        {title}
      </h2>
      <div className="mt-8">{children}</div>
      {error && <p className="mt-4 text-sm text-accent">{error}</p>}
      <div className="mt-10 flex flex-wrap gap-3">
        {onBack && (
          <button type="button" className="btn" onClick={onBack}>
            Back
          </button>
        )}
        {secondary && (
          <button type="button" className="btn btn-accent" onClick={secondary.onClick}>
            {secondary.label}
          </button>
        )}
        {onNext && (
          <button type="button" className="btn btn-solid" onClick={() => onNext()}>
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
