import type { DecisionCategory } from './DecisionCategory';

/**
 * Initial decision categories (placeholders).
 * Names and descriptions will be refined by the methodology workshop.
 */
export const DECISION_CATEGORIES: DecisionCategory[] = [
  {
    id: 'energy',
    title: 'Energy',
    description: 'Placeholder — energy performance and efficiency of the house.',
    icon: '🌿',
  },
  {
    id: 'operating-costs',
    title: 'Operating Costs',
    description: 'Placeholder — ongoing cost of living in and running the house.',
    icon: '💰',
  },
  {
    id: 'layout',
    title: 'Layout',
    description: 'Placeholder — spatial organisation and room relationships.',
    icon: '📐',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    description: 'Placeholder — separation from neighbours and public exposure.',
    icon: '🔒',
  },
  {
    id: 'design',
    title: 'Design',
    description: 'Placeholder — architectural expression and aesthetic quality.',
    icon: '✨',
  },
  {
    id: 'quality',
    title: 'Quality',
    description: 'Placeholder — construction quality and material standards.',
    icon: '⭐',
  },
  {
    id: 'plot',
    title: 'Plot',
    description: 'Placeholder — land suitability and site context.',
    icon: '🏡',
  },
  {
    id: 'investment',
    title: 'Investment',
    description: 'Placeholder — long-term value and financial outlook.',
    icon: '📈',
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    description: 'Placeholder — upkeep effort and durability over time.',
    icon: '🔧',
  },
  {
    id: 'flexibility',
    title: 'Flexibility',
    description: 'Placeholder — adaptability to changing household needs.',
    icon: '🔄',
  },
];
