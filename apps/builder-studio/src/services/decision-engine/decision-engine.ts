import type {
  BuildDecisionModelInput,
  DecisionEngineEvent,
  DecisionModel,
  DecisionModelValidation,
} from '../../model';
import { buildDecisionGraph } from './decision-graph-builder';
import { createDecisionInputResolver } from './decision-input-resolver';

const MAX_HISTORY = 40;

export type DecisionEngine = {
  createDecisionModel(input: BuildDecisionModelInput): DecisionModel;
  loadDecisionModel(id: string): DecisionModel | null;
  validateDecisionModel(id: string): DecisionModel;
  dispose(id: string): DecisionModel;
  getEvents(decisionModelId?: string): readonly DecisionEngineEvent[];
  getHistory(decisionModelId?: string): readonly DecisionEngineEvent[];
  list(): readonly DecisionModel[];
  previewDecisionGraph(id: string): DecisionModel['graph'] | null;
};

/**
 * DecisionEngine (EPIC-BLD-16).
 * Assembles decision models only — no rule evaluation, Story, Runtime, or AI.
 */
export function createDecisionEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): DecisionEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const resolver = createDecisionInputResolver();
  const models = new Map<string, DecisionModel>();
  const events: DecisionEngineEvent[] = [];

  const pushEvent = (
    type: DecisionEngineEvent['type'],
    decisionModelId: string,
    objectId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('decision-engine-event'),
      type,
      decisionModelId,
      objectId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireModel = (id: string): DecisionModel => {
    const current = models.get(id);
    if (current === undefined) {
      throw new Error(`DecisionModel not found: ${id}`);
    }
    return current;
  };

  const write = (next: DecisionModel): DecisionModel => {
    models.set(next.id, next);
    return next;
  };

  return {
    createDecisionModel(input) {
      const existingId = `decision-model-${input.objectId}`;
      const existing = models.get(existingId);
      if (existing !== undefined && existing.metadata.status !== 'Disposed') {
        return existing;
      }

      const stamp = now().toISOString();
      const resolved = resolver.resolveAll(input);
      const graph = buildDecisionGraph(input);

      const created: DecisionModel = {
        id: existingId,
        objectId: input.objectId,
        knowledge: resolved.knowledgeId,
        decisionKnowledge: resolved.decisionKnowledgeId,
        experience: resolved.experienceId,
        learning: resolved.learningId,
        graph,
        metadata: {
          title: input.title?.trim() || 'Decision Model',
          description:
            'Assembled decision model — no evaluation, Story, or Runtime.',
          status: 'Draft',
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
        validation: null,
      };

      write(created);
      pushEvent(
        'DecisionModelCreated',
        created.id,
        created.objectId,
        `Decision model created for ${created.objectId}`,
      );
      pushEvent(
        'DecisionGraphBuilt',
        created.id,
        created.objectId,
        `Graph built: ${graph.metadata.nodeCount} nodes, ${graph.metadata.edgeCount} edges`,
      );
      return created;
    },

    loadDecisionModel(id) {
      return models.get(id) ?? null;
    },

    validateDecisionModel(id) {
      const current = requireModel(id);
      const stamp = now().toISOString();
      const issues: DecisionModelValidation['issues'][number][] = [];

      if (current.knowledge === null) {
        issues.push({
          code: 'missing-knowledge',
          severity: 'warning',
          message: 'Knowledge input is missing.',
        });
      }
      if (current.decisionKnowledge === null) {
        issues.push({
          code: 'missing-decision-knowledge',
          severity: 'error',
          message: 'Decision Knowledge input is required.',
        });
      }
      if (current.experience === null) {
        issues.push({
          code: 'missing-experience',
          severity: 'warning',
          message: 'Experience input is missing.',
        });
      }
      if (current.graph.nodes.length === 0) {
        issues.push({
          code: 'empty-graph',
          severity: 'error',
          message: 'Decision Graph has no nodes.',
        });
      }

      const validation: DecisionModelValidation = {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: stamp,
      };

      const next: DecisionModel = {
        ...current,
        metadata: {
          ...current.metadata,
          status: validation.valid ? 'Validated' : 'Draft',
        },
        validation,
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      write(next);
      pushEvent(
        'DecisionModelValidated',
        next.id,
        next.objectId,
        validation.valid
          ? 'Decision model validated'
          : `Decision model validation failed (${issues.length} issues)`,
      );
      return next;
    },

    dispose(id) {
      const current = requireModel(id);
      const stamp = now().toISOString();
      const next: DecisionModel = {
        ...current,
        metadata: {
          ...current.metadata,
          status: 'Disposed',
        },
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      write(next);
      return next;
    },

    getEvents(decisionModelId) {
      if (decisionModelId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.decisionModelId === decisionModelId);
    },

    getHistory(decisionModelId) {
      return this.getEvents(decisionModelId);
    },

    list() {
      return Array.from(models.values());
    },

    previewDecisionGraph(id) {
      return models.get(id)?.graph ?? null;
    },
  };
}
