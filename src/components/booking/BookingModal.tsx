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
import { useBooking } from "@/components/booking/BookingProvider";
import { RoomName } from "@/components/RoomName";
import { PayPalDepositButtons } from "@/components/booking/PayPalDepositButtons";
import { DateCalendarPicker } from "@/components/booking/DateCalendarPicker";
import {
  ADDONS,
  DEPOSIT,
  ENGINEERED,
  PACKAGES,
  ROOMS,
  STUDIO,
  balanceOnArrival,
  depositAmount,
  engineeredTotal,
  type RoomId,
} from "@/lib/rates";
import { PUBLIC_PAYMENTS } from "@/lib/payments-public";
import {
  addHoursToTime,
  formatClock12,
  formatTimeRange12,
} from "@/lib/time";

type Step =
  | "date-room"
  | "package"
  | "times"
  | "contact"
  | "addon"
  | "checkout"
  | "done";

const STEPS: Step[] = [
  "date-room",
  "package",
  "times",
  "contact",
  "addon",
  "checkout",
];

const DURATION_OPTIONS = [2, 3, 4, 6, 8];

export function BookingModal() {
  const {
    open,
    closeBooking,
    initialRoomId,
    initialPackageId,
    planner,
  } = useBooking();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>("date-room");
  const [date, setDate] = useState("");
  const [roomId, setRoomId] = useState<RoomId>("venus");
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
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  useEffect(() => {
    if (!open) return;
    setStep("date-room");
    setAddonIndex(0);
    setSelectedAddons([]);
    setError("");
    setDoneMsg("");
    setStart("");
    setAvailableStarts([]);
    setBookedBlocks([]);
    setBookingId("");
    setPayMethod("paypal");
    if (initialRoomId) setRoomId(initialRoomId);
    if (planner?.roomId) setRoomId(planner.roomId);
    if (initialPackageId) setPackageId(initialPackageId);
    if (planner?.clientType) setClientType(planner.clientType);
    if (planner?.bookedHours) {
      setDurationHours(
        Math.max(ENGINEERED.minimumHours, planner.bookedHours),
      );
    } else {
      setDurationHours(ENGINEERED.minimumHours);
    }
  }, [open, initialRoomId, initialPackageId, planner]);

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

  const end = start ? addHoursToTime(start, durationHours) : "";
  const hours = durationHours;

  const studioSubtotal = useMemo(() => {
    if (packageId === "series") return PACKAGES.series.sampleTotal;
    if (packageId === "partner") return PACKAGES.partner.sampleMonthlyTotal;
    return engineeredTotal(hours, clientType);
  }, [packageId, hours, clientType]);

  const addonTotal = selectedAddons.reduce((sum, id) => {
    const a = ADDONS.find((x) => x.id === id);
    return sum + (a?.packagePrice ?? 0);
  }, 0);

  const total = studioSubtotal + addonTotal;
  const deposit = depositAmount(total);
  const balance = balanceOnArrival(total);
  const rateLabel =
    packageId === "session"
      ? clientType === "first-time"
        ? `$${ENGINEERED.firstTimeHourly}/hr first-time engineered`
        : `$${ENGINEERED.returningHourly}/hr returning engineered`
      : packageId === "series"
        ? "The Series (sample package total)"
        : "The Studio Partner (sample monthly total)";

  function nextFrom(current: Step) {
    if (current === "addon") {
      if (addonIndex < ADDONS.length - 1) {
        setAddonIndex((i) => i + 1);
        return;
      }
      setStep("checkout");
      return;
    }
    const idx = STEPS.indexOf(current);
    if (idx >= 0 && idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function backFrom(current: Step) {
    if (current === "addon" && addonIndex > 0) {
      setAddonIndex((i) => i - 1);
      return;
    }
    if (current === "checkout") {
      setStep("addon");
      setAddonIndex(ADDONS.length - 1);
      return;
    }
    if (current === "addon") {
      setStep("contact");
      return;
    }
    const idx = STEPS.indexOf(current);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  const createPayPalCheckout = useCallback(async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        roomId,
        packageId,
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
        paymentMethod: "paypal",
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
        setDoneMsg(
          `Deposit received via PayPal/Venmo. Booking ${data.bookingId || info.bookingId} is confirmed on the calendar. Remaining balance $${balance} due on arrival.`,
        );
        setStep("done");
      } catch {
        setError("Network error capturing PayPal payment.");
      } finally {
        setBusy(false);
      }
    },
    [balance],
  );

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
          paymentMethod: "zelle",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not hold this slot for Zelle.");
        return;
      }
      setBookingId(data.bookingId || "");
      setDoneMsg(
        `Slot held pending Zelle. Send $${deposit} to ${PUBLIC_PAYMENTS.zelleDestination} (name: ${PUBLIC_PAYMENTS.zelleName}). Include your name and ${date} ${formatClock12(start)} in the memo. Remaining $${balance} due on arrival. Ref: ${data.bookingId}`,
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
    <div className="no-print fixed inset-0 z-[60] flex items-stretch justify-center bg-ink/80 p-0 sm:items-center sm:p-6">
      <div className="relative flex h-full w-full max-w-xl flex-col border border-rule bg-charcoal sm:h-[min(40rem,90vh)]">
        <button
          type="button"
          className="absolute right-4 top-4 z-10 font-caps text-[0.65rem] text-muted"
          onClick={closeBooking}
        >
          Close
        </button>

        <div ref={scrollRef} className="modal-scroll flex-1 px-6 pb-28 pt-10 sm:px-8">
          {step === "date-room" && (
            <StepShell
              eyebrow="Step 1"
              title="Date and room"
              onBack={null}
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
              <DateCalendarPicker
                value={date}
                onChange={setDate}
                roomId={roomId}
                durationHours={durationHours}
                autoOpen
              />
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
                        ? { borderColor: r.color, boxShadow: `0 0 14px ${r.color}55` }
                        : undefined
                    }
                    onClick={() => setRoomId(r.id)}
                  >
                    <RoomName roomId={r.id} size="md" className="text-xl" />
                    <span className="mt-1 block text-sm text-muted">
                      Room-only ${r.hourly}/hr · engineered includes room
                    </span>
                  </button>
                ))}
              </div>
              {planner && (
                <p className="mt-4 border border-rule bg-graphite p-3 text-sm text-paper-dim">
                  Planner attached: {planner.bookedHours}h studio · $
                  {planner.studioCost} engineered estimate
                  {planner.title ? ` · ${planner.title}` : ""}.
                </p>
              )}
            </StepShell>
          )}

          {step === "package" && (
            <StepShell
              eyebrow="Step 2"
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
                  onClick={() => setPackageId(p.id)}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-2xl">{p.name}</span>
                    {p.kind === "sample" && (
                      <span className="font-caps text-[0.6rem] text-accent">
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
              eyebrow="Step 3"
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
                <span className="font-caps text-[0.65rem] text-muted">
                  Session length
                </span>
                <select
                  className="select mt-2"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                >
                  {DURATION_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h} hours{h === ENGINEERED.minimumHours ? " (minimum)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-6">
                <span className="font-caps text-[0.65rem] text-muted">Room</span>
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
                        ${r.hourly}/hr room-only
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
                      <p className="font-caps text-[0.6rem] text-muted">
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
                          className={`border px-2 py-3 font-caps text-[0.7rem] ${
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

              {start && end && (
                <p className="mt-4 text-paper-dim">
                  Selected window: {formatTimeRange12(start, end)} ({hours}h).
                  Live total uses {rateLabel}
                  {packageId === "session" ? `: $${studioSubtotal}` : ""}.
                </p>
              )}
              {packageId === "session" && start && (
                <p className="mt-2 text-sm text-muted">
                  Math: {hours} × $
                  {clientType === "first-time"
                    ? ENGINEERED.firstTimeHourly
                    : ENGINEERED.returningHourly}{" "}
                  = ${studioSubtotal}. Room included.
                </p>
              )}
              {packageId !== "session" && (
                <p className="mt-2 text-sm text-accent">
                  Package subtotal ${studioSubtotal} includes sample components —
                  see Pricing for the published vs sample split.
                </p>
              )}
            </StepShell>
          )}

          {step === "contact" && (
            <StepShell
              eyebrow="Step 4"
              title="You"
              onBack={() => backFrom("contact")}
              onNext={() => {
                if (!name || !email || !phone) {
                  setError("Name, email, and phone — all three.");
                  return;
                }
                setError("");
                nextFrom("contact");
              }}
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
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    className={`border px-3 py-3 font-caps text-[0.7rem] ${
                      clientType === "first-time"
                        ? "border-paper bg-graphite"
                        : "border-rule"
                    }`}
                    onClick={() => setClientType("first-time")}
                  >
                    First-time · ${ENGINEERED.firstTimeHourly}/hr
                  </button>
                  <button
                    type="button"
                    className={`border px-3 py-3 font-caps text-[0.7rem] ${
                      clientType === "returning"
                        ? "border-paper bg-graphite"
                        : "border-rule"
                    }`}
                    onClick={() => setClientType("returning")}
                  >
                    Returning · ${ENGINEERED.returningHourly}/hr
                  </button>
                </div>
              </div>
            </StepShell>
          )}

          {step === "addon" && currentAddon && (
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
                  <span className="ml-2 font-caps text-[0.6rem] text-accent">
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
              eyebrow="Deposit"
              title="Lock the date"
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
                  className={`border px-3 py-3 font-caps text-[0.68rem] ${
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
                  className={`border px-3 py-3 font-caps text-[0.68rem] ${
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
                  <p className="font-caps text-[0.65rem] text-cyan">
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

          {step === "done" && (
            <div>
              <p className="font-caps text-[0.68rem] text-accent">Booked path</p>
              <h2 className="font-display mt-3 text-4xl">Deposit next</h2>
              <p className="mt-4 text-paper-dim">{doneMsg}</p>
              {bookingId && (
                <p className="mt-3 font-caps text-[0.65rem] text-muted">
                  Ref · {bookingId}
                </p>
              )}
              <p className="mt-4 text-sm text-muted">
                Questions: {STUDIO.phone} · {STUDIO.email}
              </p>
              <button type="button" className="btn btn-solid mt-6" onClick={closeBooking}>
                Close
              </button>
            </div>
          )}
        </div>

        {/* Slim summary bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-rule bg-ink/95 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 font-caps text-[0.62rem] tracking-[0.14em] text-muted">
            <span className="inline-flex items-center gap-2 normal-case tracking-normal">
              <RoomName roomId={roomId} size="sm" className="text-sm" />
              <span className="font-caps tracking-[0.14em]">
                · {hours}h · {rateLabel}
              </span>
            </span>
            <span className="text-paper">
              ${total} · deposit ${deposit}
            </span>
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
  onNext: ((e?: FormEvent) => void) | (() => void) | null;
  nextLabel?: string;
  secondary?: { label: string; onClick: () => void };
  error?: string;
}) {
  return (
    <div>
      <p className="font-caps text-[0.68rem] text-muted">{eyebrow}</p>
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
