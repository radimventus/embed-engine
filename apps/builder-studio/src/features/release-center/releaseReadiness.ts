/**
 * EPIC-BX-07 — Release readiness over Validation + Decision QA + content areas.
 */

import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import { buildKnowledgeDashboardModel } from '../knowledge-composer/knowledgeProjection';
import {
  buildDecisionQaReport,
  type DecisionQaReport,
} from '../preview-center/decisionQa';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';

export type ReleaseReadinessTone = 'pass' | 'warn' | 'fail';

export type ReleaseReadinessItem = {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly tone: ReleaseReadinessTone;
  readonly nav: HousePackageNavId;
};

export type ReleaseReadinessReport = {
  readonly items: readonly ReleaseReadinessItem[];
  readonly readyToRelease: boolean;
  readonly qa: DecisionQaReport;
};

export function buildReleaseReadiness(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
}): ReleaseReadinessReport {
  const qa = buildDecisionQaReport(input);
  const pkg = input.snapshot?.validation.builderImport ?? null;
  const knowledge = buildKnowledgeDashboardModel({
    projectId: input.projectId,
    snapshot: input.snapshot,
  });
  const composition = loadExperienceComposition(
    input.projectId,
    input.snapshot?.working.heroRelativePath,
  );
  const enabledModules = composition.modules.filter((module) => module.enabled);
  const validationPass =
    input.validationReport?.status === 'PASS' ||
    (input.validationReport === null && input.snapshot?.validation.ok === true);
  const validationWarn = input.validationReport?.status === 'WARNING';
  const mediaOk =
    (input.snapshot?.working.heroRelativePath.trim().length ?? 0) > 0 &&
    (pkg?.gallery.entries.length ?? 0) > 0;
  const knowledgeOk = knowledge.missingCount === 0;
  const knowledgeWarn = knowledge.partialCount > 0;
  const experienceOk = enabledModules.length >= 4;
  const runtimeOk = input.snapshot?.validation.ok === true;

  const items: ReleaseReadinessItem[] = [
    {
      id: 'validation',
      label: 'Validation',
      detail: input.validationReport?.status ?? (runtimeOk ? 'PASS' : 'ERROR'),
      tone: validationPass ? 'pass' : validationWarn ? 'warn' : 'fail',
      nav: 'overview',
    },
    {
      id: 'decision-qa',
      label: 'Decision QA',
      detail: qa.summaryLabel,
      tone: qa.failCount > 0 ? 'fail' : qa.warnCount > 0 ? 'warn' : 'pass',
      nav: 'preview-center',
    },
    {
      id: 'runtime',
      label: 'Runtime',
      detail: runtimeOk ? 'Shared Runtime ready' : 'Runtime blocked',
      tone: runtimeOk ? 'pass' : 'fail',
      nav: 'preview-center',
    },
    {
      id: 'media',
      label: 'Media',
      detail: mediaOk
        ? `Hero + ${pkg?.gallery.entries.length ?? 0} gallery`
        : 'Media incomplete',
      tone: mediaOk ? 'pass' : 'fail',
      nav: 'media-studio',
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      detail:
        knowledge.missingCount === 0
          ? `${knowledge.completeCount} complete`
          : `${knowledge.missingCount} missing`,
      tone: knowledgeOk ? (knowledgeWarn ? 'warn' : 'pass') : 'fail',
      nav: 'knowledge',
    },
    {
      id: 'experience',
      label: 'Experience',
      detail: `${enabledModules.length} modulů`,
      tone: experienceOk ? 'pass' : 'warn',
      nav: 'experience',
    },
  ];

  const readyToRelease =
    items.every((item) => item.tone === 'pass') && qa.readyForPublish;

  return { items, readyToRelease, qa };
}
