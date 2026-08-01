/**
 * EPIC-BX-17 — Onboarding Journey over existing company/project signals.
 */

import type {
  CustomerSuccessSnapshotInput,
  OnboardingStep,
  OnboardingStepId,
  OnboardingStepState,
} from '../domain/types';

const STEP_DEFS: readonly {
  readonly id: OnboardingStepId;
  readonly label: string;
}[] = [
  { id: 'login', label: 'Přihlášení' },
  { id: 'company', label: 'Firma vytvořena' },
  { id: 'project', label: 'Projekt vytvořen' },
  { id: 'house-package', label: 'House Package nahrán' },
  { id: 'experience-published', label: 'Experience publikována' },
  { id: 'preview-verified', label: 'Preview ověřeno' },
  { id: 'first-lead', label: 'První Lead' },
];

function hasActivity(
  labels: readonly string[],
  needle: string,
): boolean {
  const lower = needle.toLowerCase();
  return labels.some((label) => label.toLowerCase().includes(lower));
}

function isComplete(
  id: OnboardingStepId,
  input: CustomerSuccessSnapshotInput,
): boolean {
  switch (id) {
    case 'login':
      return input.sessionActive || input.lastLoginAt !== null;
    case 'company':
      return input.companyId.length > 0;
    case 'project':
      return input.projectCount > 0;
    case 'house-package':
      return input.hasHousePackage;
    case 'experience-published':
      return (
        input.publishedProjectCount > 0 || input.lastPublishAt !== null
      );
    case 'preview-verified':
      return (
        hasActivity(input.activityLabels, 'preview') ||
        input.readyProjectCount > 0
      );
    case 'first-lead':
      return (
        hasActivity(input.activityLabels, 'lead') ||
        hasActivity(input.activityLabels, 'pipeline')
      );
  }
}

function detailFor(
  id: OnboardingStepId,
  input: CustomerSuccessSnapshotInput,
  complete: boolean,
): string {
  if (!complete) {
    switch (id) {
      case 'login':
        return 'Čeká na první přihlášení';
      case 'company':
        return 'Firma zatím není v registry';
      case 'project':
        return 'Založte první projekt';
      case 'house-package':
        return 'Nahrajte House Package do projektu';
      case 'experience-published':
        return 'Publikujte Experience z Builderu';
      case 'preview-verified':
        return 'Ověřte Preview v Builderu';
      case 'first-lead':
        return 'Zachyťte první lead v Sales';
    }
  }
  switch (id) {
    case 'login':
      return input.lastLoginAt ?? 'Session aktivní';
    case 'company':
      return input.companyName;
    case 'project':
      return `${input.projectCount} project(s)`;
    case 'house-package':
      return 'House Package připojen';
    case 'experience-published':
      return input.lastPublishLabel ?? 'Published project';
    case 'preview-verified':
      return 'Preview / ready project signal';
    case 'first-lead':
      return 'Lead signal zaznamenán';
  }
}

export function buildOnboardingJourney(
  input: CustomerSuccessSnapshotInput,
): readonly OnboardingStep[] {
  const completeness = STEP_DEFS.map((step) =>
    isComplete(step.id, input),
  );
  let firstIncomplete = completeness.findIndex((ok) => !ok);
  if (firstIncomplete < 0) firstIncomplete = STEP_DEFS.length;

  return STEP_DEFS.map((step, index) => {
    const complete = completeness[index] === true;
    let state: OnboardingStepState = 'Pending';
    if (complete) state = 'Complete';
    else if (index === firstIncomplete) state = 'In Progress';
    return {
      id: step.id,
      label: step.label,
      state,
      detail: detailFor(step.id, input, complete),
    };
  });
}
