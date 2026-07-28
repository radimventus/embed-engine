import type {
  ComposeStoryInput,
  DecisionStory,
  StoryEvent,
} from '../../model';
import {
  buildStoryGraph,
  composeMovesFromEvaluation,
  createStoryValidator,
} from './story-validator';

const MAX_HISTORY = 40;

export type DecisionStoryComposer = {
  compose(input: ComposeStoryInput): DecisionStory;
  validateStory(storyId: string): DecisionStory;
  dispose(storyId: string): void;
  load(storyId: string): DecisionStory | null;
  preview(storyId: string): DecisionStory | null;
  getEvents(storyId?: string): readonly StoryEvent[];
  getHistory(storyId?: string): readonly StoryEvent[];
  list(): readonly DecisionStory[];
};

/**
 * DecisionStoryComposer (EPIC-BLD-18).
 * Interprets EvaluationResult into DecisionStory — no UI / Runtime / AI.
 */
export function createDecisionStoryComposer(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): DecisionStoryComposer {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const validator = createStoryValidator({ now });
  const stories = new Map<string, DecisionStory>();
  const events: StoryEvent[] = [];

  const pushEvent = (
    type: StoryEvent['type'],
    storyId: string,
    evaluationId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('story-event'),
      type,
      storyId,
      evaluationId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireStory = (storyId: string): DecisionStory => {
    const current = stories.get(storyId);
    if (current === undefined) {
      throw new Error(`DecisionStory not found: ${storyId}`);
    }
    return current;
  };

  return {
    compose(input) {
      const stamp = now().toISOString();
      const id = `story-${input.evaluationId}`;
      const moves = composeMovesFromEvaluation(input, createId);
      for (const move of moves) {
        pushEvent(
          'MoveAdded',
          id,
          input.evaluationId,
          `Move ${move.type}: ${move.title}`,
        );
      }

      const graph = buildStoryGraph(moves);
      const story: DecisionStory = {
        id,
        decisionModelId: input.decisionModelId,
        evaluationId: input.evaluationId,
        moves,
        graph,
        summary: {
          moveCount: moves.length,
          insightCount: moves.filter((item) => item.type === 'insight').length,
          recommendationCount: moves.filter(
            (item) => item.type === 'recommendation',
          ).length,
          actionCount: moves.filter((item) => item.type === 'action').length,
          passedRules: input.evaluationSummary.passed,
          failedRules: input.evaluationSummary.failed,
        },
        metadata: {
          title: input.title?.trim() || 'Decision Story',
          description:
            'Domain interpretation of EvaluationResult — not UI, Runtime, or AI prompt.',
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
        validation: null,
      };

      stories.set(story.id, story);
      pushEvent(
        'StoryComposed',
        story.id,
        story.evaluationId,
        `Story composed with ${story.moves.length} moves`,
      );
      return story;
    },

    validateStory(storyId) {
      const current = requireStory(storyId);
      const validation = validator.validate(current);
      const stamp = now().toISOString();
      const next: DecisionStory = {
        ...current,
        validation,
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      stories.set(next.id, next);
      pushEvent(
        'StoryValidated',
        next.id,
        next.evaluationId,
        validation.valid
          ? 'Story validated'
          : `Story validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    dispose(storyId) {
      stories.delete(storyId);
    },

    load(storyId) {
      return stories.get(storyId) ?? null;
    },

    preview(storyId) {
      return stories.get(storyId) ?? null;
    },

    getEvents(storyId) {
      if (storyId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.storyId === storyId);
    },

    getHistory(storyId) {
      return this.getEvents(storyId);
    },

    list() {
      return Array.from(stories.values());
    },
  };
}
