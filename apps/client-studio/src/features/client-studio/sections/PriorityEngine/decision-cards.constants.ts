export type DecisionCategory = {
  id: string;
  title: string;
};

export const DECISION_CATEGORIES: DecisionCategory[] = [
  { id: 'energy', title: 'Energie' },
  { id: 'operating-costs', title: 'Provozní náklady' },
  { id: 'layout', title: 'Dispozice' },
  { id: 'privacy', title: 'Soukromí' },
  { id: 'design', title: 'Design' },
  { id: 'quality', title: 'Kvalita' },
  { id: 'plot', title: 'Pozemek' },
  { id: 'investment', title: 'Investice' },
  { id: 'maintenance', title: 'Údržba' },
  { id: 'flexibility', title: 'Flexibilita' },
];

export const DECISION_MINIMUM_SELECTION = 3;

export const DECISION_CARD_IMPORTANCE_DEFAULT = 0.5;
