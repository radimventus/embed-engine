import type {
  PersonalizedContextPackage,
  PersonalizationRuntimeEvent,
  ProjectDecisionContextInput,
} from '../../model';
import {
  createBasicPersonalizationProjector,
  createPersonalizationRuntimeValidator,
  type PersonalizationProjector,
  type PersonalizationRuntimeValidator,
} from './basic-personalization-projector';
import {
  createPersonalizationRuntimeIndex,
  type PersonalizationRuntimeIndex,
} from './personalization-runtime-index';

const MAX_HISTORY = 40;

export type PersonalizationRuntimeEngine = {
  initialize(sessionId: string): string;
  project(input: ProjectDecisionContextInput): PersonalizedContextPackage;
  rank(packageId: string): PersonalizedContextPackage;
  validate(packageId: string): PersonalizedContextPackage;
  publish(packageId: string): PersonalizedContextPackage;
  dispose(packageId: string): PersonalizedContextPackage;
  load(packageId: string): PersonalizedContextPackage | null;
  preview(packageId: string): PersonalizedContextPackage | null;
  list(): readonly PersonalizedContextPackage[];
  getIndex(): PersonalizationRuntimeIndex;
  getEvents(packageId?: string): readonly PersonalizationRuntimeEvent[];
  getHistory(packageId?: string): readonly PersonalizationRuntimeEvent[];
};

/**
 * PersonalizationRuntimeEngine (EPIC-BLD-30).
 * AI Context + profiles + session → Personalized Context Package.
 */
export function createPersonalizationRuntimeEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly projector?: PersonalizationProjector;
  readonly validator?: PersonalizationRuntimeValidator;
  readonly index?: PersonalizationRuntimeIndex;
}): PersonalizationRuntimeEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const projector =
    options?.projector ?? createBasicPersonalizationProjector();
  const validator =
    options?.validator ?? createPersonalizationRuntimeValidator({ now });
  const index = options?.index ?? createPersonalizationRuntimeIndex();
  const packages = new Map<string, PersonalizedContextPackage>();
  const lastInputs = new Map<string, ProjectDecisionContextInput>();
  const events: PersonalizationRuntimeEvent[] = [];

  const pushEvent = (
    type: PersonalizationRuntimeEvent['type'],
    packageId: string,
    contextId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('pers-runtime-event'),
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

  const requirePackage = (packageId: string): PersonalizedContextPackage => {
    const current = packages.get(packageId);
    if (current === undefined) {
      throw new Error(`PersonalizedContextPackage not found: ${packageId}`);
    }
    return current;
  };

  const write = (
    next: PersonalizedContextPackage,
  ): PersonalizedContextPackage => {
    packages.set(next.id, next);
    index.index(next.id, next.context);
    pushEvent(
      'PersonalizedContextIndexed',
      next.id,
      next.context.id,
      `Indexed personalized decision context ${next.context.id}`,
    );
    return next;
  };

  return {
    initialize(sessionId) {
      return `personalized-context-package-${sessionId}`;
    },

    project(input) {
      const packageId = this.initialize(input.sessionId);
      if (!projector.supports(input)) {
        throw new Error(
          `Projector ${projector.id} does not support session ${input.sessionId}`,
        );
      }

      const stamp = now().toISOString();
      const context = projector.project(input, createId, now);
      const pkg: PersonalizedContextPackage = {
        id: packageId,
        version: '0.1.0',
        context,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title:
            input.title?.trim() ||
            `${input.aiContextTitle} Decision Context`,
          aiContextPackageId: input.aiContextPackageId,
          sessionId: input.sessionId,
          notes:
            'Runtime personalization projection — KB/AI Context/Session unchanged.',
          status: 'Draft',
        },
        validation: null,
      };

      lastInputs.set(packageId, input);
      write(pkg);
      pushEvent(
        'PersonalizedContextCreated',
        pkg.id,
        context.id,
        `Created decision context for session ${input.sessionId}`,
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
      const context = projector.project(previous, createId, now);
      const next: PersonalizedContextPackage = {
        ...current,
        context,
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      pushEvent(
        'PersonalizedContextCreated',
        next.id,
        context.id,
        `Re-ranked decision context (${context.ranking.length} projections)`,
      );
      return next;
    },

    validate(packageId) {
      const current = requirePackage(packageId);
      const validation = validator.validate(current.context);
      const stamp = now().toISOString();
      const next: PersonalizedContextPackage = {
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
        'PersonalizedContextValidated',
        next.id,
        next.context.id,
        validation.valid
          ? 'Personalized decision context validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    publish(packageId) {
      const current = requirePackage(packageId);
      const validation =
        current.validation ?? validator.validate(current.context);
      if (!validation.valid) {
        const failed: PersonalizedContextPackage = {
          ...current,
          validation,
          updatedAt: now().toISOString(),
        };
        write(failed);
        pushEvent(
          'PersonalizedContextValidated',
          failed.id,
          failed.context.id,
          `Publish blocked (${validation.issues.length} issues)`,
        );
        return failed;
      }

      const stamp = now().toISOString();
      const next: PersonalizedContextPackage = {
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
        'PersonalizedContextPublished',
        next.id,
        next.context.id,
        `Published personalized context package ${next.id}`,
      );
      return next;
    },

    dispose(packageId) {
      const current = requirePackage(packageId);
      const next: PersonalizedContextPackage = {
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
