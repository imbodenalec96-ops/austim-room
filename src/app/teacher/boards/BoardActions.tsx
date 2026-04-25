"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";

export default function BoardActions({
  boardId,
  title,
}: {
  boardId: string;
  title: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabase(), []);
  const [busy, setBusy] = useState(false);

  async function deleteIt() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusy(true);
    const { error } = await supabase.from("boards").delete().eq("id", boardId);
    setBusy(false);
    if (error) {
      window.alert(`Couldn't delete: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/teacher/boards/${boardId}/edit`}
        className="btn btn-soft btn-sm"
      >
        Edit
      </Link>
      <Link
        href={`/teacher/boards/new?template=${boardId}`}
        className="btn btn-ghost btn-sm"
      >
        Duplicate
      </Link>
      <button
        type="button"
        onClick={deleteIt}
        disabled={busy}
        className="btn btn-ghost btn-sm"
        style={{ color: "var(--bad)" }}
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
