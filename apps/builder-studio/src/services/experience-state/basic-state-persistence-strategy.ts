import type {
  ExperienceCheckpoint,
  ExperienceState,
  ExperienceStatePackage,
  ExperienceStateSnapshot,
  ExperienceStateValidation,
  ExperienceStateValidationIssue,
} from '../../model';

/**
 * StatePersistenceStrategy (EPIC-BLD-34).
 * Deterministic in-memory persistence — no database.
 */
export type StatePersistenceStrategy = {
  readonly id: string;
  supports(state: ExperienceState): boolean;
  save(checkpoint: ExperienceCheckpoint): ExperienceCheckpoint;
  restore(checkpointId: string): ExperienceCheckpoint | null;
  list(stateId?: string): readonly ExperienceCheckpoint[];
};

/**
 * BasicStatePersistenceStrategy — in-memory checkpoint store.
 */
export function createBasicStatePersistenceStrategy(): StatePersistenceStrategy {
  const store = new Map<string, ExperienceCheckpoint>();

  return {
    id: 'basic-state-persistence-strategy',

    supports(state) {
      return state.sessionId.trim().length > 0 && state.id.trim().length > 0;
    },

    save(checkpoint) {
      store.set(checkpoint.id, checkpoint);
      return checkpoint;
    },

    restore(checkpointId) {
      return store.get(checkpointId) ?? null;
    },

    list(stateId) {
      const all = Array.from(store.values());
      if (stateId === undefined) {
        return all;
      }
      return all.filter((item) => item.stateId === stateId);
    },
  };
}

export function toStateSnapshot(state: ExperienceState): ExperienceStateSnapshot {
  return {
    sessionId: state.sessionId,
    executionId: state.executionId,
    activeModule: state.activeModule,
    activeMove: state.activeMove,
    status: state.status,
    notes: state.metadata.notes,
  };
}

/**
 * ExperienceStateValidator (EPIC-BLD-34).
 */
export type ExperienceStateValidator = {
  validate(pkg: ExperienceStatePackage): ExperienceStateValidation;
  validateCheckpoint(
    pkg: ExperienceStatePackage,
  ): readonly ExperienceStateValidationIssue[];
  validateExecution(
    pkg: ExperienceStatePackage,
  ): readonly ExperienceStateValidationIssue[];
  validateConsistency(
    pkg: ExperienceStatePackage,
  ): readonly ExperienceStateValidationIssue[];
};

export function createExperienceStateValidator(options?: {
  readonly now?: () => Date;
}): ExperienceStateValidator {
  const now = options?.now ?? (() => new Date());

  const validateCheckpoint = (
    pkg: ExperienceStatePackage,
  ): ExperienceStateValidationIssue[] => {
    const issues: ExperienceStateValidationIssue[] = [];
    for (const item of pkg.checkpoints) {
      if (!item.reason.trim()) {
        issues.push({
          code: 'missing-checkpoint-reason',
          severity: 'error',
          message: `Checkpoint ${item.id} missing reason.`,
        });
      }
      if (item.stateId !== pkg.state.id) {
        issues.push({
          code: 'checkpoint-state-mismatch',
          severity: 'error',
          message: `Checkpoint ${item.id} stateId mismatch.`,
        });
      }
      if (!item.snapshot.sessionId.trim()) {
        issues.push({
          code: 'checkpoint-empty-session',
          severity: 'error',
          message: `Checkpoint ${item.id} snapshot missing sessionId.`,
        });
      }
    }
    if (
      pkg.state.checkpointId !== null &&
      !pkg.checkpoints.some((item) => item.id === pkg.state.checkpointId)
    ) {
      issues.push({
        code: 'dangling-checkpoint-id',
        severity: 'error',
        message: `State references missing checkpoint ${pkg.state.checkpointId}.`,
      });
    }
    return issues;
  };

  const validateExecution = (
    pkg: ExperienceStatePackage,
  ): ExperienceStateValidationIssue[] => {
    const issues: ExperienceStateValidationIssue[] = [];
    if (
      pkg.state.status === 'Active' &&
      pkg.state.executionId === null &&
      pkg.state.activeModule === null
    ) {
      issues.push({
        code: 'active-without-progress',
        severity: 'warning',
        message: `Active state ${pkg.state.id} has no execution or module.`,
      });
    }
    if (pkg.state.status === 'Completed' && pkg.state.updatedAt.trim() === '') {
      issues.push({
        code: 'completed-without-updatedAt',
        severity: 'error',
        message: `Completed state ${pkg.state.id} missing updatedAt.`,
      });
    }
    return issues;
  };

  const validateConsistency = (
    pkg: ExperienceStatePackage,
  ): ExperienceStateValidationIssue[] => {
    const issues: ExperienceStateValidationIssue[] = [];
    if (!pkg.state.sessionId.trim()) {
      issues.push({
        code: 'missing-session',
        severity: 'error',
        message: `State ${pkg.state.id} missing sessionId.`,
      });
    }
    if (pkg.metadata.sessionId !== pkg.state.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match state.sessionId.',
      });
    }
    if (pkg.state.status === 'Restored' && pkg.state.checkpointId === null) {
      issues.push({
        code: 'restored-without-checkpoint',
        severity: 'error',
        message: `Restored state ${pkg.state.id} missing checkpointId.`,
      });
    }
    return issues;
  };

  return {
    validateCheckpoint,
    validateExecution,
    validateConsistency,
    validate(pkg) {
      const issues = [
        ...validateCheckpoint(pkg),
        ...validateExecution(pkg),
        ...validateConsistency(pkg),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
