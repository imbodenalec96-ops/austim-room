import type { BoardAttempt } from "@/lib/types";

export type MasteryLevel = "mastered" | "emerging" | "working" | "untried";

export interface MasterySummary {
  level: MasteryLevel;
  plays: number;
  completions: number;
  cleanCompletions: number;     // completions with 0 incorrect attempts
  bestAccuracy: number;         // 0..1
  lastAttemptAt: string | null;
}

/**
 * Determine mastery for a (student, board) pair.
 *
 * Heuristics:
 *  - mastered:  ≥ 2 clean completions AND most recent completion was clean
 *  - emerging:  ≥ 1 completion (clean or not)
 *  - working:   plays exist but no completions yet
 *  - untried:   no plays
 */
export function summarize(attempts: BoardAttempt[]): MasterySummary {
  if (attempts.length === 0) {
    return {
      level: "untried",
      plays: 0,
      completions: 0,
      cleanCompletions: 0,
      bestAccuracy: 0,
      lastAttemptAt: null,
    };
  }
  const sorted = [...attempts].sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  );
  const completed = sorted.filter((a) => a.completed);
  const clean = completed.filter((a) => (a.incorrect_count ?? 0) === 0);
  const lastCompleted = completed[0];
  const lastWasClean =
    !!lastCompleted && (lastCompleted.incorrect_count ?? 0) === 0;
  const bestAccuracy = sorted.reduce((acc, a) => {
    const total = (a.correct_count ?? 0) + (a.incorrect_count ?? 0);
    if (total === 0) return acc;
    return Math.max(acc, (a.correct_count ?? 0) / total);
  }, 0);

  let level: MasteryLevel = "working";
  if (clean.length >= 2 && lastWasClean) level = "mastered";
  else if (completed.length >= 1) level = "emerging";

  return {
    level,
    plays: sorted.length,
    completions: completed.length,
    cleanCompletions: clean.length,
    bestAccuracy,
    lastAttemptAt: sorted[0].created_at,
  };
}

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  mastered: "Mastered",
  emerging: "Emerging",
  working: "Working",
  untried: "—",
};

export const MASTERY_COLOR: Record<MasteryLevel, string> = {
  mastered: "#5f9b5f",
  emerging: "#4f7a9b",
  working: "#c98a2f",
  untried: "#b8b8b8",
};

export const MASTERY_BG: Record<MasteryLevel, string> = {
  mastered: "rgba(95,155,95,0.14)",
  emerging: "rgba(79,122,155,0.12)",
  working: "rgba(201,138,47,0.14)",
  untried: "rgba(0,0,0,0.03)",
};

export const PROMPT_LEVELS = [
  "independent",
  "gestural",
  "verbal",
  "model",
  "physical",
] as const;

export type PromptLevel = (typeof PROMPT_LEVELS)[number];

export const PROMPT_LABEL: Record<PromptLevel, string> = {
  independent: "Independent",
  gestural: "Gestural",
  verbal: "Verbal",
  model: "Model",
  physical: "Physical",
};
