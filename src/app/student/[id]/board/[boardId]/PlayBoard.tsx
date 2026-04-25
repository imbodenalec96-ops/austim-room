"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { MatchingBoard } from "@/components/MatchingBoard";
import { getSupabase } from "@/lib/supabase/client";
import type { Board, Student } from "@/lib/types";

type Props = {
  student: Student;
  board: Board;
};

export default function PlayBoard({ student, board }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabase(), []);
  const [errorless, setErrorless] = useState<boolean>(
    board.layout.settings.errorless,
  );
  const [done, setDone] = useState<{
    correct: number;
    incorrect: number;
    sec: number;
  } | null>(null);
  // Bump key to force-remount the MatchingBoard when student presses Reset
  const [resetKey, setResetKey] = useState(0);

  async function handleComplete(r: {
    correctCount: number;
    incorrectCount: number;
    durationSec: number;
    audioUsed: boolean;
    errorless: boolean;
  }) {
    setDone({ correct: r.correctCount, incorrect: r.incorrectCount, sec: r.durationSec });
    speak("All done! Great job!");
    await supabase.from("board_attempts").insert({
      board_id: board.id,
      student_id: student.id,
      completed: true,
      correct_count: r.correctCount,
      incorrect_count: r.incorrectCount,
      duration_sec: r.durationSec,
      errorless: r.errorless,
      audio_used: r.audioUsed,
    });
  }

  function reset() {
    setDone(null);
    setResetKey((n) => n + 1);
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
    <main className="mx-auto max-w-5xl p-3 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={student.full_name} photoUrl={student.photo_url} size={48} />
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
              {student.full_name.split(" ")[0]}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              {board.title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <label className="chip cursor-pointer">
            <input
              type="checkbox"
              className="mr-1"
              checked={errorless}
              onChange={(e) => setErrorless(e.target.checked)}
            />
            Errorless
          </label>
          <button onClick={reset} className="btn btn-ghost btn-sm">
            ⟲ Reset
          </button>
          <Link
            href={`/student/${student.id}/boards`}
            className="btn btn-ghost btn-sm"
          >
            ← Boards
          </Link>
        </div>
      </header>

      {/* Key forces a fresh MatchingBoard on Reset (clears placements + shuffles) */}
      <MatchingBoard
        key={`${board.id}-${resetKey}`}
        title={board.title}
        layout={board.layout}
        background={board.background}
        errorlessOverride={errorless}
        onComplete={handleComplete}
      />

      {done && (
        <div
          className="card p-6 mt-6 flex flex-wrap items-center justify-between gap-4 alert-in"
          style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
        >
          <div>
            <p className="text-2xl font-bold text-[var(--good)]">
              ✓ All done!
            </p>
            <p className="text-[var(--muted)]">
              {done.correct} correct
              {done.incorrect > 0 && ` · ${done.incorrect} retries`} · {done.sec}s
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="btn btn-soft">
              Play again
            </button>
            <button
              onClick={() => router.push(`/student/${student.id}/boards`)}
              className="btn"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
