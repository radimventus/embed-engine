/**
 * EPIC-BX-12 — Builder Adapter: project Builder sources → Intelligence Core.
 * Builder does not own rules — only projection + UI.
 */

import { parseCsv } from '@embed-engine/object-house/builder-package';
import {
  analyzeViaBuilderAdapter,
  CRITICAL_EXPERIENCE_STEP_IDS,
  DEFAULT_DECISION_PERSONAS,
  INTELLIGENCE_CATEGORIES,
  type CoachResult,
  type Insight,
  type IntelligenceAnalysis,
  type IntelligenceProjectContext,
  type Recommendation,
  type RuleCategory,
} from '@embed-engine/intelligence';

import { BUILDER_RUNTIME_HOUSE_DEFAULTS } from '../../../../client-studio/src/features/client-studio/runtime/builderRuntimeHouseDefaults';
import { EXPERIENCE_MODULE_CATALOG } from '../experience-composer/experienceComposition';
import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import { buildKnowledgeDashboardModel } from '../knowledge-composer/knowledgeProjection';
import { getMediaPresentationMeta } from '../media-studio/mediaPresentationStorage';
import { buildDecisionQaReport } from '../preview-center/decisionQa';
import { PREVIEW_PERSONAS } from '../preview-center/previewPersonas';

export type BuilderCoachFinding = Insight & {
  readonly nav: HousePackageNavId;
};

export type BuilderCoachReport = Omit<CoachResult, 'findings'> & {
  readonly findings: readonly BuilderCoachFinding[];
};

export type BuilderIntelligenceRecommendation = Recommendation & {
  readonly nav: HousePackageNavId;
  readonly coachId: RuleCategory;
};

export type BuilderIntelligenceModel = {
  readonly coaches: readonly BuilderCoachReport[];
  readonly readiness: IntelligenceAnalysis['readiness'];
  readonly recommendations: readonly BuilderIntelligenceRecommendation[];
  readonly insights: IntelligenceAnalysis['insights'];
  readonly score: IntelligenceAnalysis['score'];
};

const NAV_ALLOWLIST: readonly HousePackageNavId[] = [
  'media-studio',
  'experience',
  'knowledge',
  'rooms',
  'plans',
  'preview-center',
  'gallery',
  'overview',
];

function toNav(target: string): HousePackageNavId {
  return NAV_ALLOWLIST.includes(target as HousePackageNavId)
    ? (target as HousePackageNavId)
    : 'overview';
}

/**
 * Project Builder House Package + Experience + Knowledge into Intelligence context.
 */
export function projectBuilderIntelligenceContext(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
}): IntelligenceProjectContext {
  const { projectId, snapshot, validationReport } = input;
  const pkg = snapshot?.validation.builderImport ?? null;
  const composition = loadExperienceComposition(
    projectId,
    snapshot?.working.heroRelativePath,
  );
  const knowledge = buildKnowledgeDashboardModel({ projectId, snapshot });
  const qa = buildDecisionQaReport({
    projectId,
    snapshot,
    validationReport,
  });
  const defaults = BUILDER_RUNTIME_HOUSE_DEFAULTS;
  const galleryRows = snapshot
    ? parseCsv(snapshot.working.galleryCsv).rows.map((row) => ({
        room: String(row.room ?? ''),
      }))
    : [];
  const videoRows = snapshot
    ? parseCsv(snapshot.working.videosCsv).rows.map((row) => ({
        room: String(row.room ?? ''),
        mediaId: String(row.mediaId ?? ''),
      }))
    : [];
  const heroPath = snapshot?.working.heroRelativePath.trim() ?? '';
  const heroMeta =
    heroPath.length > 0
      ? getMediaPresentationMeta(projectId, 'hero', 'Hero')
      : { alt: '' };
  const floors = pkg?.floors.floors ?? [];
  const svgCount = pkg?.svg.entries.length ?? floors.length;

  return {
    projectId,
    housePackage: {
      heroPath,
      galleryRows,
      videoRows,
      roomCount: pkg?.rooms.rooms.length ?? 0,
      floorPlanCount: svgCount,
      galleryCount: pkg?.gallery.entries.length ?? galleryRows.length,
      videoCount: pkg?.videos.entries.length ?? videoRows.length,
      validationOk: snapshot?.validation.ok === true,
    },
    experience: {
      modules: composition.modules.map((module) => {
        const def =
          EXPERIENCE_MODULE_CATALOG.find((item) => item.id === module.id) ??
          EXPERIENCE_MODULE_CATALOG[0];
        return {
          id: module.id,
          label: def.label,
          enabled: module.enabled,
        };
      }),
      faqItems: composition.configs.faq.items.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
      heroCta: composition.configs.hero.cta,
      priorityEnabled: composition.configs.priority.enabled,
    },
    knowledge: {
      categories: knowledge.categories.map((category) => ({
        id: category.id,
        label: category.label,
        health: category.health,
        itemCount: category.itemCount,
        summary: category.summary,
      })),
      completeCount: knowledge.completeCount,
      partialCount: knowledge.partialCount,
      missingCount: knowledge.missingCount,
    },
    media: {
      heroAlt: heroMeta.alt,
      documentTitles: (defaults.documents ?? []).map((doc) => doc.title),
      documentUrls: (defaults.documents ?? []).map((doc) => doc.url),
      energyClass: defaults.metadata.energyClass,
    },
    qa: {
      passCount: qa.passCount,
      warnCount: qa.warnCount,
      failCount: qa.failCount,
    },
    validationStatus:
      validationReport?.status === 'PASS' ||
      validationReport?.status === 'WARNING' ||
      validationReport?.status === 'ERROR'
        ? validationReport.status
        : 'UNKNOWN',
    personas: PREVIEW_PERSONAS.map((persona) => ({
      id: persona.id,
      label: persona.label,
      priorityIds: persona.priorityIds,
    })),
    criticalPathStepIds: CRITICAL_EXPERIENCE_STEP_IDS,
  };
}

/**
 * Builder → Intelligence Core → UI model.
 */
export function buildBuilderIntelligenceModel(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
}): BuilderIntelligenceModel {
  const context = projectBuilderIntelligenceContext(input);
  const withPersonas: IntelligenceProjectContext = {
    ...context,
    personas:
      context.personas.length > 0 ? context.personas : DEFAULT_DECISION_PERSONAS,
  };
  const analysis = analyzeViaBuilderAdapter(withPersonas);
  return {
    coaches: analysis.coaches.map((coach) => ({
      ...coach,
      findings: coach.findings.map((finding) => ({
        ...finding,
        nav: toNav(finding.target),
      })),
    })),
    readiness: analysis.readiness,
    insights: analysis.insights,
    score: analysis.score,
    recommendations: analysis.recommendations.map((item) => ({
      ...item,
      coachId: item.category,
      nav: toNav(item.target),
    })),
  };
}

export function getCoachLabel(id: RuleCategory): string {
  return INTELLIGENCE_CATEGORIES.find((item) => item.id === id)?.label ?? id;
}

export { INTELLIGENCE_CATEGORIES as INTELLIGENCE_COACHES };
