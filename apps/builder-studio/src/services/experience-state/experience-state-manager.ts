import type {
  CreateExperienceStateInput,
  ExperienceCheckpoint,
  ExperienceState,
  ExperienceStateEvent,
  ExperienceStatePackage,
  UpdateExperienceStateInput,
} from '../../model';
import {
  createBasicStatePersistenceStrategy,
  createExperienceStateValidator,
  toStateSnapshot,
  type ExperienceStateValidator,
  type StatePersistenceStrategy,
} from './basic-state-persistence-strategy';
import {
  createExperienceStateIndex,
  type ExperienceStateIndex,
} from './experience-state-index';

const MAX_HISTORY = 40;

function composeCurrentState(input: {
  readonly activeModule: string | null;
  readonly activeMove: string | null;
  readonly status: string;
}): string {
  const modulePart = input.activeModule ?? 'none';
  const movePart = input.activeMove ?? 'none';
  return `${input.status}:${modulePart}@${movePart}`;
}

export type ExperienceStateManager = {
  initialize(sessionId: string): string;
  createState(input: CreateExperienceStateInput): ExperienceStatePackage;
  updateState(
    packageId: string,
    patch: UpdateExperienceStateInput,
  ): ExperienceStatePackage;
  createCheckpoint(
    packageId: string,
    reason?: string,
  ): ExperienceStatePackage;
  restore(
    packageId: string,
    checkpointId: string,
  ): ExperienceStatePackage;
  complete(packageId: string): ExperienceStatePackage;
  dispose(packageId: string): ExperienceStatePackage;
  validate(packageId: string): ExperienceStatePackage;
  load(packageId: string): ExperienceStatePackage | null;
  list(): readonly ExperienceStatePackage[];
  getIndex(): ExperienceStateIndex;
  getEvents(packageId?: string): readonly ExperienceStateEvent[];
  getHistory(packageId?: string): readonly ExperienceStateEvent[];
};

/**
 * ExperienceStateManager (EPIC-BLD-35).
 * Runtime state SSOT — does not drive Runtime, modules or orchestration.
 */
