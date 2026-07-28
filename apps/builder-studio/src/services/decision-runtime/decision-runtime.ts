import type {
  CreateRuntimeInput,
  DecisionRuntimeEvent,
  RuntimeGraph,
  RuntimeModel,
  RuntimeValidation,
} from '../../model';

const MAX_HISTORY = 40;

function projectGraph(
  input: CreateRuntimeInput,
): RuntimeGraph {
  return {
    nodes: input.graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      label: node.label,
      sourceId: node.sourceId,
    })),
    edges: input.graph.edges.map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      relation: edge.relation,
    })),
    metadata: {
      title: 'Runtime Graph',
      nodeCount: input.graph.nodes.length,
      edgeCount: input.graph.edges.length,
      projectedFrom: input.decisionModelId,
    },
  };
}

export type DecisionRuntime = {
  createRuntime(input: CreateRuntimeInput): RuntimeModel;
  loadRuntime(id: string): RuntimeModel | null;
  validateRuntime(id: string): RuntimeModel;
  dispose(id: string): RuntimeModel;
  previewRuntime(id: string): RuntimeModel | null;
  getEvents(runtimeId?: string): readonly DecisionRuntimeEvent[];
  getHistory(runtimeId?: string): readonly DecisionRuntimeEvent[];
  list(): readonly RuntimeModel[];
};

/**
 * DecisionRuntime (EPIC-BLD-16 Runtime Foundation).
 * Prepares executable model only — no evaluation, session, or persistence.
 */
export function createDecisionRuntime(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): DecisionRuntime {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const runtimes = new Map<string, RuntimeModel>();
  const events: DecisionRuntimeEvent[] = [];

  const pushEvent = (
    type: DecisionRuntimeEvent['type'],
    runtimeId: string,
    decisionModelId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('runtime-event'),
      type,
      runtimeId,
      decisionModelId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireRuntime = (id: string): RuntimeModel => {
    const current = runtimes.get(id);
    if (current === undefined) {
      throw new Error(`RuntimeModel not found: ${id}`);
    }
    return current;
  };

  const write = (next: RuntimeModel): RuntimeModel => {
    runtimes.set(next.id, next);
    return next;
  };

  return {
    createRuntime(input) {
      const id = `runtime-${input.decisionModelId}`;
      const existing = runtimes.get(id);
      if (existing !== undefined && existing.status !== 'Disposed') {
        return existing;
      }

      const stamp = now().toISOString();
      const graph = projectGraph(input);
      const created: RuntimeModel = {
        id,
        decisionModelId: input.decisionModelId,
        status: 'Initialized',
        graph,
        context: {
          inputs: {
            knowledgeId: input.knowledgeId ?? null,
            decisionKnowledgeId: input.decisionKnowledgeId ?? null,
            experienceId: input.experienceId ?? null,
            learningId: input.learningId ?? null,
          },
          environment: {
            mode: 'builder-preview',
            readonly: true,
          },
          configuration: {
            evaluateRules: false,
            evaluateSignals: false,
            enableStory: false,
            enableAi: false,
          },
          metadata: {
            notes:
              'Prepared from DecisionModel — no evaluation, session, or persistence.',
          },
        },
        metadata: {
          title: input.title?.trim() || 'Runtime Model',
          description:
            'Executable preparation from DecisionModel — Runtime interprets nothing.',
          objectId: input.objectId,
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
        validation: null,
      };

      write(created);
      pushEvent(
        'RuntimeCreated',
        created.id,
        created.decisionModelId,
        `Runtime created from ${created.decisionModelId}`,
      );
      return created;
    },

    loadRuntime(id) {
      return runtimes.get(id) ?? null;
    },

    validateRuntime(id) {
      const current = requireRuntime(id);
      if (current.status === 'Disposed') {
        throw new Error(`Cannot validate disposed runtime: ${id}`);
      }

      const stamp = now().toISOString();
      const issues: RuntimeValidationIssueMutable[] = [];

      if (current.decisionModelId.trim() === '') {
        issues.push({
          code: 'missing-decision-model',
          severity: 'error',
          message: 'decisionModelId is required.',
        });
      }
      if (current.graph.nodes.length === 0) {
        issues.push({
          code: 'empty-runtime-graph',
          severity: 'error',
          message: 'Runtime Graph has no nodes.',
        });
      }
      if (current.context.inputs.decisionKnowledgeId === null) {
        issues.push({
          code: 'missing-decision-knowledge-input',
          severity: 'warning',
          message: 'Decision Knowledge input is missing in RuntimeContext.',
        });
      }

      const validation: RuntimeValidation = {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: stamp,
      };

      const next: RuntimeModel = {
        ...current,
        status: validation.valid ? 'Ready' : 'Initialized',
        validation,
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      write(next);
      pushEvent(
        'RuntimeValidated',
        next.id,
        next.decisionModelId,
        validation.valid
          ? 'Runtime validated — Ready'
          : `Runtime validation failed (${issues.length} issues)`,
      );
      return next;
    },

    dispose(id) {
      const current = requireRuntime(id);
      const stamp = now().toISOString();
      const next: RuntimeModel = {
        ...current,
        status: 'Disposed',
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      write(next);
      pushEvent(
        'RuntimeDisposed',
        next.id,
        next.decisionModelId,
        'Runtime disposed',
      );
      return next;
    },

    previewRuntime(id) {
      return runtimes.get(id) ?? null;
    },

    getEvents(runtimeId) {
      if (runtimeId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.runtimeId === runtimeId);
    },

    getHistory(runtimeId) {
      return this.getEvents(runtimeId);
    },

    list() {
      return Array.from(runtimes.values());
    },
  };
}

type RuntimeValidationIssueMutable = {
  code: string;
  severity: 'error' | 'warning';
  message: string;
};
