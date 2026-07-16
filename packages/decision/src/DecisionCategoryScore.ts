/** Normalized importance score in the closed interval [0.00, 1.00]. */
export type DecisionScore = number;

export interface DecisionCategoryScore {
  categoryId: string;
  score: DecisionScore;
}
