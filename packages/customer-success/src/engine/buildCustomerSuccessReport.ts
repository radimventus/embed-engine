/**
 * EPIC-BX-17 — Compose full Customer Success report.
 */

import type {
  CustomerSuccessReport,
  CustomerSuccessSnapshotInput,
} from '../domain/types';
import { buildOnboardingJourney } from './buildOnboardingJourney';
import { buildSuccessRecommendations } from './buildSuccessRecommendations';
import { buildSuccessTimeline } from './buildSuccessTimeline';
import { computeAdoptionScore } from './computeAdoptionScore';
import { evaluateCustomerHealth } from './evaluateCustomerHealth';

export function buildCustomerSuccessReport(
  snapshot: CustomerSuccessSnapshotInput,
): CustomerSuccessReport {
  const onboarding = buildOnboardingJourney(snapshot);
  const adoptionScore = computeAdoptionScore({ onboarding, snapshot });
  const health = evaluateCustomerHealth({
    adoptionScore,
    onboarding,
    snapshot,
  });
  const timeline = buildSuccessTimeline(snapshot);
  const recommendations = buildSuccessRecommendations({
    onboarding,
    snapshot,
  });

  return {
    companyId: snapshot.companyId,
    companyName: snapshot.companyName,
    workspaceId: snapshot.workspaceId,
    workspaceName: snapshot.workspaceName,
    onboarding,
    onboardingCompleteCount: onboarding.filter(
      (step) => step.state === 'Complete',
    ).length,
    onboardingTotal: onboarding.length,
    adoptionScore,
    health: health.status,
    healthDetail: health.detail,
    timeline,
    recommendations,
  };
}
