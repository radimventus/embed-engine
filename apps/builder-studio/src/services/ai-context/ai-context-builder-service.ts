import type {
  AIContextPackage,
  BuildAIContextInput,
  ContextEvent,
  ContextFragment,
} from '../../model';
import { createContextComposer } from './context-composer';
import { CONTEXT_SOURCES } from './context-sources';

const MAX_HISTORY = 40;

export type AIContextBuilderService = {
  build(input: BuildAIContextInput): AIContextPackage;
  clear(contextId?: string): AIContextPackage | null;
  refresh(input: BuildAIContextInput): AIContextPackage;
  preview(contextId?: string): AIContextPackage | null;
  getCurrent(): AIContextPackage | null;
  getEvents(contextId?: string): readonly ContextEvent[];
  getHistory(contextId?: string): readonly ContextEvent[];
};

function pickByType(
  fragments: readonly ContextFragment[],
  type: ContextFragment['type'],
): ContextFragment | null {
  return fragments.find((item) => item.type === type) ?? null;
}

/**
 * AIContextBuilderService (EPIC-BLD-13).
 * Composes context only — no AI calls, no prompts, no persistence.
 */
export function createAIContextBuilderService(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): AIContextBuilderService {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const composer = createContextComposer();
  let current: AIContextPackage | null = null;
  const events: ContextEvent[] = [];

  const pushEvent = (
    type: ContextEvent['type'],
    contextId: string,
    objectId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('context-event'),
      type,
      contextId,
      objectId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const assemble = (
    input: BuildAIContextInput,
    previous: AIContextPackage | null,
    eventType: 'ContextBuilt' | 'ContextRefreshed',
  ): AIContextPackage => {
    const stamp = now().toISOString();
    const collected = CONTEXT_SOURCES.map((source) => source.collect(input));
    const fragments = composer.compose(collected);
    const id = previous?.id ?? `ai-context-${input.objectId}`;
    const version =
      previous === null
        ? '1.0.0'
        : (() => {
            const parts = previous.version.split('.').map(Number);
            const major = parts[0] ?? 1;
            const minor = parts[1] ?? 0;
            const patch = (parts[2] ?? 0) + 1;
            return `${major}.${minor}.${patch}`;
          })();

    const next: AIContextPackage = {
      id,
      version,
      objectContext: pickByType(fragments, 'object'),
      experienceContext: pickByType(fragments, 'experience'),
      knowledgeContext: pickByType(fragments, 'knowledge'),
      decisionContext: pickByType(fragments, 'decision'),
      fragments,
      metadata: {
        title:
          input.title?.trim() ||
          previous?.metadata.title ||
          'AI Context Package',
        description:
          'Temporary composed context — AI never reads source packages directly.',
        objectId: input.objectId,
        projectId: input.projectId,
        status: 'Built',
      },
      timestamps: {
        createdAt: previous?.timestamps.createdAt ?? stamp,
        updatedAt: stamp,
      },
    };

    current = next;
    pushEvent(
      eventType,
      next.id,
      next.metadata.objectId,
      eventType === 'ContextBuilt'
        ? `Context built with ${fragments.length} fragments`
        : `Context refreshed (${fragments.length} fragments)`,
    );
    return next;
  };

  return {
    build(input) {
      return assemble(input, null, 'ContextBuilt');
    },

    clear(contextId) {
      if (current === null) {
        return null;
      }
      if (contextId !== undefined && current.id !== contextId) {
        return current;
      }
      const stamp = now().toISOString();
      const cleared: AIContextPackage = {
        ...current,
        objectContext: null,
        experienceContext: null,
        knowledgeContext: null,
        decisionContext: null,
        fragments: [],
        metadata: {
          ...current.metadata,
          status: 'Cleared',
        },
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      pushEvent(
        'ContextCleared',
        cleared.id,
        cleared.metadata.objectId,
        'Context cleared',
      );
      current = cleared;
      return cleared;
    },

    refresh(input) {
      return assemble(input, current, 'ContextRefreshed');
    },

    preview(contextId) {
      if (current === null) {
        return null;
      }
      if (contextId !== undefined && current.id !== contextId) {
        return null;
      }
      return current;
    },

    getCurrent() {
      return current;
    },

    getEvents(contextId) {
      if (contextId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.contextId === contextId);
    },

    getHistory(contextId) {
      return this.getEvents(contextId);
    },
  };
}
