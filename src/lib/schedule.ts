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

export function findCurrentBlock(
  blocks: ScheduleBlock[],
  date = new Date(),
): ScheduleBlock | null {
  const dow = dayOfWeek(date);
  const now = nowToHM(date);
  const todays = blocks
    .filter((b) => b.day_of_week === dow)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return (
    todays.find((b) => b.starts_at <= now && b.ends_at > now) ?? null
  );
}

export function findNextBlock(
  blocks: ScheduleBlock[],
  date = new Date(),
): ScheduleBlock | null {
  const dow = dayOfWeek(date);
  const now = nowToHM(date);
  const todays = blocks
    .filter((b) => b.day_of_week === dow)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
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
