"use client";

/**
 * MatchingBoard
 * -------------
 * A drag-and-drop matching activity that mirrors a laminated classroom
 * matching board. Built on Pointer Events so a single code path handles
 * iPad touch, Chromebook touch, and mouse.
 *
 * Features:
 *  - Errorless mode: only the correct zone accepts a tile
 *  - Standard mode: any drop is accepted; wrong placements are marked
 *  - Audio on tap: speak the tile label when student taps in the bank
 *  - Sound on correct: speak the label when correctly placed
 *  - Feedback modes: instant | delayed | none
 *  - Reports correct / incorrect counts and total duration on completion
 *
 * The component is purely presentational + interactional — persistence is
 * the parent's job (it calls onComplete with a final summary).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { BoardLayout, BoardTile, BoardZone } from "@/lib/types";

type Result = {
  correctCount: number;
  incorrectCount: number;
  durationSec: number;
  audioUsed: boolean;
  errorless: boolean;
};

export type MatchingBoardProps = {
  title: string;
  layout: BoardLayout;
  background?: string | null;
  /** Override settings.errorless from the parent (e.g. teacher toggle) */
  errorlessOverride?: boolean;
  /** Called when every tile has been placed (correctly or otherwise) */
  onComplete?: (r: Result) => void;
  /** Called on every drop, correct or not — for live data collection */
  onAttempt?: (e: { tile: BoardTile; zoneId: string; correct: boolean }) => void;
};

type DragState = {
  tileId: string;
  pointerId: number;
  // current pointer position
  x: number;
  y: number;
  // size of the dragged ghost
  w: number;
  h: number;
  // origin of the drag (so we can animate back if rejected)
  originX: number;
  originY: number;
};

type Placement = {
  zoneId: string;
  correct: boolean;
};

