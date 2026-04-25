import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  MASTERY_BG,
  MASTERY_COLOR,
  MASTERY_LABEL,
  summarize,
} from "@/lib/mastery";
import type { Board, BoardAttempt, Student } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GradebookPage() {
  const supabase = getSupabaseServer();
  const [studentsRes, boardsRes, attemptsRes] = await Promise.all([
    supabase.from("students").select("*").order("full_name"),
    supabase
      .from("boards")
      .select("id, title, kind, background, layout")
      .order("created_at", { ascending: true }),
    supabase
      .from("board_attempts")
      .select(
        "id, board_id, student_id, completed, correct_count, incorrect_count, duration_sec, prompt_level, independence_level, errorless, audio_used, notes, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);
  const students = (studentsRes.data ?? []) as Student[];
  const boards = (boardsRes.data ?? []) as Pick<
    Board,
    "id" | "title" | "kind" | "background" | "layout"
  >[];
  const attempts = (attemptsRes.data ?? []) as BoardAttempt[];

  // Bucket attempts by (studentId, boardId)
  const buckets = new Map<string, BoardAttempt[]>();
  for (const a of attempts) {
    const k = `${a.student_id}::${a.board_id}`;
    const list = buckets.get(k) ?? [];
    list.push(a);
    buckets.set(k, list);
  }

  // Per-student aggregates for the side rail
  const perStudentSummary = students.map((s) => {
    let mastered = 0,
      emerging = 0,
      working = 0,
      plays = 0;
    for (const b of boards) {
      const arr = buckets.get(`${s.id}::${b.id}`) ?? [];
      const sm = summarize(arr);
      plays += sm.plays;
      if (sm.level === "mastered") mastered += 1;
      else if (sm.level === "emerging") emerging += 1;
      else if (sm.level === "working") working += 1;
    }
    return { student: s, mastered, emerging, working, plays };
  });

  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            Teacher
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Gradebook</h1>
          <p className="text-[var(--muted)] mt-1">
            Mastery across every student × every activity board. Click any
            cell to open that student's full grading view.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/teacher/boards" className="btn btn-ghost btn-sm">
            🧩 Boards
          </Link>
          <Link href="/teacher" className="btn btn-ghost btn-sm">
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Summary rail */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {perStudentSummary.map(({ student, mastered, emerging, working, plays }) => (
          <Link
            key={student.id}
            href={`/teacher/students/${student.id}/grades`}
            className="card card-hover p-4 flex items-center gap-3"
          >
            <Avatar name={student.full_name} photoUrl={student.photo_url} size={48} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{student.full_name}</p>
              <p className="text-sm text-[var(--muted)]">
                {plays} plays · {mastered} mastered
              </p>
            </div>
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{
                background: MASTERY_BG.mastered,
                color: MASTERY_COLOR.mastered,
              }}
            >
              {mastered}/{boards.length}
            </span>
          </Link>
        ))}
      </section>

      {/* Matrix */}
      <section className="card overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white p-3 text-left font-semibold border-b border-[var(--card-border)]">
                Student
              </th>
              {boards.map((b) => (
                <th
                  key={b.id}
                  className="p-3 text-left font-semibold border-b border-[var(--card-border)] whitespace-nowrap"
                >
                  <Link href={`/teacher/boards/${b.id}/edit`} className="hover:underline">
                    {b.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <th
                  scope="row"
                  className="sticky left-0 bg-white p-3 text-left font-medium border-b border-[var(--card-border)] whitespace-nowrap"
                >
                  <Link
                    href={`/teacher/students/${s.id}/grades`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    <Avatar
                      name={s.full_name}
                      photoUrl={s.photo_url}
                      size={28}
                    />
                    {s.full_name}
                  </Link>
                </th>
                {boards.map((b) => {
                  const arr = buckets.get(`${s.id}::${b.id}`) ?? [];
                  const sm = summarize(arr);
                  return (
                    <td
                      key={b.id}
                      className="p-1 border-b border-[var(--card-border)] align-top"
                    >
                      <Link
                        href={`/teacher/students/${s.id}/grades#board-${b.id}`}
                        className="block rounded-lg px-3 py-2 transition-colors hover:opacity-90"
                        style={{
                          background: MASTERY_BG[sm.level],
                          color: MASTERY_COLOR[sm.level],
                          border: `1px solid ${MASTERY_COLOR[sm.level]}33`,
                          minWidth: 110,
                        }}
                      >
                        <div className="text-xs uppercase tracking-wider font-bold">
                          {MASTERY_LABEL[sm.level]}
                        </div>
                        <div className="text-xs opacity-80">
                          {sm.plays}× ·{" "}
                          {sm.bestAccuracy > 0
                            ? `${Math.round(sm.bestAccuracy * 100)}%`
                            : "—"}
                        </div>
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Legend */}
      <section className="card p-3 flex flex-wrap gap-4 text-sm">
        {(["mastered", "emerging", "working", "untried"] as const).map((l) => (
          <div key={l} className="flex items-center gap-2">
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: MASTERY_BG[l],
                border: `1px solid ${MASTERY_COLOR[l]}55`,
              }}
            />
            <span style={{ color: MASTERY_COLOR[l] }}>
              {MASTERY_LABEL[l]}
            </span>
          </div>
        ))}
        <span className="text-[var(--muted)]">
          Mastered = 2+ clean completions, most recent also clean.
          Emerging = at least one completion. Working = plays without
          completion.
        </span>
      </section>
    </main>
  );
}
