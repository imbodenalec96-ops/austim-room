import { getSupabaseServer } from "@/lib/supabase/server";
import ScheduleEditor from "./ScheduleEditor";
import type { ScheduleBlock, Student } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const supabase = getSupabaseServer();
  const [blocksRes, studentsRes] = await Promise.all([
    supabase
      .from("schedule_blocks")
      .select("*")
      .order("day_of_week")
      .order("starts_at"),
    supabase.from("students").select("id, full_name").order("full_name"),
  ]);
  const blocks = (blocksRes.data ?? []) as ScheduleBlock[];
  const students = (studentsRes.data ?? []) as Pick<Student, "id" | "full_name">[];
  return <ScheduleEditor initialBlocks={blocks} students={students} />;
}