export function MatchingBoard({
  title,
  layout,
  background,
  errorlessOverride,
  onComplete,
  onAttempt,
}: MatchingBoardProps) {
  const errorless = errorlessOverride ?? layout.settings.errorless;
  const audioOnTap = layout.settings.audioOnTap;
  const soundOnCorrect = layout.settings.soundOnCorrect;
  const showLabels = layout.settings.showLabels;
  const feedbackOn = layout.settings.feedbackOn;

  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [drag, setDrag] = useState<DragState | null>(null);
  const [shake, setShake] = useState<string | null>(null); // tile id that just bounced back
  const [zoneFlash, setZoneFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [audioUsed, setAudioUsed] = useState(false);
  const startedAt = useRef<number>(Date.now());
  const completedRef = useRef(false);
  const correct = useRef(0);
  const incorrect = useRef(0);

  // Shuffle bank order on first mount, deterministic by tile id
  const bankOrder = useMemo(() => {
    const ids = layout.tiles.map((t) => t.id);
    // Fisher–Yates with Math.random — fine for visual shuffling
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.tiles.length, title]);

  const tilesById = useMemo(() => {
    const m = new Map<string, BoardTile>();
    layout.tiles.forEach((t) => m.set(t.id, t));
    return m;
  }, [layout.tiles]);

  // Tiles that haven't been placed yet, in the shuffled order
  const remainingTileIds = bankOrder.filter((id) => !placements[id]);

  // Tiles grouped by zone for rendering inside the zone
  const tilesByZone = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const [tileId, p] of Object.entries(placements)) {
      (m[p.zoneId] ??= []).push(tileId);
    }
    return m;
  }, [placements]);

  // Detect completion
  useEffect(() => {
    const totalTiles = layout.tiles.length;
    const placedCount = Object.keys(placements).length;
    if (placedCount >= totalTiles && !completedRef.current) {
      completedRef.current = true;
      const result: Result = {
        correctCount: correct.current,
        incorrectCount: incorrect.current,
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
        audioUsed,
        errorless,
      };
      // small delay so the last drop animation is visible
      const t = window.setTimeout(() => onComplete?.(result), 600);
      return () => window.clearTimeout(t);
    }
  }, [placements, layout.tiles.length, audioUsed, errorless, onComplete]);

  // ----------- Pointer handlers ----------------------------------------

  function startDrag(e: React.PointerEvent<HTMLButtonElement>, tile: BoardTile) {
    if (placements[tile.id]) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({
      tileId: tile.id,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      w: rect.width,
      h: rect.height,
      originX: rect.left + rect.width / 2,
      originY: rect.top + rect.height / 2,
    });
    if (audioOnTap) {
      speak(tile.label);
    }
  }

  function moveDrag(e: React.PointerEvent) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
  }

  function endDrag(e: React.PointerEvent) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const tile = tilesById.get(drag.tileId);
    setDrag(null);
    if (!tile) return;

    const target = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-zone-id]");
    const zoneId = target?.getAttribute("data-zone-id") ?? null;
    if (!zoneId) return; // dropped on nothing → snap back invisibly

    const isCorrect = zoneId === tile.correctZoneId;

    if (isCorrect) {
      setPlacements((p) => ({ ...p, [tile.id]: { zoneId, correct: true } }));
      correct.current += 1;
      if (soundOnCorrect) speak(tile.label);
      if (feedbackOn !== "none") flashZone(zoneId, true);
      onAttempt?.({ tile, zoneId, correct: true });
    } else if (errorless) {
      // Reject the drop, bounce the tile back, count as an incorrect attempt
      setShake(tile.id);
      window.setTimeout(() => setShake((s) => (s === tile.id ? null : s)), 500);
      incorrect.current += 1;
      if (feedbackOn === "instant") flashZone(zoneId, false);
      onAttempt?.({ tile, zoneId, correct: false });
    } else {
      // Standard mode: place but mark incorrect
      setPlacements((p) => ({ ...p, [tile.id]: { zoneId, correct: false } }));
      incorrect.current += 1;
      if (feedbackOn !== "none") flashZone(zoneId, false);
      onAttempt?.({ tile, zoneId, correct: false });
    }
  }

  function flashZone(id: string, ok: boolean) {
    setZoneFlash({ id, ok });
    window.setTimeout(
      () => setZoneFlash((z) => (z && z.id === id ? null : z)),
      700,
    );
  }

  function speak(text: string) {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
      setAudioUsed(true);
    } catch {
      /* noop */
    }
  }

  // ----------- Render ---------------------------------------------------

  // Zone count drives the grid columns
  const zoneCols =
    layout.zones.length <= 2
      ? 2
      : layout.zones.length <= 4
        ? 2
        : layout.zones.length <= 6
          ? 3
          : 4;

  return (
    <div
      className="board-frame"
      style={{ background: background ?? "#fffaf0" }}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <header className="board-frame-header">
        <h2 className="board-frame-title">{title}</h2>
        {errorless && (
          <span className="board-tag" title="Errorless: only the correct spot accepts the tile">
            Errorless
          </span>
        )}
      </header>

      {/* Zones */}
      <div
        className="board-zones"
        style={{ gridTemplateColumns: `repeat(${zoneCols}, minmax(0, 1fr))` }}
      >
        {layout.zones.map((z) => (
          <Zone
            key={z.id}
            zone={z}
            tilesIn={(tilesByZone[z.id] ?? []).map((id) => tilesById.get(id)!).filter(Boolean)}
            flash={zoneFlash?.id === z.id ? zoneFlash.ok : null}
            showLabels={showLabels}
          />
        ))}
      </div>

      {/* Tile bank */}
      <div className="board-bank-label">Pieces</div>
      <div className="board-bank">
        {remainingTileIds.map((id) => {
          const tile = tilesById.get(id)!;
          const isDragging = drag?.tileId === tile.id;
          const isShaking = shake === tile.id;
          return (
            <button
              key={tile.id}
              className={`board-tile ${isDragging ? "is-dragging" : ""} ${isShaking ? "is-shaking" : ""}`}
              style={{
                visibility: isDragging ? "hidden" : "visible",
                background: tile.color ?? "white",
                color: tile.color ? readableTextOn(tile.color) : "var(--fg)",
              }}
              onPointerDown={(e) => startDrag(e, tile)}
              aria-label={`Drag ${tile.label}`}
            >
              {tile.emoji ? (
                <span className="board-tile-emoji">{tile.emoji}</span>
              ) : tile.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tile.image_url} alt="" className="board-tile-image" />
              ) : (
                <span
                  className="board-tile-letter"
                  style={{ color: tile.color ? readableTextOn(tile.color) : undefined }}
                >
                  {tile.label}
                </span>
              )}
              {showLabels && tile.emoji && (
                <span className="board-tile-label">{tile.label}</span>
              )}
            </button>
          );
        })}
        {remainingTileIds.length === 0 && (
          <div className="board-bank-empty">All done!</div>
        )}
      </div>

      {/* Floating ghost while dragging */}
      {drag && (() => {
        const tile = tilesById.get(drag.tileId);
        if (!tile) return null;
        return (
          <div
            className="board-tile board-tile-ghost"
            style={{
              left: drag.x - drag.w / 2,
              top: drag.y - drag.h / 2,
              width: drag.w,
              height: drag.h,
              background: tile.color ?? "white",
              color: tile.color ? readableTextOn(tile.color) : "var(--fg)",
            }}
          >
            {tile.emoji ? (
              <span className="board-tile-emoji">{tile.emoji}</span>
            ) : tile.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tile.image_url} alt="" className="board-tile-image" />
            ) : (
              <span
                className="board-tile-letter"
                style={{ color: tile.color ? readableTextOn(tile.color) : undefined }}
              >
                {tile.label}
              </span>
            )}
            {showLabels && tile.emoji && (
              <span className="board-tile-label">{tile.label}</span>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function Zone({
  zone,
  tilesIn,
  flash,
  showLabels,
}: {
  zone: BoardZone;
  tilesIn: BoardTile[];
  flash: boolean | null;
  showLabels: boolean;
}) {
  const isLarge = zone.kind === "large";
  return (
    <div
      data-zone-id={zone.id}
      className={`board-zone ${isLarge ? "is-large" : ""} ${
        flash === true ? "flash-good" : flash === false ? "flash-bad" : ""
      }`}
      style={{
        borderColor: zone.color ?? undefined,
      }}
    >
      <div className="board-zone-header">
        {zone.emoji && <span className="board-zone-emoji">{zone.emoji}</span>}
        {showLabels && <span className="board-zone-label">{zone.label}</span>}
      </div>
      <div className={`board-zone-slot ${isLarge ? "is-grid" : "is-single"}`}>
        {tilesIn.map((t) => (
          <span
            key={t.id}
            className="board-zone-tile"
            style={{ background: t.color ?? "white" }}
            aria-label={`${t.label} placed`}
          >
            {t.emoji ? (
              <span className="board-tile-emoji">{t.emoji}</span>
            ) : t.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.image_url} alt="" className="board-tile-image" />
            ) : (
              <span
                className="board-tile-letter"
                style={{ color: t.color ? readableTextOn(t.color) : undefined }}
              >
                {t.label}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function readableTextOn(bg: string): string {
  // Quick contrast: use dark text on light backgrounds, white on dark.
  const m = bg.match(/^#?([a-fA-F0-9]{6})$/);
  if (!m) return "#1f2937";
  const hex = m[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#1f2937" : "#ffffff";
}
