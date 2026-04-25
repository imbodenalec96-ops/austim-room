"use client";

/**
 * BoardEditor
 * -----------
 * Visual editor for matching-board activities. Used for both creating
 * (from blank or a duplicated template) and editing existing boards.
 *
 * Form state mirrors the BoardLayout shape so a Save just JSON-stringifies
 * and writes to Supabase. Live preview on the right re-renders the
 * MatchingBoard whenever the form changes (key bumps to clear placement
 * state on each edit).
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { MatchingBoard } from "@/components/MatchingBoard";
import type {
  Board,
  BoardKind,
  BoardLayout,
  BoardSettings,
  BoardTile,
  BoardZone,
  FeedbackMode,
} from "@/lib/types";

const DEFAULT_CLASSROOM_ID = "11111111-1111-1111-1111-111111111111";

const KIND_OPTIONS: { value: BoardKind; label: string }[] = [
  { value: "colors",         label: "Colors" },
  { value: "shapes",         label: "Shapes" },
  { value: "count",          label: "Counting" },
  { value: "alphabet",       label: "Alphabet" },
  { value: "weather",        label: "Weather" },
  { value: "sort",           label: "Sorting (large zones)" },
  { value: "picture-word",   label: "Picture–word match" },
  { value: "face-parts",     label: "Face parts" },
  { value: "transportation", label: "Transportation" },
  { value: "fruits-veg",     label: "Fruits & veg" },
  { value: "planets",        label: "Planets" },
  { value: "dinosaurs",      label: "Dinosaurs" },
];

const SWATCHES = [
  "#ffffff", "#fffaf0", "#fde68a", "#bbf7d0", "#bae6fd", "#ddd6fe",
  "#fbcfe8", "#fdba74", "#dc2626", "#2563eb", "#facc15", "#16a34a",
  "#f97316", "#9333ea",
];

type Mode = "create" | "edit";

export type BoardEditorProps = {
  mode: Mode;
  /** When mode === "create" with a template, this is the source layout. Title is reused. */
  initial?: Pick<Board, "id" | "title" | "kind" | "background" | "layout">;
};

type EditorState = {
  title: string;
  kind: BoardKind;
  background: string;
  settings: BoardSettings;
  zones: BoardZone[];
  tiles: BoardTile[];
};

function blankZone(idx: number): BoardZone {
  return { id: `z${idx}`, label: "", emoji: "" };
}
function blankTile(idx: number, firstZone: string): BoardTile {
  return { id: `t${idx}`, label: "", emoji: "", correctZoneId: firstZone };
}

function defaultState(): EditorState {
  const z1 = blankZone(1);
  const z2 = blankZone(2);
  return {
    title: "",
    kind: "colors",
    background: "#fffaf0",
    settings: {
      errorless: true,
      audioOnTap: true,
      soundOnCorrect: true,
      feedbackOn: "instant",
      showLabels: true,
    },
    zones: [z1, z2],
    tiles: [blankTile(1, z1.id), blankTile(2, z2.id)],
  };
}

function fromInitial(init: BoardEditorProps["initial"]): EditorState {
  if (!init) return defaultState();
  return {
    title: init.title,
    kind: init.kind,
    background: init.background ?? "#fffaf0",
    settings: { ...init.layout.settings },
    zones: init.layout.zones.map((z) => ({ ...z })),
    tiles: init.layout.tiles.map((t) => ({ ...t })),
  };
}

