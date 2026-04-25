import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import StudentDevice from "./StudentDevice";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function StudentPage(props: {
  params: Promise<Params>;
}) {
  const { id } = await props.params;
  const supabase = getSupabaseServer();

  const [studentRes, iconsRes, blocksRes] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).maybeSingle(),
    supabase.from("pecs_icons").select("*").order("sort_order"),
    supabase
      .from("schedule_blocks")
      .select("*")
      .is("student_id", null)
      .order("starts_at"),
  ]);

  if (!studentRes.data) notFound();

  return (
    <StudentDevice
      student={studentRes.data}
      icons={iconsRes.data ?? []}
      blocks={blocksRes.data ?? []}
    />
  );
}
