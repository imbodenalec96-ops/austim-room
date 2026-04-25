"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { getSupabase } from "@/lib/supabase/client";
import type { Student } from "@/lib/types";

const DEFAULT_CLASSROOM_ID = "11111111-1111-1111-1111-111111111111";

type Props = {
  mode: "create" | "edit";
  initial?: Student;
};

type FormState = {
  full_name: string;
  grade: string;
  photo_url: string;
  communication_mode: string;
  triggers: string;
  goals: string; // newline-separated
  reinforcers: string; // comma-separated
  sensory_supports: string; // comma-separated
  prompt_hierarchy: string; // comma-separated, in order
};

function fromInitial(s?: Student): FormState {
  return {
    full_name: s?.full_name ?? "",
    grade: s?.grade ?? "",
    photo_url: s?.photo_url ?? "",
    communication_mode: s?.communication_mode ?? "",
    triggers: s?.triggers ?? "",
    goals: ((s?.goals as string[]) ?? []).join("\n"),
    reinforcers: ((s?.reinforcers as string[]) ?? []).join(", "),
    sensory_supports: ((s?.sensory_supports as string[]) ?? []).join(", "),
    prompt_hierarchy: ((s?.prompt_hierarchy as string[]) ?? []).join(", "),
  };
}

function splitCsv(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}
function splitLines(s: string): string[] {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

export default function StudentForm({ mode, initial }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabase(), []);
  const [form, setForm] = useState<FormState>(() => fromInitial(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(p: Partial<FormState>) {
    setForm((f) => ({ ...f, ...p }));
  }

  async function save() {
    if (!form.full_name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    setSaving(true);
    const payload = {
      classroom_id: initial?.classroom_id ?? DEFAULT_CLASSROOM_ID,
      full_name: form.full_name.trim(),
      grade: form.grade.trim() || null,
      photo_url: form.photo_url.trim() || null,
      communication_mode: form.communication_mode.trim() || null,
      triggers: form.triggers.trim() || null,
      goals: splitLines(form.goals),
      reinforcers: splitCsv(form.reinforcers),
      sensory_supports: splitCsv(form.sensory_supports),
      prompt_hierarchy: splitCsv(form.prompt_hierarchy),
    };

    if (mode === "create") {
      const { data, error: e } = await supabase
        .from("students")
        .insert(payload)
        .select("id")
        .maybeSingle();
      setSaving(false);
      if (e) {
        setError(e.message);
        return;
      }
      const newId = (data as { id: string } | null)?.id;
      router.push(newId ? `/teacher/students/${newId}` : `/teacher/students`);
      router.refresh();
    } else if (initial) {
      const { error: e } = await supabase
        .from("students")
        .update(payload)
        .eq("id", initial.id);
      setSaving(false);
      if (e) {
        setError(e.message);
        return;
      }
      router.push(`/teacher/students/${initial.id}`);
      router.refresh();
    }
  }

  async function deleteStudent() {
    if (mode !== "edit" || !initial) return;
    if (
      !window.confirm(
        `Delete ${initial.full_name}? This also removes their PECS history, attempts, and assignments.`,
      )
    )
      return;
    setSaving(true);
    const { error: e } = await supabase
      .from("students")
      .delete()
      .eq("id", initial.id);
    setSaving(false);
    if (e) {
      setError(e.message);
      return;
    }
    router.push("/teacher/students");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl p-5 sm:p-8 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            name={form.full_name || "?"}
            photoUrl={form.photo_url || initial?.photo_url || null}
            size={56}
            ring
          />
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
              {mode === "create" ? "New student" : "Edit student"}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {form.full_name || "Untitled"}
            </h1>
          </div>
        </div>
        <Link href="/teacher/students" className="btn btn-ghost btn-sm">
          ← Roster
        </Link>
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

      <section className="card p-4 space-y-3">
        <Field label="Full name *">
          <input
            className="input"
            value={form.full_name}
            onChange={(e) => patch({ full_name: e.target.value })}
            placeholder="Leo M."
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Grade">
            <input
              className="input"
              value={form.grade}
              onChange={(e) => patch({ grade: e.target.value })}
              placeholder="K, 1, 2…"
            />
          </Field>
          <Field label="Photo URL (optional)">
            <input
              className="input"
              value={form.photo_url}
              onChange={(e) => patch({ photo_url: e.target.value })}
              placeholder="https://…"
            />
          </Field>
        </div>
        <Field label="Communication mode">
          <input
            className="input"
            value={form.communication_mode}
            onChange={(e) => patch({ communication_mode: e.target.value })}
            placeholder="PECS · AAC · verbal …"
          />
        </Field>
      </section>

      <section className="card p-4 space-y-3">
        <Field
          label="Goals (one per line)"
          hint="Visible on the student profile and grading view"
        >
          <textarea
            className="input"
            rows={4}
            value={form.goals}
            onChange={(e) => patch({ goals: e.target.value })}
            placeholder={"Request preferred items using 3-icon sentence\nTolerate 5 min of work with 1 break"}
          />
        </Field>
        <Field label="Reinforcers (comma-separated)">
          <input
            className="input"
            value={form.reinforcers}
            onChange={(e) => patch({ reinforcers: e.target.value })}
            placeholder="bubbles, trains, iPad time"
          />
        </Field>
        <Field label="Sensory supports (comma-separated)">
          <input
            className="input"
            value={form.sensory_supports}
            onChange={(e) => patch({ sensory_supports: e.target.value })}
            placeholder="weighted lap pad, headphones"
          />
        </Field>
        <Field
          label="Prompt hierarchy (least to most intrusive)"
          hint="Comma-separated, in order"
        >
          <input
            className="input"
            value={form.prompt_hierarchy}
            onChange={(e) => patch({ prompt_hierarchy: e.target.value })}
            placeholder="independent, gestural, verbal, model, physical"
          />
        </Field>
        <Field label="Triggers / cautions">
          <textarea
            className="input"
            rows={2}
            value={form.triggers}
            onChange={(e) => patch({ triggers: e.target.value })}
            placeholder="Loud noises, unannounced transitions"
          />
        </Field>
      </section>

      <div className="flex flex-wrap gap-2 justify-end">
        {mode === "edit" && (
          <button
            onClick={deleteStudent}
            disabled={saving}
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--bad)" }}
          >
            Delete student
          </button>
        )}
        <Link href="/teacher/students" className="btn btn-ghost btn-sm">
          Cancel
        </Link>
        <button onClick={save} disabled={saving} className="btn">
          {saving
            ? "Saving…"
            : mode === "create"
              ? "Create student"
              : "Save"}
        </button>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1">{label}</span>
      {hint && (
        <span className="text-xs text-[var(--muted)] block mb-1">{hint}</span>
      )}
      {children}
    </label>
  );
}
