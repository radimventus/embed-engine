import type {
  KnowledgeEntry,
  KnowledgeSynthesisValidation,
  KnowledgeSynthesisValidationIssue,
  SynthesizeKnowledgeInput,
  SynthesizedKnowledgeReference,
} from '../../model';

/**
 * KnowledgeSynthesizer (EPIC-BLD-27).
 * Deterministic synthesis only — no AI/ML.
 */
export type KnowledgeSynthesizer = {
  readonly id: string;
  supports(input: SynthesizeKnowledgeInput): boolean;
  synthesize(
    input: SynthesizeKnowledgeInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): readonly KnowledgeEntry[];
};

/**
 * BasicKnowledgeSynthesizer — one entry per heuristic + consolidation notes.
 */
export function createBasicKnowledgeSynthesizer(): KnowledgeSynthesizer {
  return {
    id: 'basic-knowledge-synthesizer',

    supports(input) {
      return input.heuristics.length > 0;
    },

    synthesize(input, createId, now) {
      const stamp = now().toISOString();
      const entries: KnowledgeEntry[] = [];

      for (const heuristic of input.heuristics) {
        const references: SynthesizedKnowledgeReference[] = [
          {
            heuristicId: heuristic.id,
            relationship: 'derived-from',
            weight: Math.round(heuristic.confidence * 100) / 100,
            metadata: {
              notes: `Priority ${heuristic.priority}; patterns: ${heuristic.sourcePatterns.join(', ') || 'none'}.`,
            },
          },
        ];

        entries.push({
          id: createId('knowledge-entry'),
          title: heuristic.name.replace(/^Heuristic:\s*/i, 'Knowledge: '),
          description: `Synthesized knowledge from heuristic "${heuristic.name}". ${heuristic.description}`,
          confidence: Math.round(heuristic.confidence * 1000) / 1000,
          sourceHeuristics: [heuristic.id],
          references,
          createdAt: stamp,
          metadata: {
            synthesizerId: 'basic-knowledge-synthesizer',
            status: 'Draft',
            notes: 'Deterministic single-heuristic synthesis.',
          },
        });
      }

      if (input.heuristics.length >= 2) {
        const avgConfidence =
          input.heuristics.reduce((sum, item) => sum + item.confidence, 0) /
          input.heuristics.length;
        entries.push({
          id: createId('knowledge-entry'),
          title: 'Catalog knowledge summary',
          description: `Consolidated knowledge from ${input.heuristics.length} heuristics in "${input.catalogTitle}".`,
          confidence: Math.round(avgConfidence * 1000) / 1000,
          sourceHeuristics: input.heuristics.map((item) => item.id),
          references: input.heuristics.map((heuristic) => ({
            heuristicId: heuristic.id,
            relationship: 'supports' as const,
            weight: Math.round(heuristic.confidence * 100) / 100,
            metadata: {
              notes: 'Catalog-level consolidation reference.',
            },
          })),
          createdAt: stamp,
          metadata: {
            synthesizerId: 'basic-knowledge-synthesizer',
            status: 'Draft',
            notes: 'Deterministic multi-heuristic summary.',
          },
        });
      }

      return entries;
    },
  };
}

/**
 * KnowledgeValidator for synthesis (EPIC-BLD-27).
 */
export type KnowledgeSynthesisValidator = {
  validate(entries: readonly KnowledgeEntry[]): KnowledgeSynthesisValidation;
  validateConsistency(
    entries: readonly KnowledgeEntry[],
  ): readonly KnowledgeSynthesisValidationIssue[];
  validateReferences(
    entries: readonly KnowledgeEntry[],
  ): readonly KnowledgeSynthesisValidationIssue[];
  validateConfidence(
    entries: readonly KnowledgeEntry[],
  ): readonly KnowledgeSynthesisValidationIssue[];
};

export function createKnowledgeSynthesisValidator(options?: {
  readonly now?: () => Date;
}): KnowledgeSynthesisValidator {
  const now = options?.now ?? (() => new Date());

  const validateConsistency = (
    entries: readonly KnowledgeEntry[],
  ): KnowledgeSynthesisValidationIssue[] => {
    const issues: KnowledgeSynthesisValidationIssue[] = [];
    const titles = new Map<string, string>();
    for (const entry of entries) {
      const key = entry.title.trim().toLowerCase();
      const existing = titles.get(key);
      if (existing !== undefined) {
        issues.push({
          code: 'duplicate-title',
          severity: 'warning',
          message: `Duplicate title between ${existing} and ${entry.id}.`,
        });
      } else {
        titles.set(key, entry.id);
      }
      if (!entry.title.trim() || !entry.description.trim()) {
        issues.push({
          code: 'incomplete-entry',
          severity: 'error',
          message: `Entry ${entry.id} is incomplete.`,
        });
      }
    }
    return issues;
  };

  const validateReferences = (
    entries: readonly KnowledgeEntry[],
  ): KnowledgeSynthesisValidationIssue[] => {
    const issues: KnowledgeSynthesisValidationIssue[] = [];
    for (const entry of entries) {
      if (entry.references.length === 0) {
        issues.push({
          code: 'empty-references',
          severity: 'error',
          message: `Entry ${entry.id} has no references.`,
        });
      }
      if (entry.sourceHeuristics.length === 0) {
        issues.push({
          code: 'empty-sources',
          severity: 'error',
          message: `Entry ${entry.id} has no sourceHeuristics.`,
        });
      }
      for (const reference of entry.references) {
        if (!entry.sourceHeuristics.includes(reference.heuristicId)) {
          issues.push({
            code: 'orphan-reference',
            severity: 'warning',
            message: `Entry ${entry.id} reference ${reference.heuristicId} not in sourceHeuristics.`,
          });
        }
      }
    }
    return issues;
  };

  const validateConfidence = (
    entries: readonly KnowledgeEntry[],
  ): KnowledgeSynthesisValidationIssue[] => {
    const issues: KnowledgeSynthesisValidationIssue[] = [];
    for (const entry of entries) {
      if (entry.confidence < 0 || entry.confidence > 1) {
        issues.push({
          code: 'invalid-confidence',
          severity: 'error',
          message: `Entry ${entry.id} confidence out of range.`,
        });
      }
      if (entry.confidence < 0.25) {
        issues.push({
          code: 'low-confidence',
          severity: 'warning',
          message: `Entry ${entry.title} has low confidence (${entry.confidence}).`,
        });
      }
    }
    return issues;
  };

  return {
    validateConsistency,
    validateReferences,
    validateConfidence,
    validate(entries) {
      const issues = [
        ...validateConsistency(entries),
        ...validateReferences(entries),
        ...validateConfidence(entries),
      ];
      if (entries.length === 0) {
        issues.push({
          code: 'empty-entries',
          severity: 'error',
          message: 'Knowledge base is empty.',
        });
      }
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
