/**
 * Canonical Index připravenosti — CONIS know-how.
 * Expresses captured decision effort, not purchase probability.
 */

export type LeadProcessingStatus = 'new' | 'accepted';

export type ReadinessCatalog = {
  readonly roomIds: readonly string[];
  readonly imageIds: readonly string[];
};

export type ReadinessBreakdown = {
  readonly mandatory: number;
  readonly video: number;
  readonly images: number;
  readonly rooms: number;
  readonly tourReturns: number;
  readonly priorities: number;
  readonly faq: number;
  readonly chat: number;
};

export type IndexPripravenosti = {
  readonly available: boolean;
  readonly rawScore: number;
  readonly score: number;
  readonly displayScore: number;
  readonly breakdown: ReadinessBreakdown;
};

export type ReadinessEvent = {
  readonly type: string;
  readonly at: number;
  readonly roomId?: string;
  readonly mediaId?: string;
  readonly milestone?: 'half' | 'end';
  readonly stageId?: 'tour' | 'priority' | 'racio' | 'audit';
  readonly questionId?: string;
  readonly answerId?: string;
  readonly prompt?: string;
  readonly priorityIds?: readonly string[];
  readonly intensities?: readonly {
    readonly priorityId: string;
    readonly importance: number;
  }[];
};

export type ScoreIndexPripravenostiInput = {
  readonly events: readonly ReadinessEvent[];
  readonly catalog: ReadinessCatalog;
  /** Contact/Lead conversion was durably submitted. */
  readonly qualifiedLead: boolean;
};
