import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  Assignment,
  PecsIcon,
  PecsRequest,
  Student,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function StudentProfilePage(props: {
  params: Promise<Params>;
}) {
  const { id } = await props.params;
  const supabase = getSupabaseServer();

  const [studentRes, iconsRes, requestsRes, assignmentsRes] =
    await Promise.all([
      supabase.from("students").select("*").eq("id", id).maybeSingle(),
      supabase.from("pecs_icons").select("*"),
      supabase
        .from("pecs_requests")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("assignments")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: false }),
    ]);

  const student = studentRes.data as Student | null;
  if (!student) notFound();

  const icons = (iconsRes.data ?? []) as PecsIcon[];
  const requests = (requestsRes.data ?? []) as PecsRequest[];
  const assignments = (assignmentsRes.data ?? []) as Assignment[];

  const goals = (student.goals ?? []) as string[];
  const reinforcers = (student.reinforcers ?? []) as string[];
  const sensory = (student.sensory_supports ?? []) as string[];
  const prompts = (student.prompt_hierarchy ?? []) as string[];

  return (
    <main className="mx-auto max-w-5xl p-5 sm:p-8 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar name={student.full_name} photoUrl={student.photo_url} size={72} ring />
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              Student profile
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {student.full_name}
            </h1>
            <p className="text-[var(--muted)]">
              {student.grade ? `Grade ${student.grade}` : "—"}
              {student.communication_mode && ` · ${student.communication_mode}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/student/${student.id}`} className="btn btn-soft btn-sm">
            🪄 Open device view
          </Link>
          <Link href="/teacher/students" className="btn btn-ghost btn-sm">
            ← Roster
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Goals">
          {goals.length === 0 ? (
            <Empty>No goals listed.</Empty>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {goals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Reinforcers">
          {reinforcers.length === 0 ? (
            <Empty>None listed.</Empty>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {reinforcers.map((r, i) => (
                <li key={i} className="chip">{r}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Sensory supports">
          {sensory.length === 0 ? (
            <Empty>None listed.</Empty>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {sensory.map((r, i) => (
                <li key={i} className="chip">{r}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Prompt hierarchy">
          {prompts.length === 0 ? (
            <Empty>Not set.</Empty>
          ) : (
            <ol className="space-y-1">
              {prompts.map((p, i) => (
                <li key={i}>
                  <span className="text-[var(--muted)] mr-2">{i + 1}.</span>
                  {p}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Recent PECS requests ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <p className="card p-4 text-[var(--muted)]">
            No requests logged yet.
          </p>
        ) : (
          <ul className="card divide-y divide-[var(--card-border)]">
            {requests.map((r) => {
              const icon = icons.find((i) => i.id === r.icon_id);
              const dt = new Date(r.created_at);
              return (
                <li
                  key={r.id}
                  className="p-3 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl" aria-hidden>
                      {icon?.emoji ?? "🖼️"}
                    </span>
                    <span className="font-medium truncate">
                      wants {icon?.label ?? "—"}
                    </span>
                    <span className="text-[var(--muted)] text-sm">
                      {dt.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                    {r.status.replace("_", " ")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Assignments ({assignments.length})
        </h2>
        {assignments.length === 0 ? (
          <p className="card p-4 text-[var(--muted)]">
            No assignments yet.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {assignments.map((a) => (
              <li key={a.id} className="card p-4">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {a.domain && <span>{a.domain}</span>}
                  {a.difficulty != null && (
                    <span> · level {a.difficulty}</span>
                  )}
                  {a.support_level && <span> · {a.support_level}</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4">
      <h3 className="text-sm uppercase tracking-widest text-[var(--muted)] mb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[var(--muted)] italic">{children}</p>;
}
