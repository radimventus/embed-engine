import type {
  BuildDecisionModelInput,
  ResolvedDecisionInputs,
} from '../../model';

/**
 * DecisionInputResolver (EPIC-BLD-16).
 * Loads / resolves input references only — no evaluation.
 */
export type DecisionInputResolver = {
  resolveKnowledge(input: BuildDecisionModelInput): string | null;
  resolveDecisionKnowledge(input: BuildDecisionModelInput): string | null;
  resolveExperience(input: BuildDecisionModelInput): string | null;
  resolveLearning(input: BuildDecisionModelInput): string | null;
  resolveAll(input: BuildDecisionModelInput): ResolvedDecisionInputs;
};

export function createDecisionInputResolver(): DecisionInputResolver {
  return {
    resolveKnowledge(input) {
      return input.knowledgeId ?? null;
    },
    resolveDecisionKnowledge(input) {
      return input.decisionKnowledgeId ?? null;
    },
    resolveExperience(input) {
      return input.experienceId ?? null;
    },
    resolveLearning(input) {
      return input.learningId ?? null;
    },
    resolveAll(input) {
      const knowledgeId = input.knowledgeId ?? null;
      const decisionKnowledgeId = input.decisionKnowledgeId ?? null;
      const experienceId = input.experienceId ?? null;
      const learningId = input.learningId ?? null;
      return {
        knowledgeId,
        decisionKnowledgeId,
        experienceId,
        learningId,
        knowledgePresent: knowledgeId !== null,
        decisionKnowledgePresent: decisionKnowledgeId !== null,
        experiencePresent: experienceId !== null,
        learningPresent: learningId !== null,
      };
    },
  };
}
