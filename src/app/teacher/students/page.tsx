import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Student } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("students")
    .select("*")
    .order("full_name");
  const students = (data ?? []) as Student[];

  return (
    <main className="mx-auto max-w-5xl p-5 sm:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            Teacher
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Roster</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/teacher" className="btn btn-ghost btn-sm">
            ← Dashboard
          </Link>
        </div>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => {
          const goals = (s.goals ?? []) as string[];
          return (
            <li key={s.id}>
              <Link
                href={`/teacher/students/${s.id}`}
                className="card card-hover p-4 flex flex-col gap-3 h-full"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={s.full_name} photoUrl={s.photo_url} size={56} ring />
                  <div className="min-w-0">
                    <p className="font-semibold text-lg truncate">
                      {s.full_name}
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      {s.grade ? `Grade ${s.grade}` : "—"}
                      {s.communication_mode && ` · ${s.communication_mode}`}
                    </p>
                  </div>
                </div>
                {goals.length > 0 && (
                  <ul className="text-sm text-[var(--muted)] space-y-1 list-disc list-inside">
                    {goals.slice(0, 2).map((g, i) => (
                      <li key={i} className="truncate">{g}</li>
                    ))}
                  </ul>
                )}
              </Link>
            </li>
          );
        })}
        {students.length === 0 && (
          <li className="card p-4 text-[var(--muted)] sm:col-span-2 lg:col-span-3">
            No students yet. Run <code>supabase/schema.sql</code>.
          </li>
        )}
      </ul>
    </main>
  );
}
