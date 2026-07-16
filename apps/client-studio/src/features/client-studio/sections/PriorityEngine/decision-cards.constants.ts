export type DecisionCategory = {
  id: string;
  icon: string;
  title: string;
};

export const DECISION_CATEGORIES: DecisionCategory[] = [
  { id: 'energy', icon: '🌿', title: 'Energy' },
  { id: 'operating-costs', icon: '💰', title: 'Operating Costs' },
  { id: 'layout', icon: '📐', title: 'Layout' },
  { id: 'privacy', icon: '🔒', title: 'Privacy' },
  { id: 'design', icon: '✨', title: 'Design' },
  { id: 'quality', icon: '⭐', title: 'Quality' },
  { id: 'plot', icon: '🏡', title: 'Plot' },
  { id: 'investment', icon: '📈', title: 'Investment' },
  { id: 'maintenance', icon: '🔧', title: 'Maintenance' },
  { id: 'flexibility', icon: '🔄', title: 'Flexibility' },
];

export const DECISION_MINIMUM_SELECTION = 3;

export const DECISION_CARD_IMPORTANCE_DEFAULT = 0.5;
