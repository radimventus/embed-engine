/**
 * EPIC-BX-09 — Conversion Coach: Experience structure rules only.
 */

import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import type { ExperienceModuleId } from '../experience-composer/experienceComposition';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { CoachFinding, CoachReport } from './intelligenceTypes';

export function buildConversionCoach(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
}): CoachReport {
  const findings: CoachFinding[] = [];
  const composition = loadExperienceComposition(
    input.projectId,
    input.snapshot?.working.heroRelativePath,
  );
  const enabled = composition.modules.filter((module) => module.enabled);
  const order = enabled.map((module) => module.id);
  const indexOf = (id: ExperienceModuleId) => order.indexOf(id);

  const leadIndex = indexOf('lead-capture');
  const priorityIndex = indexOf('priority');
  const galleryNavIndex = indexOf('house-navigator');
  const heroIndex = indexOf('hero');

  if (leadIndex >= 0 && order.length > 0 && leadIndex === order.length - 1 && order.length >= 5) {
    findings.push({
      id: 'conversion-lead-late',
      title: 'Lead je příliš pozdě',
      detail: 'Lead Capture je až na konci dlouhého toku — zvažte dřívější CTA.',
      severity: 'medium',
      nav: 'experience',
    });
  }

  if (!composition.modules.some((module) => module.id === 'lead-capture' && module.enabled)) {
    findings.push({
      id: 'conversion-lead-missing',
      title: 'Lead Capture chybí',
      detail: 'Bez Lead Capture Experience neuzavírá rozhodnutí.',
      severity: 'high',
      nav: 'experience',
    });
  }

  const faqCount = composition.configs.faq.items.filter(
    (item) => item.question.trim().length > 0,
  ).length;
  if (faqCount > 0 && faqCount <= 2) {
    findings.push({
      id: 'conversion-faq-few',
      title: 'FAQ obsahuje pouze dvě otázky',
      detail: 'Doporučeno alespoň 3 FAQ položky pro konverzi důvěry.',
      severity: 'medium',
      nav: 'knowledge',
    });
  } else if (faqCount === 0) {
    findings.push({
      id: 'conversion-faq-missing',
      title: 'FAQ je prázdné',
      detail: 'Doplňte FAQ před publikací.',
      severity: 'high',
      nav: 'knowledge',
    });
  }

  if (
    priorityIndex >= 0 &&
    galleryNavIndex >= 0 &&
    priorityIndex > galleryNavIndex
  ) {
    findings.push({
      id: 'conversion-priority-below-gallery',
      title: 'Priority jsou až pod Gallery',
      detail: 'Přesuňte Priority výše — dříve než House Navigator.',
      severity: 'high',
      nav: 'experience',
    });
  }

  const cta = composition.configs.hero.cta.trim();
  if (cta.length === 0) {
    findings.push({
      id: 'conversion-cta-missing',
      title: 'CTA chybí',
      detail: 'Hero CTA je prázdné.',
      severity: 'high',
      nav: 'experience',
    });
  } else if (heroIndex > 0) {
    findings.push({
      id: 'conversion-cta-late',
      title: 'CTA se zobrazí příliš pozdě',
      detail: 'Hero (s CTA) není na začátku Experience toku.',
      severity: 'medium',
      nav: 'experience',
    });
  }

  if (!composition.configs.priority.enabled || priorityIndex < 0) {
    findings.push({
      id: 'conversion-priority-off',
      title: 'Priority jsou vypnuté',
      detail: 'Bez Priority Runtime nedostane Decision Signal.',
      severity: 'high',
      nav: 'experience',
    });
  }

  const penalty = findings.reduce(
    (sum, item) =>
      sum + (item.severity === 'high' ? 20 : item.severity === 'medium' ? 12 : 6),
    0,
  );

  return {
    id: 'conversion',
    label: 'Conversion Coach',
    description: 'Struktura Experience a konverzní tok.',
    findings,
    score: Math.max(0, Math.min(100, 100 - penalty)),
  };
}
