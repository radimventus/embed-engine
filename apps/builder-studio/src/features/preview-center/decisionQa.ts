/**
 * EPIC-BX-06 — Decision QA over real Experience + HP-002 validation (no parallel model).
 */

import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import type { ExperienceModuleId } from '../experience-composer/experienceComposition';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';

export type DecisionQaTone = 'pass' | 'warn' | 'fail';

export type DecisionQaItem = {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly tone: DecisionQaTone;
  readonly nav: HousePackageNavId;
};

export type DecisionQaReport = {
  readonly items: readonly DecisionQaItem[];
  readonly passCount: number;
  readonly warnCount: number;
  readonly failCount: number;
  readonly readyForPublish: boolean;
  readonly validationStatus: 'PASS' | 'WARNING' | 'ERROR' | 'UNKNOWN';
  readonly summaryLabel: string;
};

export function buildDecisionQaReport(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
}): DecisionQaReport {
  const { projectId, snapshot, validationReport } = input;
  const pkg = snapshot?.validation.builderImport ?? null;
  const composition = loadExperienceComposition(
    projectId,
    snapshot?.working.heroRelativePath,
  );
  const heroOk = (snapshot?.working.heroRelativePath.trim().length ?? 0) > 0;
  const galleryOk = (pkg?.gallery.entries.length ?? 0) > 0;
  const runtimeOk = snapshot?.validation.ok === true;
  const faqItems = composition.configs.faq.items.filter(
    (item) => item.question.trim().length > 0 && item.answer.trim().length > 0,
  );
  const faqOk = faqItems.length >= 2;
  const faqPartial = faqItems.length === 1;
  const priorityOk = composition.configs.priority.enabled;
  const leadOk =
    composition.configs['lead-capture'].cta.trim().length > 0 &&
    composition.configs['lead-capture'].formLabel.trim().length > 0;
  const moduleEnabled = (id: ExperienceModuleId) =>
    composition.modules.some((module) => module.id === id && module.enabled);

  const items: DecisionQaItem[] = [
    {
      id: 'hero',
      label: 'Hero',
      detail: heroOk ? 'Aktivní Hero' : 'Hero chybí',
      tone: heroOk ? 'pass' : 'fail',
      nav: 'media-studio',
    },
    {
      id: 'gallery',
      label: 'Gallery',
      detail: galleryOk
        ? `${pkg?.gallery.entries.length ?? 0} snímků`
        : 'Galerie je prázdná',
      tone: galleryOk ? 'pass' : 'warn',
      nav: 'media-studio',
    },
    {
      id: 'runtime',
      label: 'Runtime',
      detail: runtimeOk
        ? 'House Package validní pro Shared Runtime'
        : 'Obsah není připraven pro Runtime',
      tone: runtimeOk ? 'pass' : 'fail',
      nav: 'overview',
    },
    {
      id: 'priority',
      label: 'Priority',
      detail: priorityOk && moduleEnabled('priority')
        ? 'Priority modul aktivní'
        : 'Priority vypnuté nebo chybí',
      tone: priorityOk && moduleEnabled('priority') ? 'pass' : 'warn',
      nav: 'experience',
    },
    {
      id: 'faq',
      label: 'FAQ',
      detail: faqOk
        ? `${faqItems.length} položek`
        : faqPartial
          ? 'FAQ incomplete'
          : 'FAQ chybí',
      tone: faqOk ? 'pass' : faqPartial ? 'warn' : 'fail',
      nav: 'knowledge',
    },
    {
      id: 'lead',
      label: 'Lead',
      detail: leadOk && moduleEnabled('lead-capture')
        ? composition.configs['lead-capture'].cta
        : 'Lead Capture neúplný',
      tone: leadOk && moduleEnabled('lead-capture') ? 'pass' : 'warn',
      nav: 'experience',
    },
  ];

  const passCount = items.filter((item) => item.tone === 'pass').length;
  const warnCount = items.filter((item) => item.tone === 'warn').length;
  const failCount = items.filter((item) => item.tone === 'fail').length;
  const readyForPublish = validationReport?.canPublish === true && failCount === 0;
  const validationStatus =
    validationReport?.status ??
    (snapshot === null
      ? 'UNKNOWN'
      : snapshot.validation.ok
        ? 'PASS'
        : 'ERROR');

  return {
    items,
    passCount,
    warnCount,
    failCount,
    readyForPublish,
    validationStatus,
    summaryLabel: readyForPublish
      ? 'Ready for Publish'
      : failCount > 0
        ? 'Needs attention'
        : warnCount > 0
          ? 'Ready with warnings'
          : 'In review',
  };
}
