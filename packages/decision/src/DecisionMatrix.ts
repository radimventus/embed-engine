import type { DecisionCategoryScore } from './DecisionCategoryScore';

export type DecisionMatrixVersion = '1.0';

export type DecisionObjectType = 'house';

/**
 * Describes a sellable object from a decision-making perspective.
 *
 * TODO: Decision Matrix will become part of Object Package in a future sprint.
 * Do not connect House Package yet.
 */
export interface DecisionMatrix {
  version: DecisionMatrixVersion;
  objectType: DecisionObjectType;
  categories: DecisionCategoryScore[];
}
