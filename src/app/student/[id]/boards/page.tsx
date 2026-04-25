import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Avatar } from "@/components/Avatar";
import type { Board, Student } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function StudentBoardsPage(props: {
  params: Promise<Params>;
}) {
  const { id } = await props.params;
  const supabase = getSupabaseServer();
  const [studentRes, boardsRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("boards")
      .select("id, title, kind, background, layout")
      .order("created_at", { ascending: true }),
  ]);
  const student = studentRes.data as Student | null;
  if (!student) notFound();
  const boards = (boardsRes.data ?? []) as Pick<
    Board,
    "id" | "title" | "kind" | "background" | "layout"
  >[];

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Avatar name={student.full_name} photoUrl={student.photo_url} size={56} ring />
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              Activity boards
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {student.full_name.split(" ")[0]}'s boards
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/student/${student.id}`} className="btn btn-ghost btn-sm">
            ← PECS device
          </Link>
        </div>
      </header>

      {boards.length === 0 ? (
        <p className="card p-4 text-[var(--muted)]">
          No boards yet. Run <code>supabase/002_boards.sql</code>.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((b) => (
            <li key={b.id}>
              <Link
                href={`/student/${student.id}/board/${b.id}`}
                className="card card-hover p-4 flex flex-col gap-3 h-full"
              >
                <BoardThumbnail board={b} />
                <p className="font-semibold text-lg">{b.title}</p>
                <p className="text-sm text-[var(--muted)]">
                  {b.layout.tiles.length} pieces · {b.layout.zones.length} spots
                </p>
                <span className="mt-auto text-[var(--accent)] font-semibold">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function BoardThumbnail({
  board,
}: {
  board: Pick<Board, "kind" | "background" | "layout">;
}) {
  const samples = board.layout.tiles.slice(0, 5);
  return (
    <div
      className="rounded-xl flex items-center justify-center gap-1 p-3"
      style={{
        background: board.background ?? "#fffaf0",
        height: 88,
        border: "1px solid var(--card-border)",
      }}
    >
      {samples.map((t) => (
        <div
          key={t.id}
          className="rounded-lg flex items-center justify-center"
          style={{
            background: t.color ?? "white",
            width: 48,
            height: 48,
            border: "1px solid rgba(0,0,0,0.08)",
            fontSize: t.emoji ? 22 : 18,
            fontWeight: 700,
          }}
        >
          {t.emoji ?? t.label}
        </div>
      ))}
    </div>
  );
}
