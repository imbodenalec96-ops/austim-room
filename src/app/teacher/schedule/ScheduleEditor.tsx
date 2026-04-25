"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { DAY_NAMES } from "@/lib/schedule";
import type { ScheduleBlock, Student } from "@/lib/types";

const DEFAULT_CLASSROOM_ID = "11111111-1111-1111-1111-111111111111";
const SWATCHES = [
  "#fde68a", "#fdba74", "#bbf7d0", "#bae6fd", "#c7d2fe",
  "#fbcfe8", "#fcd34d", "#86efac", "#ddd6fe", "#a7f3d0",
  "#fed7aa", "#fecaca",
];

type Props = {
  initialBlocks: ScheduleBlock[];
  students: Pick<Student, "id" | "full_name">[];
};

type Draft = Partial<ScheduleBlock> & { _isNew?: boolean };

const BLANK_BLOCK = {
  classroom_id: DEFAULT_CLASSROOM_ID,
  student_id: null,
  title: "",
  icon: "📌",
  color: "#fde68a",
  starts_at: "09:00:00",
  ends_at: "09:30:00",
  day_of_week: 1,
  staff: "",
  notes: "",
  slide_url: null,
  sort_order: 0,
};

function trimTime(s: string | undefined): string {
  if (!s) return "";
  // schedule_blocks.starts_at returns "HH:MM:SS"; normalize to HH:MM for input
  return s.length >= 5 ? s.slice(0, 5) : s;
}
function paddedTime(s: string): string {
  // Input gives "HH:MM" — add :00 for the time column
  return s.length === 5 ? `${s}:00` : s;
}

