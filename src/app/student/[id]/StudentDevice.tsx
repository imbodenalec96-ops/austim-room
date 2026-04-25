"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import {
  findCurrentBlock,
  findNextBlock,
  formatTime,
} from "@/lib/schedule";
import type { PecsIcon, ScheduleBlock, Student } from "@/lib/types";

type Props = {
  student: Student;
  icons: PecsIcon[];
  blocks: ScheduleBlock[];
};

const COOLDOWN_MS = 4000;

export default function StudentDevice({ student, icons, blocks }: Props) {
  const supabase = useMemo(() => getSupabase(), []);
  const [sending, setSending] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<Record<string, number>>({});
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const current = findCurrentBlock(blocks, now);
  const next = findNextBlock(blocks, now);

  async function tap(icon: PecsIcon) {
    const last = lastSentAt[icon.id];
    if (last && Date.now() - last < COOLDOWN_MS) return;
    setSending(icon.id);
    setError(null);
    const { error: e } = await supabase
      .from("pecs_requests")
      .insert({ student_id: student.id, icon_id: icon.id, status: "pending" });
    setSending(null);
    if (e) {
      setError(e.message);
      return;
    }
    setLastSentAt((m) => ({ ...m, [icon.id]: Date.now() }));
    setConfirmation(`Sent: ${icon.label}`);
    speak(`I want ${icon.label}`);
    window.setTimeout(() => setConfirmation(null), 2000);
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
    <main className="min-h-screen p-4 sm:p-6 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Hi, {student.full_name.split(" ")[0]}!
          </h1>
          <p className="text-[var(--muted)]">Tap a picture to ask.</p>
        </div>
        <Link href="/" className="btn btn-ghost">
          ← Back
        </Link>
      </header>

      <section className="card p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
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
        <div className="flex-1 min-w-[200px]">
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

      <div
        role="status"
        aria-live="polite"
        className="h-8 mb-2 text-center text-lg font-semibold text-[var(--good)]"
      >
        {confirmation}
      </div>
      {error && (
        <div className="text-center text-[var(--bad)] mb-3">{error}</div>
      )}

      <section
        aria-label="PECS board"
        className="grid gap-3 sm:gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        }}
      >
        {icons.map((icon) => {
          const last = lastSentAt[icon.id];
          const cooling = last && Date.now() - last < COOLDOWN_MS;
          return (
            <button
              key={icon.id}
              onClick={() => tap(icon)}
              disabled={sending === icon.id || Boolean(cooling)}
              className="pecs-tile disabled:opacity-50"
              aria-label={`Request ${icon.label}`}
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
