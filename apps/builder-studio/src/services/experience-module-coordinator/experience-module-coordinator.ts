import type {
  ExperienceModuleExecution,
  ExperienceModulePackage,
  InitializeModulesInput,
  ModuleCoordinatorEvent,
  ModuleTransition,
} from '../../model';
import {
  createBasicModuleExecutionStrategy,
  createModuleExecutionValidator,
  type ModuleExecutionStrategy,
  type ModuleExecutionValidator,
} from './basic-module-execution-strategy';
import {
  createModuleExecutionIndex,
  type ModuleExecutionIndex,
} from './module-execution-index';

const MAX_HISTORY = 40;

const MODULE_LABELS: Record<string, string> = {
  hero: 'Hero',
  'market-pulse': 'Market Pulse',
  'house-navigator': 'House Navigator',
  priority: 'Priority',
  faq: 'FAQ',
  'ai-advisor': 'AI Advisor',
  'lead-capture': 'Lead Capture',
};

export type ExperienceModuleCoordinator = {
  initialize(input: InitializeModulesInput): ExperienceModulePackage;
  activateModule(
    packageId: string,
    moduleId: string,
  ): ExperienceModulePackage;
  deactivateModule(
    packageId: string,
    moduleId: string,
  ): ExperienceModulePackage;
  transition(packageId: string): ExperienceModulePackage;
  complete(packageId: string): ExperienceModulePackage;
  dispose(packageId: string): ExperienceModulePackage;
  validate(packageId: string): ExperienceModulePackage;
  load(packageId: string): ExperienceModulePackage | null;
  list(): readonly ExperienceModulePackage[];
  getIndex(): ModuleExecutionIndex;
  getEvents(packageId?: string): readonly ModuleCoordinatorEvent[];
  getHistory(packageId?: string): readonly ModuleCoordinatorEvent[];
};

/**
 * ExperienceModuleCoordinator (EPIC-BLD-33).
 * Module lifecycle only — no Knowledge / AI / Personalization / module logic.
 */
