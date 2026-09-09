/** Clock helpers — storage stays 24h `HH:MM`; UI uses 12-hour labels. */

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Normalize minutes into a 24h clock string (wraps past midnight). */
export function minutesToTime(mins: number): string {
  const day = 24 * 60;
  const normalized = ((mins % day) + day) % day;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function addHoursToTime(start: string, durationHours: number): string {
  return minutesToTime(
    timeToMinutes(start) + Math.round(durationHours * 60),
  );
}

/** `10:00` → `10:00 AM`, `14:30` → `2:30 PM`, `00:00` → `12:00 AM` */
export function formatClock12(hhmm: string): string {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return hhmm;
  const [hRaw, mRaw] = hhmm.split(":").map(Number);
  const h24 = ((hRaw % 24) + 24) % 24;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mRaw).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange12(start: string, end: string): string {
  return `${formatClock12(start)}–${formatClock12(end)}`;
}

/**
 * Studio-day absolute minutes from midnight of the session date.
 * When the room closes after midnight (close <= open), early-morning
 * clock times (e.g. 01:00) belong to the overnight tail (+24h).
 */
export function toStudioDayMinutes(
  hhmm: string,
  openMinutes: number,
  overnight: boolean,
): number {
  const m = timeToMinutes(hhmm);
  if (overnight && m < openMinutes) return m + 24 * 60;
  return m;
}

export function studioCloseBoundary(
  openTime: string,
  closeTime: string,
): { open: number; close: number; overnight: boolean } {
  const open = timeToMinutes(openTime);
  const closeClock = timeToMinutes(closeTime);
  const overnight = closeClock <= open;
  return {
    open,
    close: overnight ? closeClock + 24 * 60 : closeClock,
    overnight,
  };
}
