import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = getSupabaseServer();
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, grade")
    .order("full_name");

  return (
    <main className="mx-auto max-w-4xl p-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Classroom Board</h1>
        <p className="text-[var(--muted)] text-lg">
          Pick a view. The board, the teacher dashboard, and student devices all
          stay in sync in real time.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/board" className="card p-6 hover:border-[var(--accent)]">
          <h2 className="text-2xl font-semibold mb-1">📺 TV Board</h2>
          <p className="text-[var(--muted)]">
            Open this on the classroom TV. Auto-shows current block, next block,
            and live PECS requests.
          </p>
        </Link>
        <Link href="/teacher" className="card p-6 hover:border-[var(--accent)]">
          <h2 className="text-2xl font-semibold mb-1">👩‍🏫 Teacher Dashboard</h2>
          <p className="text-[var(--muted)]">
            See live PECS requests. Mark them complete, denied, or in progress.
          </p>
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Student devices</h2>
        <p className="text-[var(--muted)]">
          Open the link for a student on their iPad / Chromebook. Tapping a PECS
          icon broadcasts to the TV board instantly.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {(students ?? []).map((s) => (
            <li key={s.id}>
              <Link
                href={`/student/${s.id}`}
                className="card p-4 flex items-center justify-between hover:border-[var(--accent)]"
              >
                <span className="font-semibold">{s.full_name}</span>
                <span className="text-[var(--muted)]">Grade {s.grade}</span>
              </Link>
            </li>
          ))}
          {(students ?? []).length === 0 && (
            <li className="card p-4 text-[var(--muted)]">
              No students yet. Run <code>supabase/schema.sql</code> in the
              Supabase SQL editor to load the seed data.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
