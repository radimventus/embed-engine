import type {
  InitializePublicationExecutionInput,
  PublicationExecutionEvent,
  PublicationExecutionIndexEntry,
  PublicationExecutionPackage,
  PublicationExecutionSession,
  PublicationExecutionValidation,
  StartPublicationExecutionInput,
} from '../../model';
import {
  buildInitialPublicationExecutionPackage,
  createBasicPublicationExecutionStrategy,
  createPublicationExecutionValidator,
  type PublicationExecutionStrategy,
  type PublicationExecutionValidator,
} from './basic-publication-execution-strategy';
import {
  createPublicationExecutionIndex,
  type PublicationExecutionIndex,
} from './publication-execution-index';

export type PublicationExecutionCoordinatorOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: PublicationExecutionStrategy;
  readonly validator?: PublicationExecutionValidator;
  readonly index?: PublicationExecutionIndex;
};

export type PublicationExecutionCoordinator = {
  initialize(input: InitializePublicationExecutionInput): PublicationExecutionPackage;
  start(packageId: string, input: StartPublicationExecutionInput): PublicationExecutionPackage;
  executeStep(packageId: string): PublicationExecutionPackage;
  complete(packageId: string): PublicationExecutionPackage;
  dispose(packageId: string): PublicationExecutionPackage;
  validate(packageId: string): PublicationExecutionValidation;
  getPackage(packageId: string): PublicationExecutionPackage | null;
  listPackages(): readonly PublicationExecutionPackage[];
  listPublicationExecutions(): readonly PublicationExecutionSession[];
  findPublicationExecution(planId: string): PublicationExecutionSession | null;
  getEvents(): readonly PublicationExecutionEvent[];
  getIndex(): readonly PublicationExecutionIndexEntry[];
};

export function createPublicationExecutionCoordinator(
  options: PublicationExecutionCoordinatorOptions = {},
): PublicationExecutionCoordinator {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicPublicationExecutionStrategy();
  const validator = options.validator ?? createPublicationExecutionValidator({ now });
  const index = options.index ?? createPublicationExecutionIndex();

  const packages = new Map<string, PublicationExecutionPackage>();
  const events: PublicationExecutionEvent[] = [];

  const emit = (
    type: PublicationExecutionEvent['type'],
    packageId: string,
    executionSessionId: string | null,
    planId: string | null,
    message: string,
  ) => {
    events.push({
      eventId: createId('publication-execution-event'),
      type,
      packageId,
      executionSessionId,
      planId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): PublicationExecutionPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Publication execution package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: PublicationExecutionPackage): PublicationExecutionPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Publication execution coordinator requires sessionId.');
      }
      let pkg = store(buildInitialPublicationExecutionPackage(input, createId, now));
      if (input.execution !== undefined) {
        pkg = this.start(pkg.id, input.execution);
      }
      return pkg;
    },

    start(packageId, input) {
      const pkg = requirePackage(packageId);
      if (!strategy.supports(input)) {
        throw new Error('Publication execution strategy does not support this input.');
      }
      const session = strategy.start(input, createId, now);
      const next: PublicationExecutionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        session,
        validation: null,
        metadata: {
          ...pkg.metadata,
          title: session.metadata.title,
          status: 'Active',
          notes: 'Publication execution started.',
        },
      };
      store(next);
      emit(
        'PublicationExecutionStarted',
        next.id,
        next.session.id,
        next.session.planId,
        `Started execution for plan ${next.session.planId}.`,
      );
      return next;
    },

    executeStep(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.session.status !== 'RUNNING') {
        throw new Error('Execution step can run only in RUNNING session.');
      }
      const session = strategy.execute(pkg.session, now);
      const next: PublicationExecutionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        session,
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: session.status === 'COMPLETED' ? 'Completed' : 'Active',
          notes:
            session.status === 'COMPLETED'
              ? 'Publication execution completed.'
              : 'Publication execution step completed.',
        },
      };
      store(next);
      emit(
        'PublicationExecutionStepCompleted',
        next.id,
        next.session.id,
        next.session.planId,
        `Step ${next.session.currentStep} completed for plan ${next.session.planId}.`,
      );
      if (session.status === 'COMPLETED') {
        emit(
          'PublicationExecutionCompleted',
          next.id,
          next.session.id,
          next.session.planId,
          `Execution completed for plan ${next.session.planId}.`,
        );
      }
      return next;
    },

    complete(packageId) {
      const pkg = requirePackage(packageId);
      const session: PublicationExecutionSession = {
        ...pkg.session,
        status: 'COMPLETED',
        currentStep: pkg.session.metadata.totalSteps,
        finishedAt: now().toISOString(),
        metadata: {
          ...pkg.session.metadata,
          completedSteps: pkg.session.metadata.totalSteps,
          notes: 'Execution marked as completed.',
        },
      };
      const next: PublicationExecutionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        session,
        metadata: {
          ...pkg.metadata,
          status: 'Completed',
          notes: 'Publication execution completed.',
        },
      };
      store(next);
      emit(
        'PublicationExecutionCompleted',
        next.id,
        next.session.id,
        next.session.planId,
        `Execution completed for plan ${next.session.planId}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: PublicationExecutionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed execution package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: PublicationExecutionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
      };
      store(next);
      if (!validation.valid) {
        emit(
          'PublicationExecutionFailed',
          next.id,
          next.session.id,
          next.session.planId,
          `Execution invalid for plan ${next.session.planId}.`,
        );
      }
      return validation;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listPublicationExecutions() {
      return [...packages.values()].map((pkg) => pkg.session);
    },

    findPublicationExecution(planId) {
      return (
        [...packages.values()].find((pkg) => pkg.session.planId === planId)?.session ??
        null
      );
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
