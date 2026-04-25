"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import type {
  PecsIcon,
  PecsRequest,
  RequestStatus,
  Student,
} from "@/lib/types";

type EnrichedRequest = PecsRequest & {
  studentName: string;
  iconLabel: string;
  iconEmoji: string | null;
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  denied: "Denied",
  redirected: "Redirected",
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  pending: "#d4a04a",
  in_progress: "#4f7a9b",
  completed: "#6ea36e",
  denied: "#c76b6b",
  redirected: "#8a8a8a",
};

export default function TeacherPage() {
  const supabase = useMemo(() => getSupabase(), []);
  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [icons, setIcons] = useState<PecsIcon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, i] = await Promise.all([
        supabase.from("students").select("*"),
        supabase.from("pecs_icons").select("*"),
      ]);
      if (cancelled) return;
      const studentsArr = s.data ?? [];
      const iconsArr = i.data ?? [];
      setStudents(studentsArr);
      setIcons(iconsArr);

      const { data: reqs } = await supabase
        .from("pecs_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (cancelled) return;
      setRequests(
        (reqs ?? []).map((r) => enrich(r, studentsArr, iconsArr)),
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Realtime: stream new + updated requests
  useEffect(() => {
    if (students.length === 0 || icons.length === 0) return;
    const channel = supabase
      .channel("teacher-pecs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "pecs_requests" },
        (payload) => {
          const row = payload.new as PecsRequest;
          setRequests((cur) => [enrich(row, students, icons), ...cur].slice(0, 50));
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pecs_requests" },
        (payload) => {
          const row = payload.new as PecsRequest;
          setRequests((cur) =>
            cur.map((r) => (r.id === row.id ? enrich(row, students, icons) : r)),
          );
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, students, icons]);

  async function setStatus(id: string, status: RequestStatus) {
    const patch: Partial<PecsRequest> = {
      status,
      resolved_at:
        status === "completed" || status === "denied" || status === "redirected"
          ? new Date().toISOString()
          : null,
    };
    setRequests((cur) =>
      cur.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
    await supabase.from("pecs_requests").update(patch).eq("id", id);
  }

  const pending = requests.filter((r) => r.status === "pending");
  const inProgress = requests.filter((r) => r.status === "in_progress");
  const recent = requests.filter(
    (r) => r.status !== "pending" && r.status !== "in_progress",
  );

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-[var(--muted)]">
            Live PECS requests. Updates instantly across devices.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/board" className="btn btn-soft">
            📺 Open TV Board
          </Link>
          <Link href="/" className="btn btn-ghost">
            ← Home
          </Link>
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Pending ({pending.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {pending.map((r) => (
            <RequestCard key={r.id} req={r} onStatus={setStatus} />
          ))}
          {!loading && pending.length === 0 && (
            <p className="card p-4 text-[var(--muted)]">No pending requests.</p>
          )}
        </div>
      </section>

      {inProgress.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">
            In progress ({inProgress.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {inProgress.map((r) => (
              <RequestCard key={r.id} req={r} onStatus={setStatus} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Recent ({recent.length})
        </h2>
        <ul className="card divide-y divide-[var(--card-border)]">
          {recent.map((r) => (
            <li
              key={r.id}
              className="p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>
                  {r.iconEmoji ?? "🖼️"}
                </span>
                <span className="font-medium">{r.studentName}</span>
                <span className="text-[var(--muted)]">wants {r.iconLabel}</span>
              </div>
              <span
                className="text-xs uppercase tracking-wider px-2 py-1 rounded-full"
                style={{
                  background: STATUS_COLOR[r.status] + "22",
                  color: STATUS_COLOR[r.status],
                }}
              >
                {STATUS_LABEL[r.status]}
              </span>
            </li>
          ))}
          {recent.length === 0 && (
            <li className="p-4 text-[var(--muted)]">Nothing yet.</li>
          )}
        </ul>
      </section>
    </main>
  );
}

function enrich(
  r: PecsRequest,
  students: Student[],
  icons: PecsIcon[],
): EnrichedRequest {
  const s = students.find((x) => x.id === r.student_id);
  const i = icons.find((x) => x.id === r.icon_id);
  return {
    ...r,
    studentName: s?.full_name ?? "Unknown student",
    iconLabel: i?.label ?? "unknown",
    iconEmoji: i?.emoji ?? null,
  };
}

function RequestCard({
  req,
  onStatus,
}: {
  req: EnrichedRequest;
  onStatus: (id: string, s: RequestStatus) => void;
}) {
  const ageSec = Math.max(
    0,
    Math.floor((Date.now() - new Date(req.created_at).getTime()) / 1000),
  );
  return (
    <article className="card p-4">
      <div className="flex items-center gap-4">
        <span className="text-5xl" aria-hidden>
          {req.iconEmoji ?? "🖼️"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold truncate">
            {req.studentName} wants {req.iconLabel}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {ageSec < 60 ? `${ageSec}s ago` : `${Math.floor(ageSec / 60)}m ago`}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="btn btn-soft"
          onClick={() => onStatus(req.id, "in_progress")}
        >
          On it
        </button>
        <button className="btn" onClick={() => onStatus(req.id, "completed")}>
          ✅ Done
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => onStatus(req.id, "redirected")}
        >
          ↩︎ Redirect
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => onStatus(req.id, "denied")}
          style={{ color: "var(--bad)" }}
        >
          ✖ Deny
        </button>
      </div>
    </article>
  );
}
