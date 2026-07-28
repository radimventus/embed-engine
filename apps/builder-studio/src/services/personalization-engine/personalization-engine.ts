import type {
  PersonalizationEngineEvent,
  PersonalizationPackage,
  PersonalizeInput,
} from '../../model';
import {
  createBasicPersonalizationStrategy,
  createPersonalizationValidator,
  type PersonalizationStrategy,
  type PersonalizationValidator,
} from './basic-personalization-strategy';
import {
  createPersonalizationIndex,
  type PersonalizationIndex,
} from './personalization-index';

const MAX_HISTORY = 40;

export type PersonalizationEngine = {
  initialize(sessionId: string): string;
  personalize(input: PersonalizeInput): PersonalizationPackage;
  rank(packageId: string): PersonalizationPackage;
  validate(packageId: string): PersonalizationPackage;
  publish(packageId: string): PersonalizationPackage;
  dispose(packageId: string): PersonalizationPackage;
  load(packageId: string): PersonalizationPackage | null;
  preview(packageId: string): PersonalizationPackage | null;
  list(): readonly PersonalizationPackage[];
  getIndex(): PersonalizationIndex;
  getEvents(packageId?: string): readonly PersonalizationEngineEvent[];
  getHistory(packageId?: string): readonly PersonalizationEngineEvent[];
};

/**
 * PersonalizationEngine (EPIC-BLD-29).
 * AI Context Package + Decision Session → Personalization Package.
 * Never mutates AI Context / Runtime / Knowledge.
 */
export function createPersonalizationEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly strategy?: PersonalizationStrategy;
  readonly validator?: PersonalizationValidator;
  readonly index?: PersonalizationIndex;
}): PersonalizationEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const strategy =
    options?.strategy ?? createBasicPersonalizationStrategy();
  const validator =
    options?.validator ?? createPersonalizationValidator({ now });
  const index = options?.index ?? createPersonalizationIndex();
  const packages = new Map<string, PersonalizationPackage>();
  const lastInputs = new Map<string, PersonalizeInput>();
  const events: PersonalizationEngineEvent[] = [];

  const pushEvent = (
    type: PersonalizationEngineEvent['type'],
    packageId: string,
    contextId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('personalization-event'),
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

  const requirePackage = (packageId: string): PersonalizationPackage => {
    const current = packages.get(packageId);
    if (current === undefined) {
      throw new Error(`PersonalizationPackage not found: ${packageId}`);
    }
    return current;
  };

  const write = (next: PersonalizationPackage): PersonalizationPackage => {
    packages.set(next.id, next);
    index.index(next.id, next.context);
    pushEvent(
      'PersonalizationIndexed',
      next.id,
      next.context.id,
      `Indexed personalization ${next.context.id}`,
    );
    return next;
  };

  return {
    initialize(sessionId) {
      return `personalization-package-${sessionId}`;
    },

    personalize(input) {
      const packageId = this.initialize(input.sessionId);
      if (!strategy.supports(input)) {
        throw new Error(
          `Strategy ${strategy.id} does not support session ${input.sessionId}`,
        );
      }

      const stamp = now().toISOString();
      const { context, rules } = strategy.apply(input, createId, now);
      const pkg: PersonalizationPackage = {
        id: packageId,
        version: '0.1.0',
        context,
        rules,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title:
            input.title?.trim() ||
            `${input.aiContextTitle} Personalization`,
          aiContextPackageId: input.aiContextPackageId,
          sessionId: input.sessionId,
          notes:
            'Personalized projection — AI Context and Runtime unchanged. No LLM.',
          status: 'Draft',
        },
        validation: null,
      };

      lastInputs.set(packageId, input);
      write(pkg);
      pushEvent(
        'PersonalizationCreated',
        pkg.id,
        context.id,
        `Created personalization for session ${input.sessionId}`,
      );
      return pkg;
    },

    rank(packageId) {
      const current = requirePackage(packageId);
      const previous = lastInputs.get(packageId);
      if (previous === undefined) {
        throw new Error(`No source input for package ${packageId}`);
      }
      const stamp = now().toISOString();
      const { context, rules } = strategy.apply(previous, createId, now);
      const next: PersonalizationPackage = {
        ...current,
        context,
        rules,
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      pushEvent(
        'PersonalizationCreated',
        next.id,
        context.id,
        `Re-ranked personalization (${context.ranking.length} entries)`,
      );
      return next;
    },

    validate(packageId) {
      const current = requirePackage(packageId);
      const validation = validator.validate(current.context, current.rules);
      const stamp = now().toISOString();
      const next: PersonalizationPackage = {
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
        'PersonalizationValidated',
        next.id,
        next.context.id,
        validation.valid
          ? 'Personalization validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    publish(packageId) {
      const current = requirePackage(packageId);
      const validation =
        current.validation ??
        validator.validate(current.context, current.rules);
      if (!validation.valid) {
        const failed: PersonalizationPackage = {
          ...current,
          validation,
          updatedAt: now().toISOString(),
        };
        write(failed);
        pushEvent(
          'PersonalizationValidated',
          failed.id,
          failed.context.id,
          `Publish blocked (${validation.issues.length} issues)`,
        );
        return failed;
      }

      const stamp = now().toISOString();
      const next: PersonalizationPackage = {
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
        'PersonalizationPublished',
        next.id,
        next.context.id,
        `Published personalization package ${next.id}`,
      );
      return next;
    },

    dispose(packageId) {
      const current = requirePackage(packageId);
      const next: PersonalizationPackage = {
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

    list() {
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
