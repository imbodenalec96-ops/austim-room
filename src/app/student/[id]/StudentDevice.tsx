"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getSupabase } from "@/lib/supabase/client";
import { ConnectionPill, useChannelStatus } from "@/lib/useConnection";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  CATEGORY_ORDER,
} from "@/lib/categories";
import {
  findCurrentBlock,
  findNextBlock,
  formatTime,
} from "@/lib/schedule";
import type {
  PecsCategory,
  PecsIcon,
  ScheduleBlock,
  Student,
} from "@/lib/types";

type Props = {
  student: Student;
  icons: PecsIcon[];
  blocks: ScheduleBlock[];
};

const CARRIER_PHRASE = "I want";
const COOLDOWN_MS = 4000;

export default function StudentDevice({ student, icons, blocks }: Props) {
  const supabase = useMemo(() => getSupabase(), []);
  const [now, setNow] = useState(new Date());
  const [activeCat, setActiveCat] = useState<PecsCategory | "all">("all");
  const [selectedIcon, setSelectedIcon] = useState<PecsIcon | null>(null);
  const [sending, setSending] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tick clock so schedule updates without a refresh
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(t);
  }, []);

  // Hold a realtime channel just to render a connection indicator
  const status = useChannelStatus(
    () => supabase.channel(`student-${student.id}`),
    [supabase, student.id],
  );

  const current = findCurrentBlock(blocks, now);
  const next = findNextBlock(blocks, now);

  const availableCats = useMemo(() => {
    const set = new Set<PecsCategory>();
    icons.forEach((i) => set.add(i.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [icons]);

  const visibleIcons = useMemo(() => {
    if (activeCat === "all") return icons;
    return icons.filter((i) => i.category === activeCat);
  }, [icons, activeCat]);

  function pick(icon: PecsIcon) {
    setSelectedIcon(icon);
    speak(icon.label);
  }

  function clear() {
    setSelectedIcon(null);
  }

  async function send() {
    if (!selectedIcon) return;
    if (Date.now() - lastSentAt < COOLDOWN_MS) return;
    setSending(true);
    setError(null);
    const icon = selectedIcon;
    const { error: e } = await supabase
      .from("pecs_requests")
      .insert({ student_id: student.id, icon_id: icon.id, status: "pending" });
    setSending(false);
    if (e) {
      setError(e.message);
      return;
    }
    setLastSentAt(Date.now());
    setSelectedIcon(null);
    speak(`I want ${icon.label}`);
    setConfirmation(`Sent: ${icon.label}`);
    window.setTimeout(() => setConfirmation(null), 2200);
  }

  function speak(text: string) {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch {
      /* noop */
    }
  }

  return (
    <main className="min-h-screen p-3 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={student.full_name} photoUrl={student.photo_url} size={56} ring />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              Hi, {student.full_name.split(" ")[0]}!
            </h1>
            <p className="text-[var(--muted)]">Tap a picture, then press Send.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionPill status={status} />
          <Link href={`/student/${student.id}/boards`} className="btn btn-soft btn-sm">
            🧩 Boards
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Home
          </Link>
        </div>
      </header>

      {/* Schedule strip */}
      <section className="card p-4 mb-4 grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            Right now
          </p>
          {current ? (
            <p className="text-2xl font-bold">
              <span className="mr-2">{current.icon}</span>
              {current.title}
            </p>
          ) : (
            <p className="text-xl text-[var(--muted)]">No block right now</p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
            Next
          </p>
          {next ? (
            <p className="text-xl">
              <span className="mr-2">{next.icon}</span>
              {next.title}{" "}
              <span className="text-[var(--muted)]">
                · {formatTime(next.starts_at)}
              </span>
            </p>
          ) : (
            <p className="text-[var(--muted)]">All done today</p>
          )}
        </div>
      </section>

      {/* Sentence builder */}
      <section className="mb-4">
        <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">
          Make a sentence
        </p>
        <div className="sentence-strip">
          <span className="sentence-token text-2xl bg-white">
            <span className="text-3xl" aria-hidden>👋</span>
            <span>{CARRIER_PHRASE}</span>
          </span>
          {selectedIcon ? (
            <span
              key={selectedIcon.id}
              className="sentence-token token-pop"
              style={{
                background: CATEGORY_COLOR[selectedIcon.category] + "55",
              }}
            >
              <span className="text-3xl" aria-hidden>
                {selectedIcon.emoji ?? "🖼️"}
              </span>
              <span>{selectedIcon.label}</span>
            </span>
          ) : (
            <span className="text-[var(--muted)] italic">
              Choose a picture below…
            </span>
          )}
          <div className="ml-auto flex gap-2">
            {selectedIcon && (
              <button onClick={clear} className="btn btn-ghost">
                Clear
              </button>
            )}
            <button
              onClick={send}
              disabled={!selectedIcon || sending}
              className="btn"
              style={{ minWidth: 140 }}
            >
              {sending ? "Sending…" : "Send →"}
            </button>
          </div>
        </div>
      </section>

      <div
        role="status"
        aria-live="polite"
        className="h-7 mb-2 text-center text-lg font-semibold text-[var(--good)]"
      >
        {confirmation}
      </div>
      {error && (
        <div className="text-center text-[var(--bad)] mb-3">{error}</div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`chip ${activeCat === "all" ? "chip-active" : ""}`}
          onClick={() => setActiveCat("all")}
        >
          All
        </button>
        {availableCats.map((c) => (
          <button
            key={c}
            className={`chip ${activeCat === c ? "chip-active" : ""}`}
            onClick={() => setActiveCat(c)}
            style={
              activeCat === c
                ? undefined
                : { borderColor: CATEGORY_COLOR[c], background: CATEGORY_COLOR[c] + "33" }
            }
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {/* PECS grid */}
      <section
        aria-label="PECS board"
        className="grid gap-3 sm:gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        }}
      >
        {visibleIcons.map((icon, index) => {
          const selected = selectedIcon?.id === icon.id;
          return (
            <button
              key={icon.id}
              onClick={() => pick(icon)}
              className="pecs-tile tile-rise"
              data-cat={icon.category}
              aria-pressed={selected}
              aria-label={`Pick ${icon.label}`}
              style={
                {
                  borderColor: selected ? "var(--accent)" : undefined,
                  boxShadow: selected ? "var(--shadow)" : undefined,
                  ["--cat-color" as string]: CATEGORY_COLOR[icon.category],
                  ["--i" as string]: index,
                } as React.CSSProperties
              }
            >
              <span className="pecs-emoji" aria-hidden>
                {icon.emoji ?? "🖼️"}
              </span>
              <span>{icon.label}</span>
            </button>
          );
        })}
      </section>
    </main>
  );
}
