/**
 * EPIC-BX-17 — Success Recommendations with concrete platform targets.
 */

import type {
  CustomerSuccessSnapshotInput,
  OnboardingStep,
  SuccessRecommendation,
} from '../domain/types';

export function buildSuccessRecommendations(input: {
  readonly onboarding: readonly OnboardingStep[];
  readonly snapshot: CustomerSuccessSnapshotInput;
}): readonly SuccessRecommendation[] {
  const { onboarding, snapshot } = input;
  const byId = new Map(onboarding.map((step) => [step.id, step]));
  const items: SuccessRecommendation[] = [];

  if (byId.get('house-package')?.state !== 'Complete') {
    items.push({
      id: 'complete-faq',
      title: 'Dokončete FAQ',
      detail: 'Doplňte Knowledge / FAQ v Builderu před publikací.',
      targetLabel: 'Builder · Knowledge',
      href: `${snapshot.builderHref}#knowledge`,
    });
  }

  if (byId.get('experience-published')?.state !== 'Complete') {
    items.push({
      id: 'publish-experience',
      title: 'Publikujte první Experience',
      detail: 'Spusťte publish z Builder Release Center.',
      targetLabel: 'Builder · Release',
      href: `${snapshot.builderHref}#release-center`,
    });
  }

  if (byId.get('preview-verified')?.state !== 'Complete') {
    items.push({
      id: 'verify-preview',
      title: 'Ověřte Preview',
      detail: 'Otevřete Preview Center a ověřte Decision Path.',
      targetLabel: 'Builder · Preview',
      href: `${snapshot.builderHref}#preview-center`,
    });
  }

  if (snapshot.projectCount < 2) {
    items.push({
      id: 'add-second-project',
      title: 'Přidejte druhý projekt',
      detail: 'Rozšiřte Workspace o další House Package projekt.',
      targetLabel: 'Builder · Workspace',
      href: snapshot.builderHref,
    });
  }

  if (snapshot.pendingInviteCount > 0) {
    items.push({
      id: 'invite-user',
      title: 'Dokončete onboarding uživatele',
      detail: 'Máte otevřené pozvánky — aktivujte účet kolegy.',
      targetLabel: 'Platform Landing',
      href: snapshot.managerHref,
    });
  }

  if (byId.get('first-lead')?.state !== 'Complete') {
    items.push({
      id: 'capture-lead',
      title: 'Zachyťte první lead',
      detail: 'Použijte Sales Studio pipeline pro první lead signal.',
      targetLabel: 'Sales · Pipeline',
      href: snapshot.salesHref,
    });
  }

  return items.slice(0, 5);
}
