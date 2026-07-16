import type { DecisionMatrix } from './DecisionMatrix';

/**
 * Architectural example only — not connected to UI or runtime.
 * Demonstrates how object-side scores map to category identifiers.
 */
export const HOUSE_MATRIX_SCORES = {
  energy: 0.91,
  operatingCosts: 0.86,
  layout: 0.74,
  privacy: 0.88,
  design: 0.71,
  quality: 0.83,
  plot: 0.62,
  investment: 0.79,
  maintenance: 0.67,
  flexibility: 0.55,
} as const;

/**
 * Canonical DecisionMatrix shape derived from the example score map.
 */
export const HOUSE_DECISION_MATRIX_EXAMPLE: DecisionMatrix = {
  version: '1.0',
  objectType: 'house',
  categories: [
    { categoryId: 'energy', score: HOUSE_MATRIX_SCORES.energy },
    { categoryId: 'operating-costs', score: HOUSE_MATRIX_SCORES.operatingCosts },
    { categoryId: 'layout', score: HOUSE_MATRIX_SCORES.layout },
    { categoryId: 'privacy', score: HOUSE_MATRIX_SCORES.privacy },
    { categoryId: 'design', score: HOUSE_MATRIX_SCORES.design },
    { categoryId: 'quality', score: HOUSE_MATRIX_SCORES.quality },
    { categoryId: 'plot', score: HOUSE_MATRIX_SCORES.plot },
    { categoryId: 'investment', score: HOUSE_MATRIX_SCORES.investment },
    { categoryId: 'maintenance', score: HOUSE_MATRIX_SCORES.maintenance },
    { categoryId: 'flexibility', score: HOUSE_MATRIX_SCORES.flexibility },
  ],
};
