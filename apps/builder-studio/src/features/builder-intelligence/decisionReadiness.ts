/**
 * EPIC-BX-09 — Decision Readiness score from Validation · QA · Knowledge · Experience · Media · Runtime.
 */

import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import { buildKnowledgeDashboardModel } from '../knowledge-composer/knowledgeProjection';
import { buildDecisionQaReport } from '../preview-center/decisionQa';
import type {
  DecisionReadinessGrade,
  DecisionReadinessReport,
} from './intelligenceTypes';

export function buildDecisionReadiness(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
}): DecisionReadinessReport {
  const qa = buildDecisionQaReport(input);
  const knowledge = buildKnowledgeDashboardModel({
    projectId: input.projectId,
    snapshot: input.snapshot,
  });
  const composition = loadExperienceComposition(
    input.projectId,
    input.snapshot?.working.heroRelativePath,
  );
  const pkg = input.snapshot?.validation.builderImport ?? null;

  const validationScore =
    input.validationReport?.status === 'PASS'
      ? 100
      : input.validationReport?.status === 'WARNING'
        ? 75
        : input.snapshot?.validation.ok === true
          ? 85
          : 40;

  const qaTotal = qa.passCount + qa.warnCount + qa.failCount;
  const qaScore =
    qaTotal === 0
      ? 50
      : Math.round(
          ((qa.passCount * 100 + qa.warnCount * 55 + qa.failCount * 10) /
            qaTotal),
        );

  const knowledgeTotal =
    knowledge.completeCount + knowledge.partialCount + knowledge.missingCount;
  const knowledgeScore =
    knowledgeTotal === 0
      ? 50
      : Math.round(
          ((knowledge.completeCount * 100 +
            knowledge.partialCount * 60 +
            knowledge.missingCount * 15) /
            knowledgeTotal),
        );

  const enabled = composition.modules.filter((module) => module.enabled).length;
  const experienceScore = Math.min(
    100,
    Math.round((enabled / 6) * 100) -
      (composition.configs.faq.items.length < 2 ? 15 : 0),
  );

  const mediaScore = (() => {
    let score = 0;
    if ((input.snapshot?.working.heroRelativePath.trim().length ?? 0) > 0) {
      score += 35;
    }
    const photos = pkg?.gallery.entries.length ?? 0;
    score += Math.min(40, photos * 8);
    const videos = pkg?.videos.entries.length ?? 0;
    score += videos > 0 ? 25 : 0;
    return Math.min(100, score);
  })();

  const runtimeScore = input.snapshot?.validation.ok === true ? 100 : 35;

  const pillars = [
    { id: 'validation', label: 'Validation', score: validationScore },
    { id: 'qa', label: 'QA', score: qaScore },
    { id: 'knowledge', label: 'Knowledge', score: knowledgeScore },
    { id: 'experience', label: 'Experience', score: Math.max(0, experienceScore) },
    { id: 'media', label: 'Media', score: mediaScore },
    { id: 'runtime', label: 'Runtime', score: runtimeScore },
  ] as const;

  const score = Math.round(
    pillars.reduce((sum, pillar) => sum + pillar.score, 0) / pillars.length,
  );

  return {
    score,
    grade: gradeForScore(score),
    pillars,
  };
}

export function gradeForScore(score: number): DecisionReadinessGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}
