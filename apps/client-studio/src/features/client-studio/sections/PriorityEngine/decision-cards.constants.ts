export type DecisionCategory = {
  id: string;
  title: string;
};

/**
 * Catalogue order — natural decision journey for pilot (presentation order only).
 * IDs unchanged for Runtime compatibility.
 */
export const DECISION_CATEGORIES: DecisionCategory[] = [
  { id: 'plot', title: 'Pozemek' },
  { id: 'layout', title: 'Dispozice' },
  { id: 'privacy', title: 'Soukromí' },
  { id: 'energy', title: 'Energie' },
  { id: 'operating-costs', title: 'Provozní náklady' },
  { id: 'design', title: 'Design' },
  { id: 'quality', title: 'Kvalita' },
  { id: 'investment', title: 'Investice' },
  { id: 'maintenance', title: 'Údržba' },
  { id: 'flexibility', title: 'Flexibilita' },
];

/**
 * Priority card projection — intentionally independent from catalogue order.
 * Investment and flexibility remain available to non-card catalogue consumers.
 */
export const SELECTABLE_DECISION_CATEGORY_IDS = [
  'plot',
  'layout',
  'privacy',
  'design',
  'energy',
  'operating-costs',
  'quality',
  'maintenance',
] as const;

export const SELECTABLE_DECISION_CATEGORIES: readonly DecisionCategory[] =
  SELECTABLE_DECISION_CATEGORY_IDS.map((id) => {
    const category = DECISION_CATEGORIES.find((candidate) => candidate.id === id);
    if (category === undefined) {
      throw new Error(`Unknown selectable decision category: ${id}`);
    }
    return category;
  });

/** Soft clarifications shown only in the right panel — not on cards. */
export const PRIORITY_CLARIFICATIONS: Readonly<Record<string, string>> =
  Object.freeze({
    layout:
      'Dispozice znamená, jak jsou místnosti uspořádané a jak v domě žijete.',
    investment:
      'Investice znamená dlouhodobou hodnotu a jistotu vašeho rozhodnutí.',
  });

export const DECISION_MINIMUM_SELECTION = 3;

export const DECISION_CARD_IMPORTANCE_DEFAULT = 0.5;
