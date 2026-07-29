/**
 * Experience Module Coordinator (EPIC-BLD-33).
 * Coordinates Experience module lifecycle during a Decision Session —
 * does not create Knowledge, Story, AI Context, Personalization or module logic.
 */

export type ExperienceModuleStatus =
  | 'Pending'
  | 'Active'
  | 'Completed'
  | 'Deactivated'
  | 'Disposed';

export type ExperienceModuleExecution = {
  readonly id: string;
  readonly sessionId: string;
  readonly moduleId: string;
  readonly status: ExperienceModuleStatus;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly metadata: {
    readonly label: string;
    readonly notes: string;
    readonly sequence: number;
  };
};

export type ModuleTransition = {
  readonly fromModule: string | null;
  readonly toModule: string | null;
  readonly reason: string;
  readonly timestamp: string;
  readonly metadata: {
    readonly notes: string;
    readonly action: 'activate' | 'deactivate' | 'transition' | 'complete';
  };
};

export type ExperienceModulePackage = {
  readonly id: string;
  readonly version: string;
  readonly modules: readonly ExperienceModuleExecution[];
  readonly transitions: readonly ModuleTransition[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly activeModuleId: string | null;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: ModuleExecutionValidation | null;
};

export type ModuleExecutionValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type ModuleExecutionValidation = {
  readonly valid: boolean;
  readonly issues: readonly ModuleExecutionValidationIssue[];
  readonly validatedAt: string;
};

export type InitializeModulesInput = {
  readonly sessionId: string;
  readonly moduleIds: readonly string[];
  readonly title?: string;
};

export type ModuleExecutionIndexEntry = {
  readonly packageId: string;
  readonly moduleExecutionId: string;
  readonly sessionId: string;
  readonly moduleId: string;
  readonly status: ExperienceModuleStatus;
};

export type ModuleCoordinatorEventType =
  | 'ModuleActivated'
  | 'ModuleTransitioned'
  | 'ModuleCompleted'
  | 'ModuleValidated';

export type ModuleCoordinatorEvent = {
  readonly eventId: string;
  readonly type: ModuleCoordinatorEventType;
  readonly packageId: string;
  readonly moduleId: string | null;
  readonly at: string;
  readonly message: string;
};
