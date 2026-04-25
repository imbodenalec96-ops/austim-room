import { getSupabaseServer } from "@/lib/supabase/server";
import BoardEditor from "@/components/BoardEditor";
import type { Board } from "@/lib/types";

export const dynamic = "force-dynamic";

type Search = { template?: string };

export default async function NewBoardPage(props: {
  searchParams: Promise<Search>;
}) {
  const { template } = await props.searchParams;
  let initial:
    | Pick<Board, "id" | "title" | "kind" | "background" | "layout">
    | undefined;

  if (template) {
    const supabase = getSupabaseServer();
    const { data } = await supabase
      .from("boards")
      .select("id, title, kind, background, layout")
      .eq("id", template)
      .maybeSingle();
    if (data) {
      const src = data as Pick<
        Board,
        "id" | "title" | "kind" | "background" | "layout"
      >;
      initial = {
        ...src,
        // Clone with a clean title so it doesn't collide
        title: `${src.title} (copy)`,
      };
    }
  }

  // mode is "create" — initial just preloads the form
  return <BoardEditor mode="create" initial={initial} />;
}
