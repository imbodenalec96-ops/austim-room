"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { SlideEmbed } from "@/components/SlideEmbed";
import { getSupabase } from "@/lib/supabase/client";
import {
  blocksForToday,
  DAY_NAMES,
  findCurrentBlock,
  findNextBlock,
  formatTime,
  minutesUntil,
  pickDayOfWeek,
} from "@/lib/schedule";
import type { ScheduleBlock, Student } from "@/lib/types";

export default function PresentPage() {
  const supabase = useMemo(() => getSupabase(), []);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [now, setNow] = useState(new Date());
  // Manual override: when teacher uses arrow keys, freeze on this index
  const [manualIdx, setManualIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [b, s] = await Promise.all([
        supabase
          .from("schedule_blocks")
          .select("*")
          .is("student_id", null)
          .order("starts_at"),
        supabase.from("students").select("*").order("full_name"),
      ]);
      if (cancelled) return;
      if (b.data) setBlocks(b.data as ScheduleBlock[]);
      if (s.data) setStudents(s.data as Student[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const today = blocksForToday(blocks, now);
  const dayInfo = pickDayOfWeek(blocks, now);
  const auto = findCurrentBlock(blocks, now);
  const upcoming = findNextBlock(blocks, now);

  const idx =
    manualIdx ??
    Math.max(
      0,
      today.findIndex((b) => b.id === auto?.id),
    );
  const slide = today[idx] ?? null;

  // Keyboard nav: ←/→ to step, Esc to resume auto
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        setManualIdx((i) => Math.min(today.length - 1, (i ?? idx) + 1));
      } else if (e.key === "ArrowLeft") {
        setManualIdx((i) => Math.max(0, (i ?? idx) - 1));
      } else if (e.key === "Escape") {
        setManualIdx(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [today.length, idx]);

  const minsLeft = slide ? minutesUntil(slide.ends_at, now) : null;
  const isManual = manualIdx !== null;

  return (
    <main className="present-bg">
      {/* Top bar */}
      <header className="present-top">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold tabular-nums">
            {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </span>
          <span className="text-lg opacity-70">
            {DAY_NAMES[now.getDay()]}
            {dayInfo.isFallback && ` · showing ${DAY_NAMES[dayInfo.dow]}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isManual && (
            <button
              onClick={() => setManualIdx(null)}
              className="btn btn-ghost btn-sm"
              style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
            >
              ↻ Resume auto
            </button>
          )}
          <Link
            href="/board"
            className="btn btn-ghost btn-sm"
            style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
          >
            Exit
          </Link>
        </div>
      </header>

      {/* Slide */}
      {slide ? (
        <section className="present-slide">
          {/* Title row */}
          <div className="present-title-row">
            <span className="present-title-icon" aria-hidden>
              {slide.icon ?? "📌"}
            </span>
            <div className="flex-1 min-w-0">
              <h1 className="present-title">{slide.title}</h1>
              <p className="present-subtitle">
                {formatTime(slide.starts_at)} – {formatTime(slide.ends_at)}
                {!isManual && minsLeft !== null && (
                  <span> · {minsLeft} min left</span>
                )}
                {slide.staff && <span> · {slide.staff}</span>}
              </p>
            </div>
          </div>

          {/* Embed area */}
          {slide.slide_url ? (
            <SlideEmbed
              url={slide.slide_url}
              title={slide.title}
              autoplay={!isManual}
            />
          ) : (
            <div className="present-empty-slide">
              <span className="present-empty-icon">{slide.icon ?? "🎬"}</span>
              <p className="present-empty-title">{slide.title}</p>
              {slide.notes && <p className="present-empty-notes">{slide.notes}</p>}
            </div>
          )}

          {slide.notes && slide.slide_url && (
            <p className="present-notes">{slide.notes}</p>
          )}
        </section>
      ) : (
        <section className="present-slide flex items-center justify-center">
          <p className="text-3xl text-white/70">No block to present.</p>
        </section>
      )}

      {/* Bottom bar: timeline + students */}
      <footer className="present-bottom">
        <div className="present-timeline">
          {today.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setManualIdx(i)}
              className={`present-pill ${i === idx ? "is-active" : ""}`}
              title={`${b.title} · ${formatTime(b.starts_at)}`}
            >
              <span className="text-xl">{b.icon}</span>
              <span className="text-xs font-semibold leading-tight">
                {b.title}
              </span>
              <span className="text-[10px] opacity-60">
                {formatTime(b.starts_at)}
              </span>
            </button>
          ))}
        </div>

        {students.length > 0 && (
          <div className="present-students">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1 min-w-[64px]"
              >
                <Avatar
                  name={s.full_name}
                  photoUrl={s.photo_url}
                  size={36}
                  ring
                />
                <span className="text-xs font-semibold">
                  {s.full_name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        )}

        {upcoming && !isManual && (
          <p className="present-next">
            Next: <strong>{upcoming.title}</strong> at{" "}
            {formatTime(upcoming.starts_at)}
          </p>
        )}
        <p className="present-hint">← / → to step · Esc resumes auto</p>
      </footer>
    </main>
  );
}
