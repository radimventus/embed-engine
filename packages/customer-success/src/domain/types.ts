/**
 * EPIC-BX-17 — Customer Success domain types.
 * Single customer model = Company / Workspace / Project (platform-access).
 */

export type OnboardingStepId =
  | 'login'
  | 'company'
  | 'project'
  | 'house-package'
  | 'experience-published'
  | 'preview-verified'
  | 'first-lead';

export type OnboardingStepState = 'Pending' | 'In Progress' | 'Complete';

export type OnboardingStep = {
  readonly id: OnboardingStepId;
  readonly label: string;
  readonly state: OnboardingStepState;
  readonly detail: string;
};

export type CustomerHealthStatus = 'Healthy' | 'Attention' | 'At Risk';

export type SuccessTimelineEventId =
  | 'first-login'
  | 'first-publish'
  | 'first-preview'
  | 'first-release'
  | 'first-lead';

export type SuccessTimelineEvent = {
  readonly id: SuccessTimelineEventId;
  readonly label: string;
  readonly at: string | null;
  readonly detail: string;
  readonly occurred: boolean;
};

export type SuccessRecommendationId =
  | 'complete-faq'
  | 'publish-experience'
  | 'add-second-project'
  | 'verify-preview'
  | 'invite-user'
  | 'capture-lead';

export type SuccessRecommendation = {
  readonly id: SuccessRecommendationId;
  readonly title: string;
  readonly detail: string;
  readonly targetLabel: string;
  /** Absolute or path href into platform Studio. */
  readonly href: string;
};

export type CustomerSuccessSnapshotInput = {
  readonly companyId: string;
  readonly companyName: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly projectCount: number;
  readonly publishedProjectCount: number;
  readonly readyProjectCount: number;
  readonly hasHousePackage: boolean;
  readonly sessionActive: boolean;
  readonly lastLoginAt: string | null;
  readonly lastPublishAt: string | null;
  readonly lastPublishLabel: string | null;
  readonly pendingInviteCount: number;
  readonly activityLabels: readonly string[];
  readonly capabilityActiveCount: number;
  readonly builderHref: string;
  readonly managerHref: string;
  readonly salesHref: string;
};

export type CustomerSuccessReport = {
  readonly companyId: string;
  readonly companyName: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly onboarding: readonly OnboardingStep[];
  readonly onboardingCompleteCount: number;
  readonly onboardingTotal: number;
  readonly adoptionScore: number;
  readonly health: CustomerHealthStatus;
  readonly healthDetail: string;
  readonly timeline: readonly SuccessTimelineEvent[];
  readonly recommendations: readonly SuccessRecommendation[];
};
