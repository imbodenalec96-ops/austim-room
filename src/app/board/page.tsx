"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
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
  studentName: string;
  iconLabel: string;
  iconEmoji: string | null;
};

const ALERT_DURATION_MS = 12000;

export default function BoardPage() {
  const supabase = useMemo(() => getSupabase(), []);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [icons, setIcons] = useState<PecsIcon[]>([]);
  const [now, setNow] = useState(new Date());
  const [alert, setAlert] = useState<ActiveAlert | null>(null);
  const [calmMode, setCalmMode] = useState(false);
  const [silent, setSilent] = useState(false);
  const audioReadyRef = useRef(false);

  // Load static-ish reference data once
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
      if (b.data) setBlocks(b.data);
      if (s.data) setStudents(s.data);
      if (i.data) setIcons(i.data);
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

  // Realtime: listen for new PECS requests, fire alert + TTS
  useEffect(() => {
    if (students.length === 0 || icons.length === 0) return;
    const channel = supabase
      .channel("board-pecs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "pecs_requests",
        },
        (payload) => {
          const req = payload.new as PecsRequest;
          const student = students.find((s) => s.id === req.student_id);
          const icon = icons.find((i) => i.id === req.icon_id);
          if (!student || !icon) return;
          const a: ActiveAlert = {
            id: req.id,
            studentName: student.full_name,
            iconLabel: icon.label,
            iconEmoji: icon.emoji,
          };
          setAlert(a);
          announce(`${student.full_name} wants ${icon.label}`);
          window.setTimeout(() => {
            setAlert((cur) => (cur && cur.id === a.id ? null : cur));
          }, ALERT_DURATION_MS);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, students, icons]);

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
  const minsToTransition = current
    ? minutesUntil(current.ends_at, now)
    : null;

  return (
    <main
      className={`tv-bg ${calmMode ? "calm" : ""} min-h-screen p-8 flex flex-col gap-6`}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="text-7xl font-bold tabular-nums tracking-tight">
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
        <div className="flex gap-2">
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

      {/* PECS alert banner */}
      {alert && (
        <div
          className="pecs-banner rounded-3xl p-8 flex items-center gap-8"
          style={{
            background: "linear-gradient(180deg,#fde68a,#fbbf24)",
            color: "#1f1500",
          }}
        >
          <span className="text-9xl">{alert.iconEmoji ?? "📣"}</span>
          <div className="flex-1">
            <p className="text-2xl uppercase tracking-widest opacity-70">
              Request
            </p>
            <p className="text-6xl font-extrabold leading-tight">
              {alert.studentName} wants {alert.iconLabel}
            </p>
          </div>
        </div>
      )}

      {/* Current + Next */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="tv-card p-8 lg:col-span-2">
          <p className="text-xl uppercase tracking-widest text-white/60">
            Right now
          </p>
          {current ? (
            <div className="mt-2 flex items-center gap-6">
              <span className="text-9xl">{current.icon ?? "📌"}</span>
              <div className="flex-1">
                <h2 className="text-7xl font-bold leading-tight">
                  {current.title}
                </h2>
                <p className="text-3xl text-white/70 mt-2">
                  {formatTime(current.starts_at)} – {formatTime(current.ends_at)}
                  {minsToTransition !== null && (
                    <span className="ml-4">
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
                  <p className="text-2xl text-white/80 mt-3">{current.notes}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-4xl text-white/70">
              No scheduled block right now.
            </p>
          )}
        </div>

        <div className="tv-card p-8">
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
            </div>
          ) : (
            <p className="mt-4 text-2xl text-white/70">
              No more blocks today.
            </p>
          )}
        </div>
      </section>

      {/* Whole day strip */}
      <section className="tv-card p-6">
        <p className="text-lg uppercase tracking-widest text-white/60 mb-3">
          Today
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {blocks.map((b) => {
            const isCurrent = current?.id === b.id;
            return (
              <div
                key={b.id}
                className="rounded-2xl px-4 py-3 min-w-[140px] text-center"
                style={{
                  background: isCurrent
                    ? "rgba(253, 224, 71, 0.95)"
                    : "rgba(255,255,255,0.08)",
                  color: isCurrent ? "#1f1500" : "white",
                  outline: isCurrent
                    ? "3px solid white"
                    : "1px solid rgba(255,255,255,0.10)",
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

      <footer className="mt-auto text-white/40 text-sm">
        Tap anywhere once to enable audio (browser policy).
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