export function createExperienceModuleCoordinator(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly strategy?: ModuleExecutionStrategy;
  readonly validator?: ModuleExecutionValidator;
  readonly index?: ModuleExecutionIndex;
}): ExperienceModuleCoordinator {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const strategy =
    options?.strategy ?? createBasicModuleExecutionStrategy();
  const validator =
    options?.validator ?? createModuleExecutionValidator({ now });
  const index = options?.index ?? createModuleExecutionIndex();
  const packages = new Map<string, ExperienceModulePackage>();
  const events: ModuleCoordinatorEvent[] = [];

  const pushEvent = (
    type: ModuleCoordinatorEvent['type'],
    packageId: string,
    moduleId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('module-coordinator-event'),
      type,
      packageId,
      moduleId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requirePackage = (packageId: string): ExperienceModulePackage => {
    const current = packages.get(packageId);
    if (current === undefined) {
      throw new Error(`ExperienceModulePackage not found: ${packageId}`);
    }
    return current;
  };

  const write = (next: ExperienceModulePackage): ExperienceModulePackage => {
    packages.set(next.id, next);
    index.index(next.id, next.modules);
    return next;
  };

  return {
    initialize(input) {
      if (!strategy.supports(input)) {
        throw new Error(
          `Strategy ${strategy.id} does not support session ${input.sessionId}`,
        );
      }

      const packageId = `experience-module-package-${input.sessionId}`;
      const stamp = now().toISOString();
      const modules: ExperienceModuleExecution[] = input.moduleIds.map(
        (moduleId, indexValue) => ({
          id: createId('module-execution'),
          sessionId: input.sessionId,
          moduleId,
          status: 'Pending',
          startedAt: null,
          completedAt: null,
          metadata: {
            label: MODULE_LABELS[moduleId] ?? moduleId,
            notes: 'Pending module lifecycle.',
            sequence: indexValue + 1,
          },
        }),
      );

      const pkg: ExperienceModulePackage = {
        id: packageId,
        version: '0.1.0',
        modules,
        transitions: [],
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title:
            input.title?.trim() ||
            `Experience Modules ${input.sessionId}`,
          sessionId: input.sessionId,
          activeModuleId: null,
          notes:
            'Module coordination only — Story / Personalization / Knowledge unchanged.',
          status: 'Draft',
        },
        validation: null,
      };

      return write(pkg);
    },

    activateModule(packageId, moduleId) {
      const current = requirePackage(packageId);
      if (current.metadata.status === 'Disposed') {
        throw new Error('Cannot activate module on disposed package');
      }
      const target = current.modules.find((item) => item.moduleId === moduleId);
      if (target === undefined) {
        throw new Error(`Module not found: ${moduleId}`);
      }

      const stamp = now().toISOString();
      const fromModule =
        current.modules.find((item) => item.status === 'Active')?.moduleId ??
        null;

      const modules = current.modules.map((item) => {
        if (item.status === 'Active' && item.moduleId !== moduleId) {
          return {
            ...item,
            status: 'Deactivated' as const,
            completedAt: stamp,
          };
        }
        if (item.moduleId === moduleId) {
          return {
            ...item,
            status: 'Active' as const,
            startedAt: item.startedAt ?? stamp,
            completedAt: null,
          };
        }
        return item;
      });

      const transition: ModuleTransition = {
        fromModule,
        toModule: moduleId,
        reason: 'activate',
        timestamp: stamp,
        metadata: {
          notes: `Activated ${moduleId}`,
          action: 'activate',
        },
      };

      const next: ExperienceModulePackage = {
        ...current,
        modules,
        transitions: [...current.transitions, transition],
        updatedAt: stamp,
        metadata: {
          ...current.metadata,
          activeModuleId: moduleId,
        },
        validation: null,
      };
      write(next);
      pushEvent(
        'ModuleActivated',
        next.id,
        moduleId,
        `Activated module ${moduleId}`,
      );
      if (fromModule !== null && fromModule !== moduleId) {
        pushEvent(
          'ModuleTransitioned',
          next.id,
          moduleId,
          `Transition ${fromModule} → ${moduleId}`,
        );
      }
      return next;
    },

    deactivateModule(packageId, moduleId) {
      const current = requirePackage(packageId);
      const stamp = now().toISOString();
      const modules = current.modules.map((item) =>
        item.moduleId === moduleId && item.status === 'Active'
          ? {
              ...item,
              status: 'Deactivated' as const,
              completedAt: stamp,
            }
          : item,
      );
      const transition: ModuleTransition = {
        fromModule: moduleId,
        toModule: null,
        reason: 'deactivate',
        timestamp: stamp,
        metadata: {
          notes: `Deactivated ${moduleId}`,
          action: 'deactivate',
        },
      };
      const next: ExperienceModulePackage = {
        ...current,
        modules,
        transitions: [...current.transitions, transition],
        updatedAt: stamp,
        metadata: {
          ...current.metadata,
          activeModuleId:
            current.metadata.activeModuleId === moduleId
              ? null
              : current.metadata.activeModuleId,
        },
        validation: null,
      };
      write(next);
      pushEvent(
        'ModuleTransitioned',
        next.id,
        moduleId,
        `Deactivated module ${moduleId}`,
      );
      return next;
    },

    transition(packageId) {
      const current = requirePackage(packageId);
      if (current.metadata.status === 'Disposed') {
        throw new Error('Cannot transition disposed package');
      }

      const resolved = strategy.nextModule(current);
      const stepped = strategy.transition(
        current,
        resolved.moduleId,
        resolved.completed ? 'complete-sequence' : 'next-module',
        now,
      );

      const stamp = now().toISOString();
      const next: ExperienceModulePackage = {
        ...current,
        modules: stepped.modules,
        transitions: [...current.transitions, stepped.transition],
        updatedAt: stamp,
        metadata: {
          ...current.metadata,
          activeModuleId: stepped.activeModuleId,
          status: stepped.completed ? 'Published' : current.metadata.status,
        },
        version: stepped.completed ? '1.0.0' : current.version,
        validation: null,
      };
      write(next);
      pushEvent(
        'ModuleTransitioned',
        next.id,
        stepped.activeModuleId,
        `Transition ${stepped.transition.fromModule ?? '∅'} → ${stepped.transition.toModule ?? '∅'}`,
      );
      if (stepped.completed) {
        pushEvent(
          'ModuleCompleted',
          next.id,
          null,
          'Module sequence completed',
        );
      } else if (stepped.activeModuleId !== null) {
        pushEvent(
          'ModuleActivated',
          next.id,
          stepped.activeModuleId,
          `Activated module ${stepped.activeModuleId}`,
        );
      }
      return next;
    },

    complete(packageId) {
      const current = requirePackage(packageId);
      if (current.metadata.status === 'Disposed') {
        throw new Error('Cannot complete disposed package');
      }

      const stamp = now().toISOString();
      const modules = current.modules.map((item) => {
        if (item.status === 'Completed' || item.status === 'Disposed') {
          return item;
        }
        if (item.status === 'Active' || item.status === 'Pending') {
          return {
            ...item,
            status: 'Completed' as const,
            startedAt: item.startedAt ?? stamp,
            completedAt: stamp,
          };
        }
        return {
          ...item,
          status: 'Completed' as const,
          completedAt: item.completedAt ?? stamp,
        };
      });

      const transition: ModuleTransition = {
        fromModule: current.metadata.activeModuleId,
        toModule: null,
        reason: 'complete',
        timestamp: stamp,
        metadata: {
          notes: 'All modules marked completed.',
          action: 'complete',
        },
      };

      const next: ExperienceModulePackage = {
        ...current,
        version: '1.0.0',
        modules,
        transitions: [...current.transitions, transition],
        updatedAt: stamp,
        metadata: {
          ...current.metadata,
          activeModuleId: null,
          status: 'Published',
        },
        validation: current.validation,
      };
      write(next);
      pushEvent(
        'ModuleCompleted',
        next.id,
        null,
        `Completed module package ${next.id}`,
      );
      return next;
    },

    validate(packageId) {
      const current = requirePackage(packageId);
      const validation = validator.validate(current);
      const next: ExperienceModulePackage = {
        ...current,
        validation,
        updatedAt: now().toISOString(),
      };
      write(next);
      pushEvent(
        'ModuleValidated',
        next.id,
        next.metadata.activeModuleId,
        validation.valid
          ? 'Module package validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    dispose(packageId) {
      const current = requirePackage(packageId);
      const next: ExperienceModulePackage = {
        ...current,
        updatedAt: now().toISOString(),
        modules: current.modules.map((item) => ({
          ...item,
          status: 'Disposed',
        })),
        metadata: {
          ...current.metadata,
          activeModuleId: null,
          status: 'Disposed',
        },
      };
      write(next);
      return next;
    },

    load(packageId) {
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
