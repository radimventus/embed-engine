import type {
  BuildGatewayAIContextInput,
  GatewayAIContext,
  GatewayAIContextReference,
  GatewayAIContextValidation,
  GatewayAIContextValidationIssue,
} from '../../model';

/**
 * AIContextBuilder (EPIC-BLD-28).
 * Deterministic context construction — no LLM.
 */
export type GatewayAIContextBuilder = {
  readonly id: string;
  supports(input: BuildGatewayAIContextInput): boolean;
  build(
    input: BuildGatewayAIContextInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): GatewayAIContext;
};

/**
 * BasicAIContextBuilder — filter by confidence, dedupe, cap size.
 */
export function createBasicAIContextBuilder(): GatewayAIContextBuilder {
  return {
    id: 'basic-ai-context-builder',

    supports(input) {
      return input.entries.length > 0;
    },

    build(input, createId, now) {
      const stamp = now().toISOString();
      const maxEntries = input.maxEntries ?? 8;
      const minConfidence = input.minConfidence ?? 0.25;

      const seenTitles = new Set<string>();
      const selected: BuildGatewayAIContextInput['entries'][number][] = [];

      const ranked = [...input.entries].sort(
        (a, b) => b.confidence - a.confidence,
      );

      for (const entry of ranked) {
        if (entry.confidence < minConfidence) {
          continue;
        }
        const titleKey = entry.title.trim().toLowerCase();
        if (seenTitles.has(titleKey)) {
          continue;
        }
        seenTitles.add(titleKey);
        selected.push(entry);
        if (selected.length >= maxEntries) {
          break;
        }
      }

      if (selected.length === 0 && ranked.length > 0) {
        selected.push(ranked[0]!);
      }

      const references: GatewayAIContextReference[] = selected.map((entry) => ({
        knowledgeEntryId: entry.id,
        relationship: 'includes' as const,
        weight: Math.round(entry.confidence * 100) / 100,
        metadata: {
          notes: `Included from Knowledge Base (${entry.sourceHeuristics.length} heuristic source(s)).`,
        },
      }));

      const filteredOut = ranked.filter(
        (entry) => !selected.some((item) => item.id === entry.id),
      );
      for (const entry of filteredOut.slice(0, 3)) {
        references.push({
          knowledgeEntryId: entry.id,
          relationship: 'filtered-from',
          weight: Math.round(entry.confidence * 100) / 100,
          metadata: {
            notes: 'Excluded by confidence/dedupe/size filter.',
          },
        });
      }

      const confidence =
        selected.length === 0
          ? 0
          : selected.reduce((sum, item) => sum + item.confidence, 0) /
            selected.length;

      return {
        id: createId('gateway-ai-context'),
        knowledgeEntries: selected.map((item) => item.id),
        references,
        confidence: Math.round(confidence * 1000) / 1000,
        metadata: {
          builderId: 'basic-ai-context-builder',
          status: 'Draft',
          notes: `Deterministic context from ${input.knowledgeBaseTitle}. No LLM.`,
          maxEntries,
        },
        createdAt: stamp,
      };
    },
  };
}

/**
 * AIContextValidator for Gateway (EPIC-BLD-28).
 */
export type GatewayAIContextValidator = {
  validate(context: GatewayAIContext): GatewayAIContextValidation;
  validateReferences(
    context: GatewayAIContext,
  ): readonly GatewayAIContextValidationIssue[];
  validateConfidence(
    context: GatewayAIContext,
  ): readonly GatewayAIContextValidationIssue[];
  validateSize(
    context: GatewayAIContext,
  ): readonly GatewayAIContextValidationIssue[];
};

export function createGatewayAIContextValidator(options?: {
  readonly now?: () => Date;
}): GatewayAIContextValidator {
  const now = options?.now ?? (() => new Date());

  const validateReferences = (
    context: GatewayAIContext,
  ): GatewayAIContextValidationIssue[] => {
    const issues: GatewayAIContextValidationIssue[] = [];
    if (context.references.length === 0) {
      issues.push({
        code: 'empty-references',
        severity: 'error',
        message: `Context ${context.id} has no references.`,
      });
    }
    for (const entryId of context.knowledgeEntries) {
      const hasInclude = context.references.some(
        (ref) =>
          ref.knowledgeEntryId === entryId && ref.relationship === 'includes',
      );
      if (!hasInclude) {
        issues.push({
          code: 'missing-include-ref',
          severity: 'error',
          message: `Entry ${entryId} lacks includes reference.`,
        });
      }
    }
    const included = context.references
      .filter((ref) => ref.relationship === 'includes')
      .map((ref) => ref.knowledgeEntryId);
    const unique = new Set(included);
    if (unique.size !== included.length) {
      issues.push({
        code: 'duplicate-knowledge',
        severity: 'error',
        message: 'Context includes duplicate knowledge entries.',
      });
    }
    return issues;
  };

  const validateConfidence = (
    context: GatewayAIContext,
  ): GatewayAIContextValidationIssue[] => {
    const issues: GatewayAIContextValidationIssue[] = [];
    if (context.confidence < 0 || context.confidence > 1) {
      issues.push({
        code: 'invalid-confidence',
        severity: 'error',
        message: `Context ${context.id} confidence out of range.`,
      });
    }
    if (context.confidence < 0.25) {
      issues.push({
        code: 'low-confidence',
        severity: 'warning',
        message: `Context ${context.id} has low confidence (${context.confidence}).`,
      });
    }
    return issues;
  };

  const validateSize = (
    context: GatewayAIContext,
  ): GatewayAIContextValidationIssue[] => {
    const issues: GatewayAIContextValidationIssue[] = [];
    if (context.knowledgeEntries.length === 0) {
      issues.push({
        code: 'empty-entries',
        severity: 'error',
        message: `Context ${context.id} has no knowledge entries.`,
      });
    }
    if (context.knowledgeEntries.length > context.metadata.maxEntries) {
      issues.push({
        code: 'oversized-context',
        severity: 'error',
        message: `Context exceeds maxEntries (${context.metadata.maxEntries}).`,
      });
    }
    return issues;
  };

  return {
    validateReferences,
    validateConfidence,
    validateSize,
    validate(context) {
      const issues = [
        ...validateReferences(context),
        ...validateConfidence(context),
        ...validateSize(context),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
