import type { PecsRequest } from "@/lib/types";

/**
 * Carrier-phrase encoding helper.
 *
 * Until the 006_carrier.sql migration is applied (or PostgREST's schema
 * cache refreshes after it is), we side-channel the carrier through the
 * existing `notes` column with a structured prefix:
 *
 *   notes = "[c:I see] optional human note"
 *
 * Once the dedicated `carrier` column is available, that wins — but old
 * rows with the encoded prefix continue to display correctly.
 */

const PREFIX_RE = /^\[c:([^\]]+)\]\s?/;
export const DEFAULT_CARRIER = "I want";

export function encodeCarrierIntoNotes(
  carrier: string,
  notes?: string | null,
): string | null {
  const c = carrier.trim();
  if (!c || c === DEFAULT_CARRIER) {
    // No need to encode the default — the read-side will fall through
    return notes && notes.trim() ? notes.trim() : null;
  }
  const rest = notes ? notes.replace(PREFIX_RE, "").trim() : "";
  return rest ? `[c:${c}] ${rest}` : `[c:${c}]`;
}

/**
 * Resolve the carrier phrase for a request row.
 * Prefers the dedicated column; falls back to parsing notes.
 */
export function carrierFor(row: Pick<PecsRequest, "carrier" | "notes">): string {
  const direct = (row.carrier ?? "").trim();
  if (direct) return direct;
  if (row.notes) {
    const m = row.notes.match(PREFIX_RE);
    if (m) return m[1];
  }
  return DEFAULT_CARRIER;
}

/**
 * Strip the carrier prefix from notes for display purposes — teachers
 * grading the request shouldn't see "[c:I see]" in the notes field.
 */
export function notesWithoutCarrier(
  notes: string | null | undefined,
): string | null {
  if (!notes) return null;
  const cleaned = notes.replace(PREFIX_RE, "").trim();
  return cleaned || null;
}
