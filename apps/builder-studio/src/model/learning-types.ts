/**
 * Cross-Project Learning (EPIC-BLD-15).
 * Safe learning architecture — anonymized insights only.
 * Not Object Package. Not AI Context. No ML, sync, or company data sharing.
 */

export type LearningTimestamps = {
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type LearningMetadata = {
  readonly title: string;
  readonly description: string;
  readonly status: 'Draft' | 'Active' | 'Archived';
};

/**
 * Origin of a learning insight — not a Knowledge Layer.
 */
export type LearningOrigin =
  | 'platform'
  | 'company'
  | 'object'
  | 'session';

export type ObservationCategory =
  | 'priority-opened'
  | 'faq-visited'
  | 'module-skipped'
  | 'navigator-used'
  | 'form-opened'
  | 'other';

export type Observation = {
  readonly id: string;
  readonly origin: LearningOrigin;
  readonly category: ObservationCategory;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly confidence: number;
  readonly metadata: {
    readonly notes: string;
    readonly anonymized: true;
  };
};

export type PatternStatus = 'Candidate' | 'Active' | 'Retired';

export type Pattern = {
  readonly id: string;
  readonly description: string;
  readonly observations: readonly string[];
  readonly confidence: number;
  readonly status: PatternStatus;
};

export type HeuristicScope = 'platform' | 'experience' | 'decision';

export type Heuristic = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly scope: HeuristicScope;
  readonly weight: number;
};

/**
 * Platform learning capability — standalone, not on Object Package.
 */
export type LearningPackage = {
  readonly id: string;
  readonly version: string;
  readonly observations: readonly Observation[];
  readonly patterns: readonly Pattern[];
  readonly heuristics: readonly Heuristic[];
  readonly metadata: LearningMetadata;
  readonly timestamps: LearningTimestamps;
};

export type CreateLearningInput = {
  readonly title?: string;
  readonly description?: string;
};

export type UpdateLearningInput = {
  readonly title?: string;
  readonly description?: string;
  readonly status?: LearningMetadata['status'];
};

export type RegisterObservationInput = {
  readonly origin: LearningOrigin;
  readonly category: ObservationCategory;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly confidence?: number;
  readonly notes?: string;
};

export type RegisterPatternInput = {
  readonly description: string;
  readonly observations?: readonly string[];
  readonly confidence?: number;
  readonly status?: PatternStatus;
};

export type RegisterHeuristicInput = {
  readonly title: string;
  readonly description: string;
  readonly scope?: HeuristicScope;
  readonly weight?: number;
};

export type LearningEventType =
  | 'ObservationRegistered'
  | 'PatternRegistered'
  | 'HeuristicRegistered';

export type LearningEvent = {
  readonly eventId: string;
  readonly type: LearningEventType;
  readonly learningId: string;
  readonly at: string;
  readonly message: string;
};

export type LearningOriginDefinition = {
  readonly id: LearningOrigin;
  readonly label: string;
  readonly description: string;
};
