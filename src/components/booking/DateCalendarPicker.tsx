"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { RoomId } from "@/lib/rates";
import { ENGINEERED } from "@/lib/rates";

type Props = {
  value: string;
  onChange: (ymd: string) => void;
  roomId: RoomId;
  durationHours?: number;
  autoOpen?: boolean;
};

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function todayLocal(): Date {
  return startOfDay(new Date());
}

export function DateCalendarPicker({
  value,
  onChange,
  roomId,
  durationHours = ENGINEERED.minimumHours,
  autoOpen = true,
}: Props) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(autoOpen);
  const [month, setMonth] = useState(() =>
    value ? startOfMonth(parseISO(value)) : startOfMonth(todayLocal()),
  );
  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const selected = value ? parseISO(value) : null;
  const displayLabel = selected
    ? format(selected, "EEE, MMM d, yyyy")
    : "Pick an available date";

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const from = toYmd(startOfMonth(month));
    const to = toYmd(endOfMonth(month));
    setLoading(true);
    setLoadError("");
    fetch(
      `/api/availability/dates?room=${roomId}&from=${from}&to=${to}&hours=${durationHours}`,
    )
      .then(async (res) => {
        const raw = await res.text();
        let data: {
          availableDates?: string[];
          error?: string;
        } = {};
        if (raw) {
          try {
            data = JSON.parse(raw) as typeof data;
          } catch {
            throw new Error(
              res.ok
                ? "Availability response was not valid JSON."
                : `Could not load dates (HTTP ${res.status}).`,
            );
          }
        } else if (!res.ok) {
          throw new Error(`Could not load dates (HTTP ${res.status}).`);
        }
        if (!res.ok) throw new Error(data.error || "Could not load dates");
        if (cancelled) return;
        setAvailable(new Set(data.availableDates || []));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        // Soft fallback: keep future in-month days selectable so a
        // temporary API outage does not strike out the whole calendar.
        const fallback = days
          .filter(
            (day) =>
              isSameMonth(day, month) && !isBefore(day, todayLocal()),
          )
          .map(toYmd);
        setAvailable(new Set(fallback));
        setLoadError(
          err.message ||
            "Live availability unavailable — showing open days; confirm times on the next step.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, month, roomId, durationHours, days]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(day: Date) {
    const ymd = toYmd(day);
    if (!available.has(ymd)) return;
    if (isBefore(day, todayLocal())) return;
    onChange(ymd);
    setOpen(false);
  }

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="font-caps text-[0.65rem] text-muted">Date</span>
      <button
        type="button"
        className="input mt-2 flex w-full items-center justify-between gap-3 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
      >
        <span className={selected ? "text-paper" : "text-muted"}>
          {displayLabel}
        </span>
        <span className="font-caps text-[0.65rem] tracking-[0.14em] text-cyan">
          {open ? "Close" : "Calendar"}
        </span>
      </button>

      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-label="Available session dates"
          className="absolute left-0 right-0 z-30 mt-2 border border-rule bg-ink p-3 shadow-[0_18px_40px_rgba(0,0,0,0.55)] sm:p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="font-caps text-[0.65rem] tracking-[0.12em] text-muted transition-colors hover:text-paper"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              aria-label="Previous month"
            >
              Prev
            </button>
            <p className="font-caps text-[0.75rem] tracking-[0.16em] text-paper">
              {format(month, "MMMM yyyy")}
            </p>
            <button
              type="button"
              className="font-caps text-[0.65rem] tracking-[0.12em] text-muted transition-colors hover:text-paper"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
            >
              Next
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                className="py-1 text-center font-caps text-[0.55rem] tracking-[0.12em] text-muted"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const ymd = toYmd(day);
              const inMonth = isSameMonth(day, month);
              const past = isBefore(day, todayLocal());
              const isAvailable = available.has(ymd) && !past;
              const isSelected = selected ? isSameDay(day, selected) : false;
              const disabled = !isAvailable || !inMonth;

              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(day)}
                  aria-label={`${format(day, "MMMM d, yyyy")}${
                    isAvailable ? ", available" : ", unavailable"
                  }`}
                  aria-pressed={isSelected}
                  className={[
                    "aspect-square rounded-sm text-sm transition-colors",
                    !inMonth && "invisible",
                    inMonth && past && "cursor-not-allowed text-muted/40",
                    inMonth &&
                      !past &&
                      !isAvailable &&
                      "cursor-not-allowed text-muted/35 line-through",
                    inMonth &&
                      isAvailable &&
                      !isSelected &&
                      "text-paper hover:bg-graphite hover:text-cyan",
                    isSelected &&
                      "bg-cyan text-ink font-medium shadow-[0_0_12px_rgba(46,230,255,0.35)]",
                    inMonth &&
                      isAvailable &&
                      !isSelected &&
                      "border border-transparent hover:border-cyan/40",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-muted">
            {loading
              ? "Checking open days for this room…"
              : loadError
                ? `Showing open days for now. ${loadError}`
                : "Highlighted days still have open starts for the selected room."}
          </p>
        </div>
      )}
    </div>
  );
}
