import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Board, BoardAttempt, Student } from "@/lib/types";

export const dynamic = "force-dynamic";

type AttemptRow = Pick<
  BoardAttempt,
  "board_id" | "student_id" | "correct_count" | "incorrect_count" | "duration_sec" | "completed" | "created_at"
>;

export default async function TeacherBoardsPage() {
  const supabase = getSupabaseServer();
  const [boardsRes, attemptsRes, studentsRes] = await Promise.all([
    supabase
      .from("boards")
      .select("id, title, kind, background, layout, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("board_attempts")
      .select("board_id, student_id, correct_count, incorrect_count, duration_sec, completed, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("students").select("id, full_name"),
  ]);
  const boards = (boardsRes.data ?? []) as Pick<
    Board,
    "id" | "title" | "kind" | "background" | "layout" | "created_at"
  >[];
  const attempts = (attemptsRes.data ?? []) as AttemptRow[];
  const students = (studentsRes.data ?? []) as Pick<Student, "id" | "full_name">[];

  // Aggregate per board
  const stats = new Map<string, { plays: number; completions: number; totalCorrect: number; totalIncorrect: number; lastAt?: string }>();
  for (const a of attempts) {
    const s = stats.get(a.board_id) ?? { plays: 0, completions: 0, totalCorrect: 0, totalIncorrect: 0 };
    s.plays += 1;
    if (a.completed) s.completions += 1;
    s.totalCorrect += a.correct_count ?? 0;
    s.totalIncorrect += a.incorrect_count ?? 0;
    if (!s.lastAt || a.created_at > s.lastAt) s.lastAt = a.created_at;
    stats.set(a.board_id, s);
  }

  return (
    <main className="mx-auto max-w-6xl p-5 sm:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            Teacher
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Activity boards</h1>
          <p className="text-[var(--muted)] mt-1">
            Drag-and-drop matching boards. Tap any board to preview as a teacher.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/teacher" className="btn btn-ghost btn-sm">
            ← Dashboard
          </Link>
        </div>
      </header>

      {boards.length === 0 ? (
        <p className="card p-4 text-[var(--muted)]">
          No boards yet. Run <code>supabase/002_boards.sql</code>.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => {
            const s = stats.get(b.id);
            return (
              <li key={b.id} className="card p-4 flex flex-col gap-3">
                <div
                  className="rounded-xl flex items-center justify-center gap-1 p-3"
                  style={{
                    background: b.background ?? "#fffaf0",
                    height: 96,
                    border: "1px solid var(--card-border)",
                  }}
                >
                  {b.layout.tiles.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg flex items-center justify-center"
                      style={{
                        background: t.color ?? "white",
                        width: 52,
                        height: 52,
                        border: "1px solid rgba(0,0,0,0.08)",
                        fontSize: t.emoji ? 22 : 18,
                        fontWeight: 700,
                      }}
                    >
                      {t.emoji ?? t.label}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">{b.title}</p>
                  <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                    {b.kind}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  {b.layout.tiles.length} pieces · {b.layout.zones.length} spots ·{" "}
                  {s?.plays ?? 0} plays · {s?.completions ?? 0} completions
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {students.slice(0, 4).map((st) => (
                    <Link
                      key={st.id}
                      href={`/student/${st.id}/board/${b.id}`}
                      className="chip"
                      style={{
                        background: "var(--bg-soft)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      Try as {st.full_name.split(" ")[0]} →
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
