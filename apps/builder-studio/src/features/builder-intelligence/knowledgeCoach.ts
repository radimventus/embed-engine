/**
 * EPIC-BX-09 — Knowledge Coach: deterministic Knowledge completeness rules.
 */

import { BUILDER_RUNTIME_HOUSE_DEFAULTS } from '../../../../client-studio/src/features/client-studio/runtime/builderRuntimeHouseDefaults';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import { buildKnowledgeDashboardModel } from '../knowledge-composer/knowledgeProjection';
import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import type { CoachFinding, CoachReport } from './intelligenceTypes';

export function buildKnowledgeCoach(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
}): CoachReport {
  const findings: CoachFinding[] = [];
  const knowledge = buildKnowledgeDashboardModel(input);
  const defaults = BUILDER_RUNTIME_HOUSE_DEFAULTS;
  const composition = loadExperienceComposition(
    input.projectId,
    input.snapshot?.working.heroRelativePath,
  );

  const energy = knowledge.categories.find((item) => item.id === 'energy');
  if (
    energy?.health === 'missing' ||
    defaults.metadata.energyClass.trim().length === 0
  ) {
    findings.push({
      id: 'knowledge-energy-missing',
      title: 'Chybí energetické údaje',
      detail: 'Doplňte energetickou třídu v Knowledge / Runtime defaults.',
      severity: 'high',
      nav: 'knowledge',
    });
  }

  const docs = defaults.documents ?? [];
  const heatingMention =
    docs.some((doc) =>
      /vytáp|heating|teplo|tepeln/i.test(`${doc.title} ${doc.url}`),
    ) ||
    composition.configs.faq.items.some((item) =>
      /vytáp|heating|teplo/i.test(`${item.question} ${item.answer}`),
    );
  if (!heatingMention) {
    findings.push({
      id: 'knowledge-heating-missing',
      title: 'Nejsou informace o vytápění',
      detail: 'Přidejte dokument nebo FAQ o vytápění.',
      severity: 'medium',
      nav: 'knowledge',
    });
  }

  const financingFaq = composition.configs.faq.items.some((item) =>
    /financ|hypoték|úvěr|splat/i.test(`${item.question} ${item.answer}`),
  );
  const financing = knowledge.categories.find((item) => item.id === 'financing');
  if (!financingFaq && (financing?.itemCount ?? 0) <= 1) {
    findings.push({
      id: 'knowledge-financing-missing',
      title: 'Chybí financování',
      detail: 'Kromě ceny doplňte FAQ nebo Knowledge o financování.',
      severity: 'medium',
      nav: 'knowledge',
    });
  }

  for (const category of knowledge.categories) {
    if (category.health === 'missing' && category.id !== 'energy') {
      findings.push({
        id: `knowledge-missing-${category.id}`,
        title: `Knowledge: ${category.label} chybí`,
        detail: category.summary,
        severity: 'medium',
        nav: 'knowledge',
      });
    }
  }

  if (knowledge.partialCount > 3) {
    findings.push({
      id: 'knowledge-partial-many',
      title: 'Více Knowledge oblastí je neúplných',
      detail: `${knowledge.partialCount} kategorií ve stavu partial.`,
      severity: 'low',
      nav: 'knowledge',
    });
  }

  const penalty = findings.reduce(
    (sum, item) =>
      sum + (item.severity === 'high' ? 18 : item.severity === 'medium' ? 10 : 5),
    0,
  );

  return {
    id: 'knowledge',
    label: 'Knowledge Coach',
    description: 'Úplnost Knowledge (pravidla, ne AI).',
    findings,
    score: Math.max(0, Math.min(100, 100 - penalty)),
  };
}
