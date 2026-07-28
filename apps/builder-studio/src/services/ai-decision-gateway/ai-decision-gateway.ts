import type {
  AIDecisionGatewayEvent,
  BuildGatewayAIContextInput,
  GatewayAIContextPackage,
} from '../../model';
import {
  createBasicAIContextBuilder,
  createGatewayAIContextValidator,
  type GatewayAIContextBuilder,
  type GatewayAIContextValidator,
} from './basic-ai-context-builder';
import {
  createGatewayAIContextIndex,
  type GatewayAIContextIndex,
} from './ai-context-index';

const MAX_HISTORY = 40;

export type AIDecisionGateway = {
  initialize(knowledgeBaseId: string): string;
  buildContext(input: BuildGatewayAIContextInput): GatewayAIContextPackage;
  filter(
    packageId: string,
    options?: { readonly maxEntries?: number; readonly minConfidence?: number },
  ): GatewayAIContextPackage;
  validate(packageId: string): GatewayAIContextPackage;
  publish(packageId: string): GatewayAIContextPackage;
  dispose(packageId: string): GatewayAIContextPackage;
  load(packageId: string): GatewayAIContextPackage | null;
  preview(packageId: string): GatewayAIContextPackage | null;
  listContexts(): readonly GatewayAIContextPackage[];
  getIndex(): GatewayAIContextIndex;
  getEvents(packageId?: string): readonly AIDecisionGatewayEvent[];
  getHistory(packageId?: string): readonly AIDecisionGatewayEvent[];
};

/**
 * AIDecisionGateway (EPIC-BLD-28).
 * Reads Knowledge Base → AI Context Package. Never mutates KB. Never calls LLM.
 */
export function createAIDecisionGateway(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly builder?: GatewayAIContextBuilder;
  readonly validator?: GatewayAIContextValidator;
  readonly index?: GatewayAIContextIndex;
}): AIDecisionGateway {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const builder = options?.builder ?? createBasicAIContextBuilder();
  const validator =
    options?.validator ?? createGatewayAIContextValidator({ now });
  const index = options?.index ?? createGatewayAIContextIndex();
  const packages = new Map<string, GatewayAIContextPackage>();
  const lastInputs = new Map<string, BuildGatewayAIContextInput>();
  const events: AIDecisionGatewayEvent[] = [];

  const pushEvent = (
    type: AIDecisionGatewayEvent['type'],
    packageId: string,
    contextId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('ai-gateway-event'),
      type,
      packageId,
      contextId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requirePackage = (packageId: string): GatewayAIContextPackage => {
    const current = packages.get(packageId);
    if (current === undefined) {
      throw new Error(`AIContextPackage not found: ${packageId}`);
    }
    return current;
  };

  const write = (next: GatewayAIContextPackage): GatewayAIContextPackage => {
    packages.set(next.id, next);
    index.index(next.id, next.metadata.knowledgeBaseId, next.context);
    pushEvent(
      'AIContextIndexed',
      next.id,
      next.context.id,
      `Indexed AI context ${next.context.id}`,
    );
    return next;
  };

  return {
    initialize(knowledgeBaseId) {
      return `ai-context-package-${knowledgeBaseId}`;
    },

    buildContext(input) {
      const packageId = this.initialize(input.knowledgeBaseId);
      if (!builder.supports(input)) {
        throw new Error(
          `Builder ${builder.id} does not support knowledge base ${input.knowledgeBaseId}`,
        );
      }

      const stamp = now().toISOString();
      const context = builder.build(input, createId, now);
      const pkg: GatewayAIContextPackage = {
        id: packageId,
        version: '0.1.0',
        context,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: input.title?.trim() || `${input.knowledgeBaseTitle} AI Context`,
          knowledgeBaseId: input.knowledgeBaseId,
          notes:
            'Prepared from Knowledge Base — KB unchanged. No LLM invocation.',
          status: 'Draft',
        },
        validation: null,
      };

      lastInputs.set(packageId, input);
      write(pkg);
      pushEvent(
        'AIContextBuilt',
        pkg.id,
        context.id,
        `Built AI context with ${context.knowledgeEntries.length} entr(y/ies)`,
      );
      return pkg;
    },

    filter(packageId, filterOptions) {
      const current = requirePackage(packageId);
      const previous = lastInputs.get(packageId);
      if (previous === undefined) {
        throw new Error(`No source input for package ${packageId}`);
      }

      const nextInput: BuildGatewayAIContextInput = {
        ...previous,
        maxEntries: filterOptions?.maxEntries ?? previous.maxEntries,
        minConfidence: filterOptions?.minConfidence ?? previous.minConfidence,
      };
      const stamp = now().toISOString();
      const context = builder.build(nextInput, createId, now);
      const next: GatewayAIContextPackage = {
        ...current,
        context,
        updatedAt: stamp,
        validation: null,
      };
      lastInputs.set(packageId, nextInput);
      write(next);
      pushEvent(
        'AIContextBuilt',
        next.id,
        context.id,
        `Filtered AI context to ${context.knowledgeEntries.length} entr(y/ies)`,
      );
      return next;
    },

    validate(packageId) {
      const current = requirePackage(packageId);
      const validation = validator.validate(current.context);
      const stamp = now().toISOString();
      const next: GatewayAIContextPackage = {
        ...current,
        context: {
          ...current.context,
          metadata: {
            ...current.context.metadata,
            status: validation.valid
              ? ('Validated' as const)
              : current.context.metadata.status,
          },
        },
        validation,
        updatedAt: stamp,
      };
      write(next);
      pushEvent(
        'AIContextValidated',
        next.id,
        next.context.id,
        validation.valid
          ? 'AI context validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    publish(packageId) {
      const current = requirePackage(packageId);
      const validation =
        current.validation ?? validator.validate(current.context);
      if (!validation.valid) {
        const failed: GatewayAIContextPackage = {
          ...current,
          validation,
          updatedAt: now().toISOString(),
        };
        write(failed);
        pushEvent(
          'AIContextValidated',
          failed.id,
          failed.context.id,
          `Publish blocked (${validation.issues.length} issues)`,
        );
        return failed;
      }

      const stamp = now().toISOString();
      const next: GatewayAIContextPackage = {
        ...current,
        version: '1.0.0',
        validation,
        updatedAt: stamp,
        context: {
          ...current.context,
          metadata: {
            ...current.context.metadata,
            status: 'Published',
          },
        },
        metadata: {
          ...current.metadata,
          status: 'Published',
        },
      };
      write(next);
      pushEvent(
        'AIContextPublished',
        next.id,
        next.context.id,
        `Published AI context package ${next.id}`,
      );
      return next;
    },

    dispose(packageId) {
      const current = requirePackage(packageId);
      const next: GatewayAIContextPackage = {
        ...current,
        updatedAt: now().toISOString(),
        context: {
          ...current.context,
          metadata: {
            ...current.context.metadata,
            status: 'Disposed',
          },
        },
        metadata: {
          ...current.metadata,
          status: 'Disposed',
        },
      };
      write(next);
      return next;
    },

    load(packageId) {
      return packages.get(packageId) ?? null;
    },

    preview(packageId) {
      return packages.get(packageId) ?? null;
    },

    listContexts() {
      return Array.from(packages.values());
    },

    getIndex() {
      return index;
    },

    getEvents(packageId) {
      if (packageId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.packageId === packageId);
    },

    getHistory(packageId) {
      return this.getEvents(packageId);
    },
  };
}
