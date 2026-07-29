import type {
  ExperienceModuleExecution,
  ExperienceModulePackage,
  InitializeModulesInput,
  ModuleExecutionValidation,
  ModuleExecutionValidationIssue,
  ModuleTransition,
} from '../../model';

/**
 * ModuleExecutionStrategy (EPIC-BLD-33).
 * Deterministic module sequence only — no AI / module business logic.
 */
export type ModuleExecutionStrategy = {
  readonly id: string;
  supports(input: InitializeModulesInput): boolean;
  nextModule(
    pkg: ExperienceModulePackage,
  ): {
    readonly moduleId: string | null;
    readonly completed: boolean;
  };
  transition(
    pkg: ExperienceModulePackage,
    toModuleId: string | null,
    reason: string,
    now: () => Date,
  ): {
    readonly modules: readonly ExperienceModuleExecution[];
    readonly transition: ModuleTransition;
    readonly activeModuleId: string | null;
    readonly completed: boolean;
  };
};

const DEFAULT_SEQUENCE = [
  'hero',
  'market-pulse',
  'house-navigator',
  'priority',
  'faq',
  'ai-advisor',
  'lead-capture',
] as const;

/**
 * BasicModuleExecutionStrategy — sequential Experience modules.
 */
export function createBasicModuleExecutionStrategy(): ModuleExecutionStrategy {
  return {
    id: 'basic-module-execution-strategy',

    supports(input) {
      return (
        input.sessionId.trim().length > 0 && input.moduleIds.length > 0
      );
    },

    nextModule(pkg) {
      const ordered = [...pkg.modules].sort(
        (a, b) => a.metadata.sequence - b.metadata.sequence,
      );
      const active = ordered.find((item) => item.status === 'Active');
      if (active === undefined) {
        const pending = ordered.find((item) => item.status === 'Pending');
        return {
          moduleId: pending?.moduleId ?? null,
          completed: pending === undefined,
        };
      }
      const next = ordered.find(
        (item) =>
          item.metadata.sequence > active.metadata.sequence &&
          item.status === 'Pending',
      );
      return {
        moduleId: next?.moduleId ?? null,
        completed: next === undefined,
      };
    },

    transition(pkg, toModuleId, reason, now) {
      const stamp = now().toISOString();
      const active = pkg.modules.find((item) => item.status === 'Active');
      const fromModule = active?.moduleId ?? null;

      if (toModuleId === null) {
        const modules = pkg.modules.map((item) =>
          item.status === 'Active'
            ? {
                ...item,
                status: 'Completed' as const,
                completedAt: stamp,
              }
            : item,
        );
        return {
          modules,
          activeModuleId: null,
          completed: true,
          transition: {
            fromModule,
            toModule: null,
            reason,
            timestamp: stamp,
            metadata: {
              notes: 'All modules completed.',
              action: 'complete',
            },
          },
        };
      }

      const modules = pkg.modules.map((item) => {
        if (item.status === 'Active') {
          return {
            ...item,
            status: 'Completed' as const,
            completedAt: stamp,
          };
        }
        if (item.moduleId === toModuleId) {
          return {
            ...item,
            status: 'Active' as const,
            startedAt: item.startedAt ?? stamp,
            completedAt: null,
          };
        }
        return item;
      });

      return {
        modules,
        activeModuleId: toModuleId,
        completed: false,
        transition: {
          fromModule,
          toModule: toModuleId,
          reason,
          timestamp: stamp,
          metadata: {
            notes: `Transition ${fromModule ?? '∅'} → ${toModuleId}`,
            action: 'transition',
          },
        },
      };
    },
  };
}

export const BASIC_MODULE_SEQUENCE: readonly string[] = [...DEFAULT_SEQUENCE];

/**
 * ModuleExecutionValidator (EPIC-BLD-33).
 */
export type ModuleExecutionValidator = {
  validate(pkg: ExperienceModulePackage): ModuleExecutionValidation;
  validateTransitions(
    pkg: ExperienceModulePackage,
  ): readonly ModuleExecutionValidationIssue[];
  validateState(
    pkg: ExperienceModulePackage,
  ): readonly ModuleExecutionValidationIssue[];
  validateSequence(
    pkg: ExperienceModulePackage,
  ): readonly ModuleExecutionValidationIssue[];
};

export function createModuleExecutionValidator(options?: {
  readonly now?: () => Date;
}): ModuleExecutionValidator {
  const now = options?.now ?? (() => new Date());

  const validateTransitions = (
    pkg: ExperienceModulePackage,
  ): ModuleExecutionValidationIssue[] => {
    const issues: ModuleExecutionValidationIssue[] = [];
    for (const item of pkg.transitions) {
      if (!item.reason.trim()) {
        issues.push({
          code: 'missing-transition-reason',
          severity: 'error',
          message: 'Module transition missing audit reason.',
        });
      }
      if (!item.timestamp.trim()) {
        issues.push({
          code: 'missing-transition-timestamp',
          severity: 'error',
          message: 'Module transition missing timestamp.',
        });
      }
    }
    return issues;
  };

  const validateState = (
    pkg: ExperienceModulePackage,
  ): ModuleExecutionValidationIssue[] => {
    const issues: ModuleExecutionValidationIssue[] = [];
    const active = pkg.modules.filter((item) => item.status === 'Active');
    if (active.length > 1) {
      issues.push({
        code: 'multiple-active-modules',
        severity: 'error',
        message: `Expected at most one Active module (found ${active.length}).`,
      });
    }
    if (
      pkg.metadata.activeModuleId !== null &&
      !pkg.modules.some(
        (item) =>
          item.moduleId === pkg.metadata.activeModuleId &&
          item.status === 'Active',
      )
    ) {
      issues.push({
        code: 'active-module-mismatch',
        severity: 'error',
        message: `Package activeModuleId ${pkg.metadata.activeModuleId} is not Active.`,
      });
    }
    for (const item of pkg.modules) {
      if (item.status === 'Active' && item.startedAt === null) {
        issues.push({
          code: 'active-without-startedAt',
          severity: 'error',
          message: `Module ${item.moduleId} Active without startedAt.`,
        });
      }
      if (item.status === 'Completed' && item.completedAt === null) {
        issues.push({
          code: 'completed-without-completedAt',
          severity: 'error',
          message: `Module ${item.moduleId} Completed without completedAt.`,
        });
      }
    }
    return issues;
  };

  const validateSequence = (
    pkg: ExperienceModulePackage,
  ): ModuleExecutionValidationIssue[] => {
    const issues: ModuleExecutionValidationIssue[] = [];
    if (pkg.modules.length === 0) {
      issues.push({
        code: 'empty-modules',
        severity: 'error',
        message: `Package ${pkg.id} has no modules.`,
      });
    }
    const sequences = pkg.modules.map((item) => item.metadata.sequence);
    const unique = new Set(sequences);
    if (unique.size !== sequences.length) {
      issues.push({
        code: 'duplicate-sequence',
        severity: 'error',
        message: 'Module sequence numbers are not unique.',
      });
    }
    if (!pkg.metadata.sessionId.trim()) {
      issues.push({
        code: 'missing-session',
        severity: 'error',
        message: `Package ${pkg.id} missing sessionId.`,
      });
    }
    return issues;
  };

  return {
    validateTransitions,
    validateState,
    validateSequence,
    validate(pkg) {
      const issues = [
        ...validateTransitions(pkg),
        ...validateState(pkg),
        ...validateSequence(pkg),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
