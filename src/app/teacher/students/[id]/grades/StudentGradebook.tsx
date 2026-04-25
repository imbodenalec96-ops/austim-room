"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ConnectionPill, useChannelState } from "@/lib/useConnection";
import { getSupabase } from "@/lib/supabase/client";
import {
  MASTERY_BG,
  MASTERY_COLOR,
  MASTERY_LABEL,
  PROMPT_LABEL,
  PROMPT_LEVELS,
  summarize,
  type PromptLevel,
} from "@/lib/mastery";
import type { Board, BoardAttempt, Student } from "@/lib/types";

type Props = {
  student: Student;
  boards: Pick<Board, "id" | "title" | "kind" | "background" | "layout">[];
  initialAttempts: BoardAttempt[];
};

type GradeForm = {
  prompt_level: string;
  independence_level: number | null;
  notes: string;
};

export default function StudentGradebook({
  student,
  boards,
  initialAttempts,
}: Props) {
  const supabase = useMemo(() => getSupabase(), []);
  const [attempts, setAttempts] = useState<BoardAttempt[]>(initialAttempts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Realtime: pick up new attempts and any updates to existing ones
  const conn = useChannelState(
    () =>
      supabase
        .channel(`grades-${student.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "board_attempts",
            filter: `student_id=eq.${student.id}`,
          },
          (payload) => {
            const row = payload.new as BoardAttempt;
            setAttempts((cur) => [row, ...cur].slice(0, 200));
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "board_attempts",
            filter: `student_id=eq.${student.id}`,
          },
          (payload) => {
            const row = payload.new as BoardAttempt;
            setAttempts((cur) =>
              cur.map((a) => (a.id === row.id ? row : a)),
            );
          },
        ),
    [supabase, student.id],
  );

  const boardById = useMemo(() => {
    const m = new Map<string, Props["boards"][number]>();
    boards.forEach((b) => m.set(b.id, b));
    return m;
  }, [boards]);

  // Group attempts by board for the summary cards
  const byBoard = useMemo(() => {
    const m = new Map<string, BoardAttempt[]>();
    for (const a of attempts) {
      const list = m.get(a.board_id) ?? [];
      list.push(a);
      m.set(a.board_id, list);
    }
    return m;
  }, [attempts]);

  async function saveGrade(id: string, patch: Partial<BoardAttempt>) {
    setSavingId(id);
    setAttempts((cur) =>
      cur.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
    const { error } = await supabase
      .from("board_attempts")
      .update(patch)
      .eq("id", id);
    setSavingId(null);
    if (error) {
      window.alert(`Couldn't save: ${error.message}`);
      return;
    }
    setSavedId(id);
    window.setTimeout(
      () => setSavedId((s) => (s === id ? null : s)),
      1600,
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-5 sm:p-8 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={student.full_name} photoUrl={student.photo_url} size={64} ring />
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              Grades
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {student.full_name}
            </h1>
            <p className="text-[var(--muted)]">
              {attempts.length} attempts logged
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <ConnectionPill status={conn.status} detail={conn.detail} />
          <Link
            href={`/teacher/students/${student.id}`}
            className="btn btn-ghost btn-sm"
          >
            Profile
          </Link>
          <Link href="/teacher/gradebook" className="btn btn-ghost btn-sm">
            Class gradebook
          </Link>
        </div>
      </header>

      {/* Per-board mastery cards */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Boards</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => {
            const arr = byBoard.get(b.id) ?? [];
            const sm = summarize(arr);
            return (
              <li
                key={b.id}
                id={`board-${b.id}`}
                className="card p-4 flex flex-col gap-2"
                style={{ borderColor: `${MASTERY_COLOR[sm.level]}55` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{b.title}</p>
                  <span
                    className="text-xs uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{
                      background: MASTERY_BG[sm.level],
                      color: MASTERY_COLOR[sm.level],
                    }}
                  >
                    {MASTERY_LABEL[sm.level]}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  {sm.plays} plays · {sm.completions} completed ·{" "}
                  {sm.bestAccuracy > 0
                    ? `${Math.round(sm.bestAccuracy * 100)}% best`
                    : "no scored play"}
                </p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Link
                    href={`/student/${student.id}/board/${b.id}`}
                    className="btn btn-soft btn-sm"
                  >
                    Play as {student.full_name.split(" ")[0]}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Attempt log with inline grading */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recent attempts</h2>
        {attempts.length === 0 ? (
          <p className="card p-4 text-[var(--muted)]">
            No attempts logged yet. Have {student.full_name.split(" ")[0]}{" "}
            play a board to start collecting data.
          </p>
        ) : (
          <ul className="space-y-3">
            {attempts.map((a) => (
              <AttemptRow
                key={a.id}
                attempt={a}
                board={boardById.get(a.board_id)}
                onSave={(patch) => saveGrade(a.id, patch)}
                saving={savingId === a.id}
                justSaved={savedId === a.id}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function AttemptRow({
  attempt,
  board,
  onSave,
  saving,
  justSaved,
}: {
  attempt: BoardAttempt;
  board: { title: string } | undefined;
  onSave: (patch: Partial<BoardAttempt>) => void;
  saving: boolean;
  justSaved: boolean;
}) {
  const [form, setForm] = useState<GradeForm>({
    prompt_level: attempt.prompt_level ?? "",
    independence_level: attempt.independence_level ?? null,
    notes: attempt.notes ?? "",
  });
  const initialRef = useRef(form);

  // Reset local form if the attempt updates externally (e.g. another tab)
  useEffect(() => {
    const next: GradeForm = {
      prompt_level: attempt.prompt_level ?? "",
      independence_level: attempt.independence_level ?? null,
      notes: attempt.notes ?? "",
    };
    setForm(next);
    initialRef.current = next;
  }, [attempt.id, attempt.prompt_level, attempt.independence_level, attempt.notes]);

  const dirty =
    form.prompt_level !== (initialRef.current.prompt_level ?? "") ||
    form.independence_level !== (initialRef.current.independence_level ?? null) ||
    form.notes !== (initialRef.current.notes ?? "");

  const total = (attempt.correct_count ?? 0) + (attempt.incorrect_count ?? 0);
  const accuracy = total > 0 ? (attempt.correct_count ?? 0) / total : 0;
  const dt = new Date(attempt.created_at);

  return (
    <li className="card p-4 grid gap-3 md:grid-cols-[1fr_1fr] md:items-start">
      {/* Left: facts */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-lg">
            {board?.title ?? "Board"}
          </p>
          {attempt.completed && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: MASTERY_BG.mastered,
                color: MASTERY_COLOR.mastered,
              }}
            >
              ✓ Completed
            </span>
          )}
          {attempt.errorless && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)] font-semibold">
              Errorless
            </span>
          )}
          {attempt.audio_used && (
            <span className="text-xs text-[var(--muted)]">🔊 audio</span>
          )}
        </div>
        <p className="text-sm text-[var(--muted)]">
          {dt.toLocaleString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <p className="text-sm">
          <strong>{attempt.correct_count ?? 0}</strong> correct ·{" "}
          <strong>{attempt.incorrect_count ?? 0}</strong> retries ·{" "}
          {attempt.duration_sec ?? 0}s · {Math.round(accuracy * 100)}%
        </p>
      </div>

      {/* Right: grade form */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-widest text-[var(--muted)] w-24">
            Prompt
          </span>
          <select
            className="input w-auto"
            value={form.prompt_level}
            onChange={(e) =>
              setForm((f) => ({ ...f, prompt_level: e.target.value }))
            }
          >
            <option value="">—</option>
            {PROMPT_LEVELS.map((p) => (
              <option key={p} value={p}>
                {PROMPT_LABEL[p as PromptLevel]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-widest text-[var(--muted)] w-24">
            Independence
          </span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  independence_level: f.independence_level === n ? null : n,
                }))
              }
              className={`chip ${form.independence_level === n ? "chip-active" : ""}`}
              aria-pressed={form.independence_level === n}
              style={{ minWidth: 36 }}
            >
              {n}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-[var(--muted)] block mb-1">
            Notes
          </label>
          <textarea
            className="input"
            rows={2}
            placeholder="Behavior, prompts faded, supports used…"
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          {justSaved && (
            <span className="text-sm text-[var(--good)]">✓ Saved</span>
          )}
          <button
            type="button"
            onClick={() =>
              onSave({
                prompt_level: form.prompt_level || null,
                independence_level: form.independence_level,
                notes: form.notes.trim() || null,
              })
            }
            disabled={saving || !dirty}
            className="btn btn-sm"
          >
            {saving ? "Saving…" : "Save grade"}
          </button>
        </div>
      </div>
    </li>
  );
}
