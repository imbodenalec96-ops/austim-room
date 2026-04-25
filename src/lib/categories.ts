import type { PecsCategory } from "@/lib/types";

export const CATEGORY_ORDER: PecsCategory[] = [
  "carrier",
  "needs",
  "feelings",
  "social",
  "actions",
  "care",
  "food",
  "people",
  "places",
  "transportation",
  "school",
  "sensory",
];

export const CATEGORY_LABEL: Record<PecsCategory, string> = {
  carrier: "Sentence",
  needs: "Needs",
  feelings: "Feelings",
  social: "Social",
  actions: "Activities",
  care: "Self-care",
  food: "Food",
  people: "People",
  places: "Places",
  transportation: "Travel",
  school: "School",
  sensory: "Sensory",
};

// Calm, low-saturation tints — used as the colored stripe at the top of
// each PECS tile so kids can scan-read by category.
export const CATEGORY_COLOR: Record<PecsCategory, string> = {
  carrier: "#a7d3f5",        // soft sky blue
  needs: "#fde68a",          // warm butter
  feelings: "#fbcfe8",       // dusty pink
  social: "#bae6fd",         // light blue
  actions: "#bbf7d0",        // mint
  care: "#fed7aa",           // peach
  food: "#fcd34d",           // light gold
  people: "#ddd6fe",         // lavender
  places: "#fdba74",         // soft orange
  transportation: "#a7f3d0", // pale green
  school: "#fecaca",         // pale rose
  sensory: "#c7d2fe",        // periwinkle
};
