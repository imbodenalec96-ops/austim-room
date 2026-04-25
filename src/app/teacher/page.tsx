"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getSupabase } from "@/lib/supabase/client";
import { carrierFor } from "@/lib/carrier";
import { ConnectionPill, useChannelState } from "@/lib/useConnection";
import {
  blocksForToday,
  DAY_NAMES,
  findCurrentBlock,
  findNextBlock,
  formatTime,
  minutesUntil,
  pickDayOfWeek,
} from "@/lib/schedule";
import type {
  PecsIcon,
  PecsRequest,
  RequestStatus,
  ScheduleBlock,
  Student,
} from "@/lib/types";

type EnrichedRequest = PecsRequest & {
  student: Student | null;
  icon: PecsIcon | null;
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
  denied: "Denied",
  redirected: "Redirected",
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  pending: "#c98a2f",
  in_progress: "#4f7a9b",
  completed: "#5f9b5f",
  denied: "#c76b6b",
  redirected: "#8a8a8a",
};

export default function TeacherPage() {
  const supabase = useMemo(() => getSupabase(), []);
  const [requests, setRequests] = useState<EnrichedRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [icons, setIcons] = useState<PecsIcon[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const studentsRef = useRef<Student[]>([]);
  const iconsRef = useRef<PecsIcon[]>([]);

  useEffect(() => { studentsRef.current = students; }, [students]);
  useEffect(() => { iconsRef.current = icons; }, [icons]);

  // Tick clock for live ages and current-block highlight
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, i, b] = await Promise.all([
        supabase.from("students").select("*"),
        supabase.from("pecs_icons").select("*"),
        supabase
          .from("schedule_blocks")
          .select("*")
          .is("student_id", null)
          .order("starts_at"),
      ]);
      if (cancelled) return;
      const sArr = (s.data ?? []) as Student[];
      const iArr = (i.data ?? []) as PecsIcon[];
      const bArr = (b.data ?? []) as ScheduleBlock[];
      setStudents(sArr);
      setIcons(iArr);
      setBlocks(bArr);

      const { data: reqs } = await supabase
        .from("pecs_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      if (cancelled) return;
      setRequests(((reqs ?? []) as PecsRequest[]).map((r) => enrich(r, sArr, iArr)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const conn = useChannelState(
    () =>
      supabase
        .channel("teacher-pecs")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "pecs_requests" },
          (payload) => {
            const row = payload.new as PecsRequest;
            setRequests((cur) => {
              if (cur.some((r) => r.id === row.id)) return cur;
              return [enrich(row, studentsRef.current, iconsRef.current), ...cur].slice(0, 60);
            });
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "pecs_requests" },
          (payload) => {
            const row = payload.new as PecsRequest;
            setRequests((cur) =>
              cur.map((r) =>
                r.id === row.id ? enrich(row, studentsRef.current, iconsRef.current) : r,
              ),
            );
          },
        ),
    [supabase],
  );

  // Polling fallback for when realtime is broken
  useEffect(() => {
    let cancelled = false;
    const POLL_MS = 4000;
    const tick = async () => {
      const { data, error } = await supabase
        .from("pecs_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      if (cancelled || error || !data) return;
      const rows = data as PecsRequest[];
      setRequests((cur) => {
        const byId = new Map(cur.map((r) => [r.id, r]));
        for (const r of rows) byId.set(r.id, enrich(r, studentsRef.current, iconsRef.current));
        return Array.from(byId.values())
          .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
          .slice(0, 60);
      });
    };
    const t = window.setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

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
  const recent = requests
    .filter((r) => r.status !== "pending" && r.status !== "in_progress")
    .slice(0, 12);

  const current = findCurrentBlock(blocks, now);
  const next = findNextBlock(blocks, now);
  const todaysBlocks = blocksForToday(blocks, now);
  const dayInfo = pickDayOfWeek(blocks, now);
  const minsLeft = current ? minutesUntil(current.ends_at, now) : null;

  // Per-student today counts
  const todayKey = now.toISOString().slice(0, 10);
  const perStudentToday: Record<string, number> = {};
  for (const r of requests) {
    if (!r.created_at.startsWith(todayKey)) continue;
    perStudentToday[r.student_id] = (perStudentToday[r.student_id] ?? 0) + 1;
  }

  return (
    <main className="mx-auto max-w-6xl p-5 sm:p-8 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            Teacher
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <ConnectionPill status={conn.status} detail={conn.detail} />
          <Link href="/teacher/students" className="btn btn-ghost btn-sm">
            👥 Roster
          </Link>
          <Link href="/teacher/schedule" className="btn btn-ghost btn-sm">
            📅 Schedule
          </Link>
          <Link href="/teacher/boards" className="btn btn-ghost btn-sm">
            🧩 Boards
          </Link>
          <Link href="/teacher/gradebook" className="btn btn-ghost btn-sm">
            📊 Gradebook
          </Link>
          <Link href="/board" className="btn btn-soft btn-sm">
            📺 TV Board
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Home
          </Link>
        </div>
      </header>

      {/* Today's schedule strip */}
      <section className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
            {dayInfo.isFallback
              ? `No ${DAY_NAMES[now.getDay()]} plan — showing ${DAY_NAMES[dayInfo.dow]}`
              : "Today"}
          </p>
          {current && minsLeft !== null && (
            <p className="text-sm text-[var(--muted)]">
              {minsLeft} min left in <strong>{current.title}</strong>
              {next && (
                <>
                  {" · next: "}
                  <strong>{next.title}</strong> at {formatTime(next.starts_at)}
                </>
              )}
            </p>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {todaysBlocks.map((b) => {
            const isCurrent = current?.id === b.id;
            return (
              <div
                key={b.id}
                className={`rounded-xl px-3 py-2 min-w-[120px] text-center border ${isCurrent ? "current-glow" : ""}`}
                style={{
                  background: isCurrent ? "var(--accent)" : "white",
                  color: isCurrent ? "white" : "var(--fg)",
                  borderColor: isCurrent ? "var(--accent)" : "var(--card-border)",
                }}
              >
                <div className="text-2xl">{b.icon}</div>
                <div className="text-sm font-semibold leading-tight">{b.title}</div>
                <div className="text-xs opacity-70">
                  {formatTime(b.starts_at)}
                </div>
              </div>
            );
          })}
          {blocks.length === 0 && (
            <p className="text-[var(--muted)]">
              No schedule yet. Load <code>supabase/schema.sql</code>.
            </p>
          )}
        </div>
      </section>

      {/* Roster preview with today count */}
      {students.length > 0 && (
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
              Students today
            </p>
            <Link href="/teacher/students" className="text-sm text-[var(--accent)] font-semibold">
              Open roster →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {students.map((s) => (
              <Link
                key={s.id}
                href={`/teacher/students/${s.id}`}
                className="flex flex-col items-center gap-2 min-w-[110px] hover:opacity-90"
              >
                <Avatar name={s.full_name} photoUrl={s.photo_url} size={56} />
                <span className="text-sm font-semibold leading-tight text-center">
                  {s.full_name.split(" ")[0]}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-soft)",
                    color: "var(--fg-muted)",
                  }}
                >
                  {perStudentToday[s.id] ?? 0} today
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">
          Pending ({pending.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {pending.map((r) => (
            <RequestCard key={r.id} req={r} now={now} onStatus={setStatus} />
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
              <RequestCard key={r.id} req={r} now={now} onStatus={setStatus} />
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
              className="p-3 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl" aria-hidden>
                  {r.icon?.emoji ?? "🖼️"}
                </span>
                <span className="font-medium truncate">
                  {r.student?.full_name ?? "Unknown"}
                </span>
                <span className="text-[var(--muted)] truncate">
                  {recentTail(carrierFor(r), r.icon?.label)}
                </span>
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

// Match the board: render the student's first-person sentence.
//   "Leo says I want snack"  /  "Leo says I see snack"
function teacherSentence(
  name: string | undefined,
  carrier: string | null | undefined,
  label: string | undefined,
): string {
  const n = name ?? "Unknown";
  const l = label ?? "—";
  const c = (carrier ?? "I want").trim() || "I want";
  return `${n} says ${c} ${l}`;
}

function recentTail(
  carrier: string | null | undefined,
  label: string | undefined,
): string {
  const l = label ?? "—";
  const c = (carrier ?? "I want").trim() || "I want";
  return `says ${c} ${l}`;
}

function enrich(
  r: PecsRequest,
  students: Student[],
  icons: PecsIcon[],
): EnrichedRequest {
  return {
    ...r,
    student: students.find((s) => s.id === r.student_id) ?? null,
    icon: icons.find((i) => i.id === r.icon_id) ?? null,
  };
}

function RequestCard({
  req,
  now,
  onStatus,
}: {
  req: EnrichedRequest;
  now: Date;
  onStatus: (id: string, s: RequestStatus) => void;
}) {
  const ageSec = Math.max(
    0,
    Math.floor((now.getTime() - new Date(req.created_at).getTime()) / 1000),
  );
  const ageLabel =
    ageSec < 60
      ? `${ageSec}s ago`
      : ageSec < 3600
        ? `${Math.floor(ageSec / 60)}m ${ageSec % 60}s ago`
        : `${Math.floor(ageSec / 3600)}h ago`;
  const stale = ageSec > 60;
  return (
    <article className="card p-4 alert-in">
      <div className="flex items-center gap-4">
        <Avatar
          name={req.student?.full_name ?? "?"}
          photoUrl={req.student?.photo_url ?? null}
          size={56}
        />
        <span className="text-5xl" aria-hidden>
          {req.icon?.emoji ?? "🖼️"}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold truncate">
            {teacherSentence(req.student?.full_name, carrierFor(req), req.icon?.label)}
          </p>
          <p
            className="text-sm"
            style={{ color: stale ? "var(--bad)" : "var(--muted)" }}
          >
            {ageLabel}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="btn btn-soft btn-sm"
          onClick={() => onStatus(req.id, "in_progress")}
        >
          On it
        </button>
        <button
          className="btn btn-good btn-sm"
          onClick={() => onStatus(req.id, "completed")}
        >
          ✓ Done
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onStatus(req.id, "redirected")}
        >
          ↩ Redirect
        </button>
        <button
          className="btn btn-bad btn-sm"
          onClick={() => onStatus(req.id, "denied")}
        >
          ✕ Deny
        </button>
      </div>
    </article>
  );
}
