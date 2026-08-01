/**
 * EPIC-BX-17 — Adoption Score (deterministic aggregation).
 */

import type { CustomerSuccessSnapshotInput, OnboardingStep } from '../domain/types';

export function computeAdoptionScore(input: {
  readonly onboarding: readonly OnboardingStep[];
  readonly snapshot: CustomerSuccessSnapshotInput;
}): number {
  const { onboarding, snapshot } = input;
  const complete = onboarding.filter((step) => step.state === 'Complete').length;
  const onboardingScore = (complete / onboarding.length) * 40;

  const activityHits = Math.min(snapshot.activityLabels.length, 8);
  const activityScore = (activityHits / 8) * 20;

  const publishScore =
    snapshot.publishedProjectCount > 0 || snapshot.lastPublishAt !== null
      ? 20
      : snapshot.readyProjectCount > 0
        ? 10
        : 0;

  const capabilityScore = Math.min(snapshot.capabilityActiveCount, 5) * 4;

  return Math.round(
    onboardingScore + activityScore + publishScore + capabilityScore,
  );
}
