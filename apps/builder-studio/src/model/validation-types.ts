/**
 * Validation & Quality Gate (EPIC-BLD-07).
 * Independent quality capability — not Build, not Publish, not Runtime.
 */

export type ValidationCategory =
  | 'Assets'
  | 'Layout'
  | 'Knowledge'
  | 'Build'
  | 'Publish'
  | 'Runtime Preview';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type QualityGate = 'Passed' | 'PassedWithWarnings' | 'Failed';

export type ValidationContext = {
  readonly projectId: string;
  readonly hasHero: boolean;
  readonly photographCount: number;
  readonly videoCount: number;
  readonly layoutCount: number;
  readonly knowledgeCount: number;
  readonly hasSvg: boolean;
  readonly assetErrorCategories: readonly string[];
  readonly latestBuildSuccess: boolean | null;
  readonly latestBuildPublishable: boolean | null;
  readonly latestPublishSuccess: boolean | null;
  readonly previewReady: boolean;
  readonly previewError: boolean;
};

export type ValidationFinding = {
  readonly ruleId: string;
  readonly category: ValidationCategory;
  readonly severity: ValidationSeverity;
  readonly message: string;
  readonly recommendation: string;
};

export type ValidationRule = {
  readonly id: string;
  readonly category: ValidationCategory;
  readonly severity: ValidationSeverity;
  readonly message: string;
  readonly recommendation: string;
  readonly validator: (context: ValidationContext) => boolean;
};

export type ValidationReport = {
  readonly projectId: string;
  readonly score: number;
  readonly passed: boolean;
  readonly qualityGate: QualityGate;
  readonly warnings: readonly ValidationFinding[];
  readonly errors: readonly ValidationFinding[];
  readonly recommendations: readonly string[];
  readonly timestamp: string;
  readonly findings: readonly ValidationFinding[];
};

export type ValidationEventType =
  | 'ValidationStarted'
  | 'ValidationFinished'
  | 'ValidationFailed';

export type ValidationEvent = {
  readonly eventId: string;
  readonly type: ValidationEventType;
  readonly projectId: string;
  readonly at: string;
  readonly message: string;
  readonly report: ValidationReport | null;
};
