import type { ScheduleBlock } from "@/lib/types";

export function nowToHM(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function dayOfWeek(date = new Date()): number {
  return date.getDay();
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Pick the day of the week to display.
 *
 * If today has its own blocks, use today.
 * Otherwise (e.g. weekend with a Mon–Fri-only schedule) fall back to the
 * day of the week that has the most blocks defined — Monday in the
 * default seed. Returns the chosen dow plus a flag noting whether it's a
 * fallback so the UI can label it.
 */
export function pickDayOfWeek(
  blocks: ScheduleBlock[],
  date = new Date(),
): { dow: number; isFallback: boolean } {
  const today = dayOfWeek(date);
  if (blocks.some((b) => b.day_of_week === today)) {
    return { dow: today, isFallback: false };
  }
  const counts = new Map<number, number>();
  for (const b of blocks) {
    counts.set(b.day_of_week, (counts.get(b.day_of_week) ?? 0) + 1);
  }
  if (counts.size === 0) return { dow: today, isFallback: false };
  let best = today;
  let bestCount = -1;
  for (const [d, c] of counts) {
    if (c > bestCount) {
      bestCount = c;
      best = d;
    }
  }
  return { dow: best, isFallback: true };
}

/**
 * Blocks for today (or the chosen fallback day), sorted by start time.
 */
export function blocksForToday(
  blocks: ScheduleBlock[],
  date = new Date(),
): ScheduleBlock[] {
  const { dow } = pickDayOfWeek(blocks, date);
  return blocks
    .filter((b) => b.day_of_week === dow)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export function findCurrentBlock(
  blocks: ScheduleBlock[],
  date = new Date(),
): ScheduleBlock | null {
  const now = nowToHM(date);
  const todays = blocksForToday(blocks, date);
  return (
    todays.find((b) => b.starts_at <= now && b.ends_at > now) ?? null
  );
}

export function findNextBlock(
  blocks: ScheduleBlock[],
  date = new Date(),
): ScheduleBlock | null {
  const now = nowToHM(date);
  const todays = blocksForToday(blocks, date);
  return todays.find((b) => b.starts_at > now) ?? null;
}

export function formatTime(hms: string): string {
  const [hStr, mStr] = hms.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function minutesUntil(hms: string, date = new Date()): number {
  const [h, m] = hms.split(":").map(Number);
  const target = new Date(date);
  target.setHours(h, m, 0, 0);
  return Math.max(0, Math.round((target.getTime() - date.getTime()) / 60000));
}
