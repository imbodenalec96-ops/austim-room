import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import PlayBoard from "./PlayBoard";
import type { Board, Student } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string; boardId: string };

export default async function PlayBoardPage(props: {
  params: Promise<Params>;
}) {
  const { id, boardId } = await props.params;
  const supabase = getSupabaseServer();
  const [studentRes, boardRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).maybeSingle(),
    supabase.from("boards").select("*").eq("id", boardId).maybeSingle(),
  ]);
  const student = studentRes.data as Student | null;
  const board = boardRes.data as Board | null;
  if (!student || !board) notFound();

  return <PlayBoard student={student} board={board} />;
}
