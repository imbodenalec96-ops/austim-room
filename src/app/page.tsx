import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type StudentRow = { id: string; full_name: string; grade: string | null; photo_url: string | null };

export default async function Home() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("students")
    .select("id, full_name, grade, photo_url")
    .order("full_name");
  const students = (data ?? []) as StudentRow[];

  return (
    <main className="mx-auto max-w-5xl p-6 sm:p-10 space-y-12">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          Autism Classroom Platform
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Classroom Board
        </h1>
        <p className="text-[var(--muted)] text-lg max-w-2xl">
          One real-time system across the TV, the teacher, and every student
          device. Schedule on the wall, requests in the air, data on the
          dashboard — all in sync.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/board"
          className="card card-hover p-6 sm:p-8 flex flex-col gap-3"
        >
          <span className="text-4xl" aria-hidden>📺</span>
          <h2 className="text-2xl font-semibold">TV Board</h2>
          <p className="text-[var(--muted)]">
            Open this on the classroom TV. Auto-shows current block, what's
            next, transition warnings, and live PECS requests with photos and
            announcements.
          </p>
          <span className="mt-auto text-[var(--accent)] font-semibold">
            Open the board →
          </span>
        </Link>
        <Link
          href="/teacher"
          className="card card-hover p-6 sm:p-8 flex flex-col gap-3"
        >
          <span className="text-4xl" aria-hidden>👩‍🏫</span>
          <h2 className="text-2xl font-semibold">Teacher Dashboard</h2>
          <p className="text-[var(--muted)]">
            Live request queue with one-tap status updates, today's schedule
            at a glance, and the full student roster.
          </p>
          <span className="mt-auto text-[var(--accent)] font-semibold">
            Open the dashboard →
          </span>
        </Link>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold">Student devices</h2>
            <p className="text-[var(--muted)]">
              Open one of these on the student's iPad or Chromebook.
            </p>
          </div>
          <Link href="/teacher/students" className="btn btn-ghost btn-sm">
            Roster →
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <li key={s.id}>
              <Link
                href={`/student/${s.id}`}
                className="card card-hover p-4 flex items-center gap-3"
              >
                <Avatar name={s.full_name} photoUrl={s.photo_url} size={48} />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{s.full_name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {s.grade ? `Grade ${s.grade}` : "—"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
          {students.length === 0 && (
            <li className="card p-4 text-[var(--muted)] sm:col-span-2 lg:col-span-3">
              No students yet. Run <code>supabase/schema.sql</code> in the
              Supabase SQL editor to load the seed data.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