export function createExperienceStateManager(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly persistence?: StatePersistenceStrategy;
  readonly validator?: ExperienceStateValidator;
  readonly index?: ExperienceStateIndex;
}): ExperienceStateManager {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const persistence =
    options?.persistence ?? createBasicStatePersistenceStrategy();
  const validator =
    options?.validator ?? createExperienceStateValidator({ now });
  const index = options?.index ?? createExperienceStateIndex();
  const packages = new Map<string, ExperienceStatePackage>();
  const events: ExperienceStateEvent[] = [];

  const pushEvent = (
    type: ExperienceStateEvent['type'],
    packageId: string,
    stateId: string | null,
    checkpointId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('experience-state-event'),
      type,
      packageId,
      stateId,
      checkpointId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requirePackage = (packageId: string): ExperienceStatePackage => {
    const current = packages.get(packageId);
    if (current === undefined) {
      throw new Error(`ExperienceStatePackage not found: ${packageId}`);
    }
    return current;
  };

  const write = (next: ExperienceStatePackage): ExperienceStatePackage => {
    packages.set(next.id, next);
    index.index(next.id, next.state);
    return next;
  };

  return {
    initialize(sessionId) {
      return `experience-state-package-${sessionId}`;
    },

    createState(input) {
      const packageId = this.initialize(input.sessionId);
      const stamp = now().toISOString();
      const activeModule = input.activeModule ?? null;
      const activeMove = input.activeMove ?? null;
      const state: ExperienceState = {
        id: createId('experience-state'),
        sessionId: input.sessionId,
        runtimeExecutionId: input.runtimeExecutionId ?? null,
        moduleExecutionId: input.moduleExecutionId ?? null,
        currentState:
          input.currentState?.trim() ||
          composeCurrentState({
            activeModule,
            activeMove,
            status: 'Active',
          }),
        checkpointId: null,
        status: 'Active',
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title:
            input.title?.trim() ||
            `Experience State ${input.sessionId}`,
          notes:
            'Runtime state SSOT — Knowledge / Story / Personalization unchanged.',
          activeModule,
          activeMove,
          restoreStatus: 'None',
          lastCheckpointReason: null,
        },
      };

      if (!persistence.supports(state)) {
        throw new Error(
          `Persistence ${persistence.id} does not support session ${input.sessionId}`,
        );
      }

      const pkg: ExperienceStatePackage = {
        id: packageId,
        version: '0.1.0',
        state,
        checkpoints: [],
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: state.metadata.title,
          sessionId: input.sessionId,
          notes: state.metadata.notes,
          status: 'Draft',
        },
        validation: null,
      };

      write(pkg);
      pushEvent(
        'ExperienceStateCreated',
        pkg.id,
        state.id,
        null,
        `Created state for session ${input.sessionId}`,
      );
      return pkg;
    },

    updateState(packageId, patch) {
      const current = requirePackage(packageId);
      if (
        current.state.status === 'Disposed' ||
        current.state.status === 'Completed'
      ) {
        throw new Error(
          `Cannot update state in status ${current.state.status}`,
        );
      }

      const stamp = now().toISOString();
      const activeModule =
        patch.activeModule !== undefined
          ? patch.activeModule
          : current.state.metadata.activeModule;
      const activeMove =
        patch.activeMove !== undefined
          ? patch.activeMove
          : current.state.metadata.activeMove;
      const state: ExperienceState = {
        ...current.state,
        runtimeExecutionId:
          patch.runtimeExecutionId !== undefined
            ? patch.runtimeExecutionId
            : current.state.runtimeExecutionId,
        moduleExecutionId:
          patch.moduleExecutionId !== undefined
            ? patch.moduleExecutionId
            : current.state.moduleExecutionId,
        currentState:
          patch.currentState?.trim() ||
          composeCurrentState({
            activeModule,
            activeMove,
            status: 'Active',
          }),
        status: 'Active',
        updatedAt: stamp,
        metadata: {
          ...current.state.metadata,
          activeModule,
          activeMove,
          notes: patch.notes ?? current.state.metadata.notes,
        },
      };

      const next: ExperienceStatePackage = {
        ...current,
        state,
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      pushEvent(
        'ExperienceStateUpdated',
        next.id,
        state.id,
        state.checkpointId,
        `Updated state ${state.id}`,
      );
      return next;
    },

    createCheckpoint(packageId, reason = 'manual-checkpoint') {
      const current = requirePackage(packageId);
      if (current.state.status === 'Disposed') {
        throw new Error('Cannot checkpoint disposed state');
      }

      const stamp = now().toISOString();
      const checkpoint: ExperienceCheckpoint = {
        id: createId('experience-checkpoint'),
        experienceStateId: current.state.id,
        snapshot: toStateSnapshot(current.state),
        reason,
        createdAt: stamp,
        metadata: {
          notes: `Checkpoint for state ${current.state.id}`,
          sequence: current.checkpoints.length + 1,
        },
      };
      persistence.save(checkpoint);

      const state: ExperienceState = {
        ...current.state,
        checkpointId: checkpoint.id,
        updatedAt: stamp,
        metadata: {
          ...current.state.metadata,
          lastCheckpointReason: reason,
        },
      };

      const next: ExperienceStatePackage = {
        ...current,
        state,
        checkpoints: [...current.checkpoints, checkpoint],
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      pushEvent(
        'CheckpointCreated',
        next.id,
        state.id,
        checkpoint.id,
        `Checkpoint ${checkpoint.id} (${reason})`,
      );
      return next;
    },

    restore(packageId, checkpointId) {
      const current = requirePackage(packageId);
      if (current.state.status === 'Disposed') {
        throw new Error('Cannot restore disposed state');
      }

      const checkpoint =
        persistence.restore(checkpointId) ??
        current.checkpoints.find((item) => item.id === checkpointId) ??
        null;

      if (checkpoint === null) {
        const failed: ExperienceStatePackage = {
          ...current,
          state: {
            ...current.state,
            updatedAt: now().toISOString(),
            metadata: {
              ...current.state.metadata,
              restoreStatus: 'Failed',
            },
          },
          updatedAt: now().toISOString(),
        };
        write(failed);
        throw new Error(`Checkpoint not found: ${checkpointId}`);
      }

      const stamp = now().toISOString();
      const state: ExperienceState = {
        ...current.state,
        runtimeExecutionId: checkpoint.snapshot.runtimeExecutionId,
        moduleExecutionId: checkpoint.snapshot.moduleExecutionId,
        currentState: checkpoint.snapshot.currentState,
        status: 'Restored',
        checkpointId: checkpoint.id,
        updatedAt: stamp,
        metadata: {
          ...current.state.metadata,
          notes: checkpoint.snapshot.notes,
          activeModule: checkpoint.snapshot.activeModule,
          activeMove: checkpoint.snapshot.activeMove,
          restoreStatus: 'Restored',
          lastCheckpointReason: checkpoint.reason,
        },
      };

      const next: ExperienceStatePackage = {
        ...current,
        state,
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      pushEvent(
        'ExperienceStateRestored',
        next.id,
        state.id,
        checkpoint.id,
        `Restored from checkpoint ${checkpoint.id}`,
      );
      return next;
    },

    complete(packageId) {
      const current = requirePackage(packageId);
      if (current.state.status === 'Disposed') {
        throw new Error('Cannot complete disposed state');
      }

      const stamp = now().toISOString();
      const state: ExperienceState = {
        ...current.state,
        status: 'Completed',
        currentState: composeCurrentState({
          activeModule: current.state.metadata.activeModule,
          activeMove: current.state.metadata.activeMove,
          status: 'Completed',
        }),
        updatedAt: stamp,
      };
      const next: ExperienceStatePackage = {
        ...current,
        version: '1.0.0',
        state,
        updatedAt: stamp,
        metadata: {
          ...current.metadata,
          status: 'Published',
        },
        validation: current.validation,
      };
      write(next);
      pushEvent(
        'ExperienceStateUpdated',
        next.id,
        state.id,
        state.checkpointId,
        `Completed state ${state.id}`,
      );
      return next;
    },

    validate(packageId) {
      const current = requirePackage(packageId);
      const validation = validator.validate(current);
      const next: ExperienceStatePackage = {
        ...current,
        validation,
        updatedAt: now().toISOString(),
      };
      write(next);
      pushEvent(
        'ExperienceStateValidated',
        next.id,
        next.state.id,
        next.state.checkpointId,
        validation.valid
          ? 'Experience state validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    dispose(packageId) {
      const current = requirePackage(packageId);
      const next: ExperienceStatePackage = {
        ...current,
        updatedAt: now().toISOString(),
        state: {
          ...current.state,
          status: 'Disposed',
          updatedAt: now().toISOString(),
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
