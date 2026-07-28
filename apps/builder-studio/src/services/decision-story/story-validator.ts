import type {
  ComposeStoryInput,
  DecisionMove,
  DecisionStory,
  StoryEdge,
  StoryGraph,
  StoryNode,
  StoryValidation,
  StoryValidationIssue,
} from '../../model';

/**
 * StoryValidator (EPIC-BLD-18).
 * Structural validation only — no rendering or Runtime.
 */
export type StoryValidator = {
  validate(story: DecisionStory): StoryValidation;
  validateMoves(moves: readonly DecisionMove[]): readonly StoryValidationIssue[];
  validateGraph(graph: StoryGraph): readonly StoryValidationIssue[];
};

export function createStoryValidator(options?: {
  readonly now?: () => Date;
}): StoryValidator {
  const now = options?.now ?? (() => new Date());

  const validateMoves = (
    moves: readonly DecisionMove[],
  ): StoryValidationIssue[] => {
    const issues: StoryValidationIssue[] = [];
    if (moves.length === 0) {
      issues.push({
        code: 'empty-moves',
        severity: 'error',
        message: 'Decision Story has no moves.',
      });
    }
    for (const move of moves) {
      if (move.title.trim() === '') {
        issues.push({
          code: 'empty-move-title',
          severity: 'error',
          message: `Move ${move.id} has empty title.`,
        });
      }
    }
    return issues;
  };

  const validateGraph = (graph: StoryGraph): StoryValidationIssue[] => {
    const issues: StoryValidationIssue[] = [];
    if (graph.nodes.length === 0) {
      issues.push({
        code: 'empty-story-graph',
        severity: 'error',
        message: 'StoryGraph has no nodes.',
      });
    }
    const nodeIds = new Set(graph.nodes.map((node) => node.id));
    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        issues.push({
          code: 'broken-story-edge',
          severity: 'error',
          message: `Story edge ${edge.id} references missing nodes.`,
        });
      }
    }
    return issues;
  };

  return {
    validateMoves,
    validateGraph,
    validate(story) {
      const issues = [
        ...validateMoves(story.moves),
        ...validateGraph(story.graph),
      ];
      if (story.evaluationId.trim() === '') {
        issues.push({
          code: 'missing-evaluation',
          severity: 'error',
          message: 'evaluationId is required.',
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

export function composeMovesFromEvaluation(
  input: ComposeStoryInput,
  createId: (prefix: string) => string,
): DecisionMove[] {
  const moves: DecisionMove[] = [];
  let priority = 1;

  for (const result of input.ruleResults) {
    if (result.status === 'Passed') {
      const insight: DecisionMove = {
        id: createId('move'),
        type: 'insight',
        title: `Insight: ${result.outcome}`,
        description: result.reason,
        priority: priority++,
        references: [result.ruleId, ...result.matchedSignals],
        metadata: { ruleId: result.ruleId, status: result.status },
      };
      moves.push(insight);

      const recommendation: DecisionMove = {
        id: createId('move'),
        type: 'recommendation',
        title: `Recommend: ${result.outcome}`,
        description: `Based on condition "${result.condition}".`,
        priority: priority++,
        references: [result.ruleId],
        metadata: { ruleId: result.ruleId, status: result.status },
      };
      moves.push(recommendation);

      const action: DecisionMove = {
        id: createId('move'),
        type: 'action',
        title: `Action: ${result.outcome}`,
        description: `Apply outcome from passed rule ${result.ruleId}.`,
        priority: priority++,
        references: [result.ruleId],
        metadata: { ruleId: result.ruleId, status: result.status },
      };
      moves.push(action);
    } else if (result.status === 'Failed') {
      moves.push({
        id: createId('move'),
        type: 'insight',
        title: `Gap: ${result.outcome}`,
        description: result.reason,
        priority: priority++,
        references: [result.ruleId],
        metadata: { ruleId: result.ruleId, status: result.status },
      });
    }
  }

  moves.push({
    id: createId('move'),
    type: 'summary',
    title: 'Evaluation summary',
    description: `Passed ${input.evaluationSummary.passed}, failed ${input.evaluationSummary.failed}, skipped ${input.evaluationSummary.skipped}, avg score ${input.evaluationSummary.averageScore}.`,
    priority: priority++,
    references: [input.evaluationId],
    metadata: { ruleId: null, status: null },
  });

  return moves;
}

export function buildStoryGraph(moves: readonly DecisionMove[]): StoryGraph {
  const nodes: StoryNode[] = moves.map((move) => ({
    id: `story-node-${move.id}`,
    type: move.type,
    label: move.title,
    moveId: move.id,
  }));

  const edges: StoryEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const from = nodes[index]!;
    const to = nodes[index + 1]!;
    edges.push({
      id: `story-edge-${from.id}-${to.id}`,
      from: from.id,
      to: to.id,
      relation: 'next',
    });
  }

  return {
    nodes,
    edges,
    metadata: {
      title: 'Story Graph',
      nodeCount: nodes.length,
      edgeCount: edges.length,
    },
  };
}
