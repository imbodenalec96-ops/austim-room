import type { PecsCategory } from "@/lib/types";

export const CATEGORY_ORDER: PecsCategory[] = [
  "carrier",
  "pronouns",
  "needs",
  "feelings",
  "social",
  "actions",
  "care",
  "food",
  "people",
  "places",
  "subjects",
  "school",
  "body",
  "clothing",
  "weather",
  "transportation",
  "time",
  "sensory",
  "rewards",
];

export const CATEGORY_LABEL: Record<PecsCategory, string> = {
  carrier: "Sentence",
  pronouns: "Pronouns",
  needs: "Needs",
  feelings: "Feelings",
  social: "Social",
  actions: "Activities",
  care: "Self-care",
  food: "Food",
  people: "People",
  places: "Places",
  subjects: "Subjects",
  school: "School",
  body: "Body",
  clothing: "Clothing",
  weather: "Weather",
  transportation: "Travel",
  time: "Time",
  sensory: "Sensory",
  rewards: "Rewards",
};

// Calm, low-saturation tints — the colored stripe at the top of each PECS
// tile so kids can scan-read by category, like the printed boards.
export const CATEGORY_COLOR: Record<PecsCategory, string> = {
  carrier: "#a7d3f5",        // soft sky blue
  pronouns: "#d6e4f0",       // pale slate blue
  needs: "#fde68a",          // warm butter
  feelings: "#fbcfe8",       // dusty pink
  social: "#bae6fd",         // light blue
  actions: "#bbf7d0",        // mint
  care: "#fed7aa",           // peach
  food: "#fcd34d",           // light gold
  people: "#ddd6fe",         // lavender
  places: "#fdba74",         // soft orange
  subjects: "#fde7c4",       // light cream
  school: "#fecaca",         // pale rose
  body: "#ffd9d9",           // pale coral
  clothing: "#e8dcc8",       // warm tan
  weather: "#c9e4f5",        // sky
  transportation: "#a7f3d0", // pale green
  time: "#f5d6a8",           // amber peach
  sensory: "#c7d2fe",        // periwinkle
  rewards: "#ffd966",        // gold
};
