/**
 * Learning Package Manager (EPIC-BLD-23).
 * Manages versioned Learning Records packages — no patterns, heuristics, or AI.
 *
 * Note: Named LearningRecordsPackage to avoid clash with BLD-15 LearningPackage
 * (observations/patterns/heuristics). Product surface is still "Learning Package".
 */

export type LearningRecordsPackageMetadata = {
  readonly title: string;
  readonly description: string;
  readonly status: 'Draft' | 'Published' | 'Disposed';
};

export type LearningRecordReference = {
  readonly id: string;
  readonly recordId: string;
  readonly source: string;
  readonly timestamp: string;
  readonly metadata: {
    readonly note: string;
  };
};

export type LearningPackageVersion = {
  readonly version: string;
  readonly createdAt: string;
  readonly author: string;
  readonly changes: readonly string[];
  readonly metadata: {
    readonly notes: string;
  };
};

export type LearningRecordsPackage = {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly records: readonly LearningRecordReference[];
  readonly versions: readonly LearningPackageVersion[];
  readonly metadata: LearningRecordsPackageMetadata;
  readonly validation: LearningPackageValidation | null;
};

export type LearningPackageValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type LearningPackageValidation = {
  readonly valid: boolean;
  readonly issues: readonly LearningPackageValidationIssue[];
  readonly validatedAt: string;
};

export type CreateLearningRecordsPackageInput = {
  readonly name?: string;
  readonly title?: string;
  readonly description?: string;
  readonly author?: string;
};

export type AddLearningRecordRefInput = {
  readonly packageId: string;
  readonly recordId: string;
  readonly source?: string;
  readonly note?: string;
};

export type LearningPackageIndexEntry = {
  readonly packageId: string;
  readonly recordId: string;
  readonly referenceId: string;
  readonly source: string;
  readonly timestamp: string;
};

export type LearningPackageManagerEventType =
  | 'LearningPackageCreated'
  | 'LearningRecordAdded'
  | 'LearningRecordRemoved'
  | 'LearningPackagePublished'
  | 'LearningPackageValidated';

export type LearningPackageManagerEvent = {
  readonly eventId: string;
  readonly type: LearningPackageManagerEventType;
  readonly packageId: string;
  readonly recordId: string | null;
  readonly at: string;
  readonly message: string;
};
