/**
 * EPIC-BX-17 — Customer Health (deterministic rules).
 */

import type {
  CustomerHealthStatus,
  CustomerSuccessSnapshotInput,
  OnboardingStep,
} from '../domain/types';

export function evaluateCustomerHealth(input: {
  readonly adoptionScore: number;
  readonly onboarding: readonly OnboardingStep[];
  readonly snapshot: CustomerSuccessSnapshotInput;
}): { readonly status: CustomerHealthStatus; readonly detail: string } {
  const { adoptionScore, onboarding, snapshot } = input;
  const stuck = onboarding.some((step) => step.state === 'In Progress');
  const completeCount = onboarding.filter(
    (step) => step.state === 'Complete',
  ).length;

  if (
    !snapshot.sessionActive &&
    snapshot.lastLoginAt === null &&
    snapshot.projectCount === 0
  ) {
    return {
      status: 'At Risk',
      detail: 'Bez loginu a bez projektu',
    };
  }

  if (adoptionScore < 40 || (stuck && completeCount <= 2)) {
    return {
      status: 'At Risk',
      detail: `Adoption ${adoptionScore}% · onboarding stagnuje`,
    };
  }

  if (
    adoptionScore < 70 ||
    stuck ||
    snapshot.pendingInviteCount > 0 ||
    snapshot.publishedProjectCount === 0
  ) {
    return {
      status: 'Attention',
      detail: `Adoption ${adoptionScore}% · vyžaduje doprovod`,
    };
  }

  return {
    status: 'Healthy',
    detail: `Adoption ${adoptionScore}% · onboarding ${completeCount}/${onboarding.length}`,
  };
}
