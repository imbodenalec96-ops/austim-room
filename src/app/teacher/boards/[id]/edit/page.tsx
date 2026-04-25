import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import BoardEditor from "@/components/BoardEditor";
import type { Board } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditBoardPage(props: {
  params: Promise<Params>;
}) {
  const { id } = await props.params;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("boards")
    .select("id, title, kind, background, layout")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const board = data as Pick<
    Board,
    "id" | "title" | "kind" | "background" | "layout"
  >;
  return <BoardEditor mode="edit" initial={board} />;
}
