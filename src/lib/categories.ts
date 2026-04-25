import type { PecsCategory } from "@/lib/types";

export const CATEGORY_ORDER: PecsCategory[] = [
  "needs",
  "feelings",
  "social",
  "actions",
  "people",
  "places",
  "sensory",
];

export const CATEGORY_LABEL: Record<PecsCategory, string> = {
  needs: "Needs",
  feelings: "Feelings",
  social: "Social",
  actions: "Activities",
  people: "People",
  places: "Places",
  sensory: "Sensory",
};

export const CATEGORY_COLOR: Record<PecsCategory, string> = {
  needs: "#fde68a",
  feelings: "#fbcfe8",
  social: "#bae6fd",
  actions: "#bbf7d0",
  people: "#ddd6fe",
  places: "#fdba74",
  sensory: "#a7f3d0",
};
