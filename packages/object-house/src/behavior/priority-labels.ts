/**
 * Pilot-facing Priority labels (CZ) — Behavior Pack presentation for Client Studio.
 * Cognitive ids stay English; Experience maps id → label.
 */
export const DISPOSITION_PRIORITY_LABELS_CS: Readonly<Record<string, string>> =
  Object.freeze({
    energy: "Energie",
    "operating-costs": "Provozní náklady",
    layout: "Dispozice",
    privacy: "Soukromí",
    design: "Design",
    quality: "Kvalita",
    plot: "Pozemek",
    investment: "Investice",
    maintenance: "Údržba",
    flexibility: "Flexibilita",
  });

export function dispositionPriorityLabel(id: string): string {
  return DISPOSITION_PRIORITY_LABELS_CS[id] ?? id;
}
