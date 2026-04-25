"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { getSupabase } from "@/lib/supabase/client";
import { ConnectionPill, useChannelStatus } from "@/lib/useConnection";
import {
  findCurrentBlock,
  findNextBlock,
  formatTime,
  minutesUntil,
} from "@/lib/schedule";
import type {
  PecsIcon,
  PecsRequest,
  ScheduleBlock,
  Student,
} from "@/lib/types";

type ActiveAlert = {
  id: string;
  studentId: string;
  studentName: string;
  studentPhoto: string | null;
  iconLabel: string;
  iconEmoji: string | null;
  createdAt: string;
};

const ALERT_DURATION_MS = 14000;
const TRANSITION_WARN_MIN = 2;

export default function BoardPage() {
  const supabase = useMemo(() => getSupabase(), []);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [icons, setIcons] = useState<PecsIcon[]>([]);
  const [now, setNow] = useState(new Date());
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [calmMode, setCalmMode] = useState(false);
  const [silent, setSilent] = useState(false);
  const audioReadyRef = useRef(false);
  const studentsRef = useRef<Student[]>([]);
  const iconsRef = useRef<PecsIcon[]>([]);

  // Keep refs in sync so the realtime callback always sees latest lookups
  useEffect(() => {
    studentsRef.current = students;
  }, [students]);
  useEffect(() => {
    iconsRef.current = icons;
  }, [icons]);

  // Load reference data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [b, s, i] = await Promise.all([
        supabase
          .from("schedule_blocks")
          .select("*")
          .is("student_id", null)
          .order("starts_at"),
        supabase.from("students").select("*").order("full_name"),
        supabase.from("pecs_icons").select("*"),
      ]);
      if (cancelled) return;
      if (b.data) setBlocks(b.data as ScheduleBlock[]);
      if (s.data) setStudents(s.data as Student[]);
      if (i.data) setIcons(i.data as PecsIcon[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Tick clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Realtime: PECS request alerts
  const status = useChannelStatus(
    () =>
      supabase
        .channel("board-pecs")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "pecs_requests" },
          (payload) => {
            const req = payload.new as PecsRequest;
            const student = studentsRef.current.find((s) => s.id === req.student_id);
            const icon = iconsRef.current.find((i) => i.id === req.icon_id);
            if (!student || !icon) return;
            const a: ActiveAlert = {
              id: req.id,
              studentId: student.id,
              studentName: student.full_name,
              studentPhoto: student.photo_url,
              iconLabel: icon.label,
              iconEmoji: icon.emoji,
              createdAt: req.created_at,
            };
            setAlerts((cur) => [a, ...cur].slice(0, 4));
            announce(`${student.full_name} wants ${icon.label}`);
            window.setTimeout(() => {
              setAlerts((cur) => cur.filter((x) => x.id !== a.id));
            }, ALERT_DURATION_MS);
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "pecs_requests" },
          (payload) => {
            const row = payload.new as PecsRequest;
            // If it was resolved on the dashboard, clear it from the board
            if (row.status !== "pending" && row.status !== "in_progress") {
              setAlerts((cur) => cur.filter((x) => x.id !== row.id));
            }
          },
        ),
    [supabase],
  );

  function announce(text: string) {
    if (silent) return;
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      audioReadyRef.current = true;
    } catch {
      /* noop */
    }
  }

  const current = findCurrentBlock(blocks, now);
  const next = findNextBlock(blocks, now);
  const minsToTransition = current ? minutesUntil(current.ends_at, now) : null;
  const isTransitioning =
    minsToTransition !== null && minsToTransition <= TRANSITION_WARN_MIN;

  return (
    <main
      className={`tv-bg ${calmMode ? "calm" : ""} min-h-screen p-6 lg:p-10 flex flex-col gap-6`}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-4">
          <span className="text-7xl lg:text-8xl font-bold tabular-nums tracking-tight">
            {now.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          <span className="text-2xl text-white/70">
            {now.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ConnectionPill status={status} />
          <button
            className="btn btn-ghost text-white border-white/30"
            onClick={() => setCalmMode((v) => !v)}
            aria-pressed={calmMode}
          >
            {calmMode ? "Calm: ON" : "Calm: OFF"}
          </button>
          <button
            className="btn btn-ghost text-white border-white/30"
            onClick={() => setSilent((v) => !v)}
            aria-pressed={silent}
          >
            {silent ? "🔇 Silent" : "🔊 Sound"}
          </button>
        </div>
      </header>

      {/* PECS alert stack */}
      {alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {alerts.map((a, i) => (
            <div
              key={a.id}
              className={`alert-in ${i === 0 ? "pecs-banner" : ""} rounded-3xl p-6 lg:p-8 flex items-center gap-6`}
              style={{
                background:
                  i === 0
                    ? "linear-gradient(180deg,#fde68a,#fbbf24)"
                    : "rgba(253, 224, 71, 0.85)",
                color: "#1f1500",
              }}
            >
              <Avatar
                name={a.studentName}
                photoUrl={a.studentPhoto}
                size={i === 0 ? 120 : 72}
                ring
              />
              <div className="flex-1 min-w-0">
                <p className="text-xl uppercase tracking-widest opacity-70">
                  Request
                </p>
                <p
                  className={`font-extrabold leading-tight truncate ${
                    i === 0 ? "text-6xl lg:text-7xl" : "text-3xl"
                  }`}
                >
                  {a.studentName} wants {a.iconLabel}
                </p>
              </div>
              <span
                className={i === 0 ? "text-9xl" : "text-6xl"}
                aria-hidden
              >
                {a.iconEmoji ?? "📣"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Current + Next */}
      <section className="grid gap-6 lg:grid-cols-3 flex-1">
        <div className="tv-card p-6 lg:p-8 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xl uppercase tracking-widest text-white/60">
              Right now
            </p>
            {isTransitioning && (
              <span className="transition-warn px-4 py-2 rounded-full text-base font-bold uppercase tracking-widest text-amber-200">
                ⏰ Transition in {minsToTransition} min
              </span>
            )}
          </div>
          {current ? (
            <div className="mt-2 flex items-center gap-6 flex-1">
              <span className="text-9xl">{current.icon ?? "📌"}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-6xl lg:text-7xl font-bold leading-tight">
                  {current.title}
                </h2>
                <p className="text-2xl lg:text-3xl text-white/70 mt-2">
                  {formatTime(current.starts_at)} – {formatTime(current.ends_at)}
                  {minsToTransition !== null && (
                    <span className="ml-3">
                      · {minsToTransition} min left
                    </span>
                  )}
                </p>
                {current.staff && (
                  <p className="text-2xl text-white/60 mt-1">
                    Staff: {current.staff}
                  </p>
                )}
                {current.notes && (
                  <p className="text-2xl text-white/85 mt-3">{current.notes}</p>
                )}
                {/* Block progress bar */}
                {minsToTransition !== null && (
                  <BlockProgress
                    starts={current.starts_at}
                    ends={current.ends_at}
                    now={now}
                  />
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-4xl text-white/70">
              No scheduled block right now.
            </p>
          )}
        </div>

        <div className="tv-card p-6 lg:p-8 flex flex-col">
          <p className="text-xl uppercase tracking-widest text-white/60">
            Next
          </p>
          {next ? (
            <div className="mt-2">
              <div className="flex items-center gap-4">
                <span className="text-7xl">{next.icon ?? "➡️"}</span>
                <h3 className="text-4xl font-bold">{next.title}</h3>
              </div>
              <p className="text-2xl text-white/70 mt-3">
                Starts {formatTime(next.starts_at)}
              </p>
              {next.staff && (
                <p className="text-xl text-white/55 mt-1">{next.staff}</p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-2xl text-white/70">
              No more blocks today.
            </p>
          )}
        </div>
      </section>

      {/* Student strip */}
      {students.length > 0 && (
        <section className="tv-card p-5">
          <p className="text-lg uppercase tracking-widest text-white/60 mb-3">
            Students
          </p>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center gap-2 min-w-[120px]"
              >
                <Avatar name={s.full_name} photoUrl={s.photo_url} size={64} ring />
                <span className="text-base font-semibold text-center leading-tight">
                  {s.full_name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Whole day strip */}
      <section className="tv-card p-5">
        <p className="text-lg uppercase tracking-widest text-white/60 mb-3">
          Today
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {blocks.map((b) => {
            const isCurrent = current?.id === b.id;
            const isPast = b.ends_at <= toHM(now);
            return (
              <div
                key={b.id}
                className="rounded-2xl px-4 py-3 min-w-[148px] text-center"
                style={{
                  background: isCurrent
                    ? "rgba(253, 224, 71, 0.95)"
                    : isPast
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.10)",
                  color: isCurrent ? "#1f1500" : "white",
                  outline: isCurrent
                    ? "3px solid white"
                    : "1px solid rgba(255,255,255,0.10)",
                  opacity: isPast ? 0.55 : 1,
                }}
              >
                <div className="text-3xl">{b.icon}</div>
                <div className="font-semibold">{b.title}</div>
                <div className="text-sm opacity-70">
                  {formatTime(b.starts_at)}
                </div>
              </div>
            );
          })}
          {blocks.length === 0 && (
            <p className="text-white/70">
              No schedule yet. Load <code>supabase/schema.sql</code>.
            </p>
          )}
        </div>
      </section>

      <footer className="text-white/40 text-sm">
        Tap anywhere on this page once to enable audio (browser policy).
      </footer>
      {/* One-shot to "warm up" speechSynthesis after a user gesture */}
      <button
        aria-hidden
        onClick={() => announce(" ")}
        className="fixed inset-0 opacity-0 pointer-events-auto"
        style={{ display: audioReadyRef.current ? "none" : "block" }}
      />
    </main>
  );
}

function toHM(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

function BlockProgress({
  starts,
  ends,
  now,
}: {
  starts: string;
  ends: string;
  now: Date;
}) {
  const [sH, sM] = starts.split(":").map(Number);
  const [eH, eM] = ends.split(":").map(Number);
  const start = new Date(now);
  start.setHours(sH, sM, 0, 0);
  const end = new Date(now);
  end.setHours(eH, eM, 0, 0);
  const total = Math.max(1, end.getTime() - start.getTime());
  const done = Math.min(total, Math.max(0, now.getTime() - start.getTime()));
  const pct = (done / total) * 100;
  return (
    <div
      className="mt-4 h-3 rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.10)" }}
      aria-label="Block progress"
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: "linear-gradient(90deg, #fde68a, #fbbf24)",
          transition: "width 1s linear",
        }}
      />
    </div>
  );
}