export default function ScheduleEditor({
  initialBlocks,
  students,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabase(), []);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(initialBlocks);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [filterDay, setFilterDay] = useState<number | "all">("all");
  const [filterStudent, setFilterStudent] = useState<string | "all" | "class">(
    "all",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentsById = useMemo(() => {
    const m = new Map<string, string>();
    students.forEach((s) => m.set(s.id, s.full_name));
    return m;
  }, [students]);

  const filtered = useMemo(() => {
    return blocks.filter((b) => {
      if (filterDay !== "all" && b.day_of_week !== filterDay) return false;
      if (filterStudent === "class" && b.student_id !== null) return false;
      if (
        typeof filterStudent === "string" &&
        filterStudent !== "all" &&
        filterStudent !== "class" &&
        b.student_id !== filterStudent
      )
        return false;
      return true;
    });
  }, [blocks, filterDay, filterStudent]);

  // Group filtered blocks by day for rendering
  const byDay = useMemo(() => {
    const m = new Map<number, ScheduleBlock[]>();
    for (const b of filtered) {
      const list = m.get(b.day_of_week) ?? [];
      list.push(b);
      m.set(b.day_of_week, list);
    }
    return m;
  }, [filtered]);

  function startNew(day?: number) {
    setDraft({
      ...BLANK_BLOCK,
      day_of_week: day ?? 1,
      _isNew: true,
    });
  }

  function startEdit(b: ScheduleBlock) {
    setDraft({ ...b });
  }

  function patchDraft(p: Partial<ScheduleBlock>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  async function saveDraft() {
    if (!draft) return;
    if (!draft.title?.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setSaving(true);

    const payload = {
      classroom_id: draft.classroom_id ?? DEFAULT_CLASSROOM_ID,
      student_id: draft.student_id ?? null,
      title: draft.title.trim(),
      icon: draft.icon ?? null,
      color: draft.color ?? null,
      starts_at: paddedTime(draft.starts_at ?? "09:00:00"),
      ends_at: paddedTime(draft.ends_at ?? "09:30:00"),
      day_of_week: draft.day_of_week ?? 1,
      staff: draft.staff?.trim() || null,
      notes: draft.notes?.trim() || null,
      sort_order: draft.sort_order ?? 0,
    };

    if (draft._isNew) {
      const { data, error: e } = await supabase
        .from("schedule_blocks")
        .insert(payload)
        .select("*")
        .maybeSingle();
      setSaving(false);
      if (e) {
        setError(e.message);
        return;
      }
      if (data) setBlocks((cur) => [...cur, data as ScheduleBlock]);
      setDraft(null);
    } else if (draft.id) {
      const { error: e } = await supabase
        .from("schedule_blocks")
        .update(payload)
        .eq("id", draft.id);
      setSaving(false);
      if (e) {
        setError(e.message);
        return;
      }
      setBlocks((cur) =>
        cur.map((b) =>
          b.id === draft.id ? ({ ...b, ...payload } as ScheduleBlock) : b,
        ),
      );
      setDraft(null);
    }
    router.refresh();
  }

  async function deleteBlock(id: string) {
    if (!window.confirm("Delete this schedule block?")) return;
    const { error: e } = await supabase
      .from("schedule_blocks")
      .delete()
      .eq("id", id);
    if (e) {
      window.alert(`Couldn't delete: ${e.message}`);
      return;
    }
    setBlocks((cur) => cur.filter((b) => b.id !== id));
    router.refresh();
  }

  async function duplicateToWeekdays(b: ScheduleBlock) {
    if (
      !window.confirm(
        `Duplicate "${b.title}" to all weekdays Mon–Fri at the same time?`,
      )
    )
      return;
    const wantDays = [1, 2, 3, 4, 5];
    const existingDays = new Set(
      blocks
        .filter(
          (x) =>
            x.title === b.title &&
            x.starts_at === b.starts_at &&
            x.student_id === b.student_id,
        )
        .map((x) => x.day_of_week),
    );
    const inserts = wantDays
      .filter((d) => !existingDays.has(d))
      .map((d) => ({
        classroom_id: b.classroom_id,
        student_id: b.student_id,
        title: b.title,
        icon: b.icon,
        color: b.color,
        starts_at: b.starts_at,
        ends_at: b.ends_at,
        day_of_week: d,
        staff: b.staff,
        notes: b.notes,
        sort_order: b.sort_order,
      }));
    if (inserts.length === 0) {
      window.alert("Already on every weekday.");
      return;
    }
    const { data, error: e } = await supabase
      .from("schedule_blocks")
      .insert(inserts)
      .select("*");
    if (e) {
      window.alert(`Couldn't duplicate: ${e.message}`);
      return;
    }
    if (data) setBlocks((cur) => [...cur, ...(data as ScheduleBlock[])]);
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-5xl p-5 sm:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            Teacher
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-[var(--muted)] mt-1">
            Class blocks and per-student blocks. Edit times, titles, and
            staff. Realtime sync to the TV board.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => startNew()} className="btn">
            + New block
          </button>
          <Link href="/teacher" className="btn btn-ghost btn-sm">
            ← Dashboard
          </Link>
        </div>
      </header>

      {error && (
        <div
          className="card p-3"
          style={{
            background: "#fef2f2",
            borderColor: "#fecaca",
            color: "var(--bad)",
          }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <section className="card p-3 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium">Day</span>
        <button
          className={`chip ${filterDay === "all" ? "chip-active" : ""}`}
          onClick={() => setFilterDay("all")}
        >
          All
        </button>
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <button
            key={d}
            className={`chip ${filterDay === d ? "chip-active" : ""}`}
            onClick={() => setFilterDay(d)}
          >
            {DAY_NAMES[d].slice(0, 3)}
          </button>
        ))}
        <span className="text-sm font-medium ml-4">Who</span>
        <button
          className={`chip ${filterStudent === "all" ? "chip-active" : ""}`}
          onClick={() => setFilterStudent("all")}
        >
          Everyone
        </button>
        <button
          className={`chip ${filterStudent === "class" ? "chip-active" : ""}`}
          onClick={() => setFilterStudent("class")}
        >
          Class-wide only
        </button>
        {students.map((s) => (
          <button
            key={s.id}
            className={`chip ${filterStudent === s.id ? "chip-active" : ""}`}
            onClick={() => setFilterStudent(s.id)}
          >
            {s.full_name.split(" ")[0]}
          </button>
        ))}
      </section>

      {/* Inline draft */}
      {draft && (
        <section className="card p-4 space-y-3" style={{ borderColor: "var(--accent)" }}>
          <h2 className="font-semibold">
            {draft._isNew ? "New block" : `Edit: ${draft.title || "Untitled"}`}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title">
              <input
                className="input"
                value={draft.title ?? ""}
                onChange={(e) => patchDraft({ title: e.target.value })}
                placeholder="Morning Meeting"
              />
            </Field>
            <Field label="Icon (emoji)">
              <input
                className="input"
                value={draft.icon ?? ""}
                onChange={(e) => patchDraft({ icon: e.target.value })}
                placeholder="🌞"
              />
            </Field>
            <Field label="Day of week">
              <select
                className="input"
                value={draft.day_of_week ?? 1}
                onChange={(e) =>
                  patchDraft({ day_of_week: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <option key={d} value={d}>
                    {DAY_NAMES[d]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Who">
              <select
                className="input"
                value={draft.student_id ?? ""}
                onChange={(e) =>
                  patchDraft({
                    student_id: e.target.value === "" ? null : e.target.value,
                  })
                }
              >
                <option value="">Whole class</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Starts at">
              <input
                className="input"
                type="time"
                value={trimTime(draft.starts_at)}
                onChange={(e) => patchDraft({ starts_at: paddedTime(e.target.value) })}
              />
            </Field>
            <Field label="Ends at">
              <input
                className="input"
                type="time"
                value={trimTime(draft.ends_at)}
                onChange={(e) => patchDraft({ ends_at: paddedTime(e.target.value) })}
              />
            </Field>
            <Field label="Staff">
              <input
                className="input"
                value={draft.staff ?? ""}
                onChange={(e) => patchDraft({ staff: e.target.value })}
                placeholder="Ms. Carter + Para"
              />
            </Field>
            <Field label="Color">
              <ColorRow
                value={draft.color ?? ""}
                onChange={(v) => patchDraft({ color: v || null })}
              />
            </Field>
          </div>
          <Field label="Slide / video link (YouTube · image · Google Slides · PDF)">
            <input
              className="input"
              type="url"
              value={draft.slide_url ?? ""}
              onChange={(e) => patchDraft({ slide_url: e.target.value || null })}
              placeholder="https://www.youtube.com/watch?v=… or any image / iframe URL"
            />
          </Field>
          <Field label="Notes">
            <textarea
              className="input"
              rows={2}
              value={draft.notes ?? ""}
              onChange={(e) => patchDraft({ notes: e.target.value })}
              placeholder="Visual menu posted, sing-along…"
            />
          </Field>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setDraft(null)}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button onClick={saveDraft} disabled={saving} className="btn">
              {saving ? "Saving…" : draft._isNew ? "Create block" : "Save block"}
            </button>
          </div>
        </section>
      )}

      {/* Blocks grouped by day */}
      <section className="space-y-6">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => {
          const list = byDay.get(d);
          if (!list || list.length === 0) {
            if (filterDay !== "all" && filterDay !== d) return null;
            return null;
          }
          list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
          return (
            <div key={d}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{DAY_NAMES[d]}</h2>
                <button
                  onClick={() => startNew(d)}
                  className="btn btn-ghost btn-sm"
                >
                  + Add to {DAY_NAMES[d].slice(0, 3)}
                </button>
              </div>
              <ul className="space-y-2">
                {list.map((b) => (
                  <li
                    key={b.id}
                    className="card p-3 flex flex-wrap items-center gap-3"
                  >
                    <span
                      className="w-2 self-stretch rounded"
                      style={{ background: b.color ?? "var(--card-border)" }}
                    />
                    <span className="text-3xl">{b.icon ?? "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{b.title}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {trimTime(b.starts_at)}–{trimTime(b.ends_at)}
                        {b.staff && ` · ${b.staff}`}
                        {b.student_id &&
                          ` · ${studentsById.get(b.student_id) ?? "student"}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => startEdit(b)}
                        className="btn btn-soft btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => duplicateToWeekdays(b)}
                        className="btn btn-ghost btn-sm"
                        title="Duplicate to all weekdays Mon–Fri"
                      >
                        ⇶ Mon–Fri
                      </button>
                      <button
                        onClick={() => deleteBlock(b.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--bad)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {filtered.length === 0 && !draft && (
          <p className="card p-4 text-[var(--muted)]">
            No blocks match this filter. Click <strong>+ New block</strong> to
            create one.
          </p>
        )}
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1">{label}</span>
      {children}
    </label>
  );
}

function ColorRow({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {SWATCHES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Use ${c}`}
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            background: c,
            border:
              value === c
                ? "2px solid var(--accent)"
                : "1px solid var(--card-border)",
          }}
        />
      ))}
      <input
        type="color"
        value={value || "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: 32,
          height: 26,
          border: "none",
          background: "transparent",
        }}
        aria-label="Custom color"
      />
    </div>
  );
}
