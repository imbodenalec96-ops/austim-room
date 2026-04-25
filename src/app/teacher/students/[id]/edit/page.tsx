import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import StudentForm from "../../StudentForm";
import type { Student } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditStudentPage(props: {
  params: Promise<Params>;
}) {
  const { id } = await props.params;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  return <StudentForm mode="edit" initial={data as Student} />;
}