export default function BoardEditor({ mode, initial }: BoardEditorProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabase(), []);
  const [state, setState] = useState<EditorState>(() => fromInitial(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const layout: BoardLayout = useMemo(
    () => ({
      settings: state.settings,
      zones: state.zones,
      tiles: state.tiles,
    }),
    [state.settings, state.zones, state.tiles],
  );

  function patch(p: Partial<EditorState>) {
    setState((s) => ({ ...s, ...p }));
    setSavedAt(null);
  }
  function patchSettings(p: Partial<BoardSettings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...p } }));
    setSavedAt(null);
  }

  function nextZoneId() {
    const n = state.zones.reduce((acc, z) => {
      const m = z.id.match(/^z(\d+)$/);
      return m ? Math.max(acc, Number(m[1])) : acc;
    }, 0);
    return `z${n + 1}`;
  }
  function nextTileId() {
    const n = state.tiles.reduce((acc, t) => {
      const m = t.id.match(/^t(\d+)$/);
      return m ? Math.max(acc, Number(m[1])) : acc;
    }, 0);
    return `t${n + 1}`;
  }

  function addZone() {
    const id = nextZoneId();
    setState((s) => ({
      ...s,
      zones: [...s.zones, { id, label: "", emoji: "" }],
    }));
    setSavedAt(null);
  }
  function removeZone(id: string) {
    setState((s) => {
      const zones = s.zones.filter((z) => z.id !== id);
      if (zones.length === 0) zones.push(blankZone(1));
      const fallback = zones[0].id;
      return {
        ...s,
        zones,
        tiles: s.tiles.map((t) =>
          t.correctZoneId === id ? { ...t, correctZoneId: fallback } : t,
        ),
      };
    });
    setSavedAt(null);
  }
  function updateZone(id: string, p: Partial<BoardZone>) {
    setState((s) => ({
      ...s,
      zones: s.zones.map((z) => (z.id === id ? { ...z, ...p } : z)),
    }));
    setSavedAt(null);
  }

  function addTile() {
    const firstZone = state.zones[0]?.id ?? "z1";
    setState((s) => ({
      ...s,
      tiles: [
        ...s.tiles,
        { id: nextTileId(), label: "", emoji: "", correctZoneId: firstZone },
      ],
    }));
    setSavedAt(null);
  }
  function removeTile(id: string) {
    setState((s) => ({
      ...s,
      tiles: s.tiles.filter((t) => t.id !== id),
    }));
    setSavedAt(null);
  }
  function updateTile(id: string, p: Partial<BoardTile>) {
    setState((s) => ({
      ...s,
      tiles: s.tiles.map((t) => (t.id === id ? { ...t, ...p } : t)),
    }));
    setSavedAt(null);
  }

  function validate(): string | null {
    if (!state.title.trim()) return "Give the board a title.";
    if (state.zones.length === 0) return "Add at least one drop zone.";
    if (state.tiles.length === 0) return "Add at least one tile.";
    for (const z of state.zones) {
      if (!z.label.trim() && !z.emoji?.trim() && !z.color)
        return "Every zone needs a label, emoji, or color.";
    }
    for (const t of state.tiles) {
      if (!state.zones.some((z) => z.id === t.correctZoneId))
        return `Tile "${t.label || t.id}" points to a missing zone.`;
      if (!t.label.trim() && !t.emoji?.trim() && !t.color)
        return "Every tile needs a label, emoji, or color.";
    }
    return null;
  }

  async function save() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setSaving(true);
    const payload = {
      classroom_id: DEFAULT_CLASSROOM_ID,
      title: state.title.trim(),
      kind: state.kind,
      background: state.background,
      layout,
    };

    if (mode === "create") {
      const { data, error: e } = await supabase
        .from("boards")
        .insert(payload)
        .select("id")
        .maybeSingle();
      setSaving(false);
      if (e) {
        setError(e.message);
        return;
      }
      const newId = (data as { id: string } | null)?.id;
      router.push(newId ? `/teacher/boards` : "/teacher/boards");
      router.refresh();
    } else if (initial) {
      const { error: e } = await supabase
        .from("boards")
        .update(payload)
        .eq("id", initial.id);
      setSaving(false);
      if (e) {
        setError(e.message);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    }
  }

  async function deleteBoard() {
    if (mode !== "edit" || !initial) return;
    if (!window.confirm(`Delete "${initial.title}"? This cannot be undone.`))
      return;
    const { error: e } = await supabase
      .from("boards")
      .delete()
      .eq("id", initial.id);
    if (e) {
      setError(e.message);
      return;
    }
    router.push("/teacher/boards");
    router.refresh();
  }

  // Bump preview key when the layout signature changes so placements reset
  const previewKey = useMemo(
    () =>
      `${state.zones.length}:${state.tiles.length}:${state.background}:${JSON.stringify(state.settings)}`,
    [state.zones.length, state.tiles.length, state.background, state.settings],
  );

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            Teacher · {mode === "create" ? "New board" : "Edit board"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {state.title || (mode === "create" ? "Untitled" : "Edit")}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {savedAt && (
            <span className="text-sm text-[var(--good)]">
              ✓ Saved {timeAgo(savedAt)}
            </span>
          )}
          <Link href="/teacher/boards" className="btn btn-ghost btn-sm">
            ← Boards
          </Link>
          {mode === "edit" && (
            <button
              type="button"
              onClick={deleteBoard}
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--bad)" }}
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn"
          >
            {saving ? "Saving…" : mode === "create" ? "Create board" : "Save"}
          </button>
        </div>
      </header>

      {error && (
        <div
          className="card p-3"
          style={{ background: "#fef2f2", borderColor: "#fecaca", color: "var(--bad)" }}
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─── Form column ─────────────────────────────────────────── */}
        <section className="space-y-5">
          <Card title="Basics">
            <Field label="Title">
              <input
                type="text"
                value={state.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder="e.g. Colors of the rainbow"
                className="input"
              />
            </Field>
            <Field label="Kind">
              <select
                value={state.kind}
                onChange={(e) =>
                  patch({ kind: e.target.value as BoardKind })
                }
                className="input"
              >
                {KIND_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Background">
              <ColorPickerRow
                value={state.background}
                onChange={(v) => patch({ background: v })}
              />
            </Field>
          </Card>

          <Card title="Settings">
            <div className="flex flex-wrap gap-2">
              <Toggle
                label="Errorless"
                value={state.settings.errorless}
                onChange={(v) => patchSettings({ errorless: v })}
              />
              <Toggle
                label="Audio on tap"
                value={state.settings.audioOnTap}
                onChange={(v) => patchSettings({ audioOnTap: v })}
              />
              <Toggle
                label="Speak on correct"
                value={state.settings.soundOnCorrect}
                onChange={(v) => patchSettings({ soundOnCorrect: v })}
              />
              <Toggle
                label="Show labels"
                value={state.settings.showLabels}
                onChange={(v) => patchSettings({ showLabels: v })}
              />
            </div>
            <Field label="Feedback">
              <select
                value={state.settings.feedbackOn}
                onChange={(e) =>
                  patchSettings({
                    feedbackOn: e.target.value as FeedbackMode,
                  })
                }
                className="input"
              >
                <option value="instant">Instant (flash on every drop)</option>
                <option value="delayed">Delayed (only at end)</option>
                <option value="none">None</option>
              </select>
            </Field>
          </Card>

          <Card
            title={`Drop zones (${state.zones.length})`}
            actions={
              <button onClick={addZone} className="btn btn-soft btn-sm">
                + Add zone
              </button>
            }
          >
            <ul className="space-y-2">
              {state.zones.map((z) => (
                <li key={z.id} className="card p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-xs text-[var(--muted)] w-10">{z.id}</code>
                    <input
                      type="text"
                      value={z.label}
                      onChange={(e) => updateZone(z.id, { label: e.target.value })}
                      placeholder="Label"
                      className="input flex-1 min-w-[120px]"
                    />
                    <input
                      type="text"
                      value={z.emoji ?? ""}
                      onChange={(e) => updateZone(z.id, { emoji: e.target.value })}
                      placeholder="Emoji"
                      className="input w-20"
                    />
                    <ColorPickerRow
                      value={z.color ?? ""}
                      onChange={(v) => updateZone(z.id, { color: v || undefined })}
                      compact
                    />
                    <button
                      onClick={() => removeZone(z.id)}
                      className="btn btn-ghost btn-sm"
                      aria-label={`Remove zone ${z.label || z.id}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title={`Tiles (${state.tiles.length})`}
            actions={
              <button onClick={addTile} className="btn btn-soft btn-sm">
                + Add tile
              </button>
            }
          >
            <ul className="space-y-2">
              {state.tiles.map((t) => (
                <li key={t.id} className="card p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-xs text-[var(--muted)] w-10">{t.id}</code>
                    <input
                      type="text"
                      value={t.label}
                      onChange={(e) => updateTile(t.id, { label: e.target.value })}
                      placeholder="Label"
                      className="input flex-1 min-w-[120px]"
                    />
                    <input
                      type="text"
                      value={t.emoji ?? ""}
                      onChange={(e) => updateTile(t.id, { emoji: e.target.value })}
                      placeholder="Emoji"
                      className="input w-20"
                    />
                    <ColorPickerRow
                      value={t.color ?? ""}
                      onChange={(v) => updateTile(t.id, { color: v || undefined })}
                      compact
                    />
                    <select
                      value={t.correctZoneId}
                      onChange={(e) =>
                        updateTile(t.id, { correctZoneId: e.target.value })
                      }
                      className="input w-auto"
                      title="Correct drop zone"
                    >
                      {state.zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          → {z.label || z.id}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeTile(t.id)}
                      className="btn btn-ghost btn-sm"
                      aria-label={`Remove tile ${t.label || t.id}`}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ─── Preview column ───────────────────────────────────────── */}
        <section className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <p className="text-sm uppercase tracking-widest text-[var(--muted)]">
            Live preview
          </p>
          <MatchingBoard
            key={previewKey}
            title={state.title || "Untitled"}
            layout={layout}
            background={state.background}
          />
          <p className="text-xs text-[var(--muted)]">
            The preview is fully interactive — drag the tiles to test. It
            resets when you change the board.
          </p>
        </section>
      </div>
    </main>
  );
}

// ─── small UI helpers (kept inline so the editor stays in one file) ────

function Card({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4">
      <header className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-semibold text-lg">{title}</h2>
        {actions}
      </header>
      <div className="space-y-3">{children}</div>
    </section>
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
      <span className="text-sm text-[var(--muted)] block mb-1">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`chip ${value ? "chip-active" : ""}`}
      aria-pressed={value}
    >
      {value ? "✓" : "○"} {label}
    </button>
  );
}

function ColorPickerRow({
  value,
  onChange,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {!compact &&
        SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`Use ${c}`}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
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
        style={{ width: 36, height: 28, border: "none", background: "transparent" }}
        aria-label="Custom color"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-[var(--muted)] underline"
        >
          clear
        </button>
      )}
    </div>
  );
}

function timeAgo(ts: number): string {
  const sec = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  return `${Math.floor(sec / 60)}m ago`;
}
