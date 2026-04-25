import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import StudentGradebook from "./StudentGradebook";
import type { Board, BoardAttempt, Student } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function StudentGradesPage(props: {
  params: Promise<Params>;
}) {
  const { id } = await props.params;
  const supabase = getSupabaseServer();
  const [studentRes, boardsRes, attemptsRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("boards")
      .select("id, title, kind, background, layout")
      .order("created_at", { ascending: true }),
    supabase
      .from("board_attempts")
      .select("*")
      .eq("student_id", id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);
  const student = studentRes.data as Student | null;
  if (!student) notFound();
  const boards = (boardsRes.data ?? []) as Pick<
    Board,
    "id" | "title" | "kind" | "background" | "layout"
  >[];
  const attempts = (attemptsRes.data ?? []) as BoardAttempt[];

  return (
    <StudentGradebook
      student={student}
      boards={boards}
      initialAttempts={attempts}
    />
  );
}
