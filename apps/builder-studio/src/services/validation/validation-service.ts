import type {
  ActiveProjectModel,
  BuildResult,
  PreviewSnapshot,
  PublishResult,
  ValidationCategory,
  ValidationContext,
  ValidationEvent,
  ValidationFinding,
  ValidationReport,
  ValidationRule,
} from '../../model';
import { DEFAULT_VALIDATION_RULES } from './default-rules';
import { buildValidationReport } from './quality-gate';

const MAX_HISTORY = 20;

export type ValidationService = {
  validateProject(projectId: string): ValidationReport;
  validateAssets(projectId: string): ValidationReport;
  validateKnowledge(projectId: string): ValidationReport;
  validateLayouts(projectId: string): ValidationReport;
  validateBuild(projectId: string): ValidationReport;
  validatePublish(projectId: string): ValidationReport;
  getLatestReport(projectId?: string): ValidationReport | null;
  getHistory(projectId?: string): readonly ValidationReport[];
  getEvents(projectId?: string): readonly ValidationEvent[];
  listRules(): readonly ValidationRule[];
};

function buildContext(input: {
  readonly project: ActiveProjectModel;
  readonly latestBuild: BuildResult | null;
  readonly latestPublish: PublishResult | null;
  readonly preview: PreviewSnapshot;
}): ValidationContext {
  const { project, latestBuild, latestPublish, preview } = input;
  const photographs =
    project.assets.media.find((item) => item.categoryId === 'photographs')
      ?.files.length ?? 0;
  const video =
    project.assets.media.find((item) => item.categoryId === 'video')?.files
      .length ?? 0;
  const hero =
    (project.assets.media.find((item) => item.categoryId === 'hero')?.files
      .length ?? 0) > 0;
  const layoutCount = project.assets.layout.reduce(
    (sum, item) => sum + item.files.length,
    0,
  );
  const knowledgeCount = project.assets.knowledge.reduce(
    (sum, item) => sum + item.files.length,
    0,
  );
  const hasSvg =
    (project.assets.layout.find((item) => item.categoryId === 'svg')?.files
      .length ?? 0) > 0;
  const assetErrorCategories = [
    ...project.assets.media,
    ...project.assets.layout,
    ...project.assets.knowledge,
  ]
    .filter((item) => item.state === 'Error')
    .map((item) => item.title);

  return {
    projectId: project.projectId,
    hasHero: hero,
    photographCount: photographs,
    videoCount: video,
    layoutCount,
    knowledgeCount,
    hasSvg,
    assetErrorCategories,
    latestBuildSuccess: latestBuild === null ? null : latestBuild.success,
    latestBuildPublishable:
      latestBuild === null ? null : latestBuild.package.publishable,
    latestPublishSuccess:
      latestPublish === null ? null : latestPublish.success,
    previewReady: preview.state === 'Ready',
    previewError: preview.state === 'Error',
  };
}

function runRules(
  rules: readonly ValidationRule[],
  context: ValidationContext,
): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  for (const rule of rules) {
    const passed = rule.validator(context);
    if (!passed) {
      findings.push({
        ruleId: rule.id,
        category: rule.category,
        severity: rule.severity,
        message: rule.message,
        recommendation: rule.recommendation,
      });
    }
  }
  return findings;
}

/**
 * ValidationService (EPIC-BLD-07).
 * Evaluates quality only — does not build, publish, or interpret Runtime.
 */
export function createValidationService(options: {
  readonly getProject: (projectId: string) => ActiveProjectModel | null;
  readonly getLatestBuild: (projectId: string) => BuildResult | null;
  readonly getLatestPublish: (projectId: string) => PublishResult | null;
  readonly getPreviewState: () => PreviewSnapshot;
  readonly rules?: readonly ValidationRule[];
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): ValidationService {
  const rules = options.rules ?? DEFAULT_VALIDATION_RULES;
  const now = options.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const history: ValidationReport[] = [];
  const events: ValidationEvent[] = [];

  const pushEvent = (
    type: ValidationEvent['type'],
    projectId: string,
    message: string,
    report: ValidationReport | null,
  ): void => {
    events.unshift({
      eventId: createId('validation-event'),
      type,
      projectId,
      at: now().toISOString(),
      message,
      report,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireProject = (projectId: string): ActiveProjectModel => {
    const project = options.getProject(projectId);
    if (project === null) {
      throw new Error(`Project not found for validation: ${projectId}`);
    }
    return project;
  };

  const validateCategory = (
    projectId: string,
    category: ValidationCategory | 'all',
  ): ValidationReport => {
    pushEvent('ValidationStarted', projectId, 'Validation started', null);

    try {
      const project = requireProject(projectId);
      const context = buildContext({
        project,
        latestBuild: options.getLatestBuild(projectId),
        latestPublish: options.getLatestPublish(projectId),
        preview: options.getPreviewState(),
      });

      const scopedRules =
        category === 'all'
          ? rules
          : rules.filter((rule) => rule.category === category);

      const findings = runRules(scopedRules, context);
      const report = buildValidationReport({
        projectId,
        findings,
        totalRules: scopedRules.length,
        timestamp: now().toISOString(),
      });

      history.unshift(report);
      if (history.length > MAX_HISTORY) {
        history.length = MAX_HISTORY;
      }

      if (report.qualityGate === 'Failed') {
        pushEvent(
          'ValidationFailed',
          projectId,
          `Quality Gate Failed (score ${report.score})`,
          report,
        );
      } else {
        pushEvent(
          'ValidationFinished',
          projectId,
          `Quality Gate ${report.qualityGate} (score ${report.score})`,
          report,
        );
      }

      return report;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Validation failed';
      pushEvent('ValidationFailed', projectId, message, null);
      throw error;
    }
  };

  return {
    validateProject(projectId) {
      return validateCategory(projectId, 'all');
    },
    validateAssets(projectId) {
      return validateCategory(projectId, 'Assets');
    },
    validateKnowledge(projectId) {
      return validateCategory(projectId, 'Knowledge');
    },
    validateLayouts(projectId) {
      return validateCategory(projectId, 'Layout');
    },
    validateBuild(projectId) {
      return validateCategory(projectId, 'Build');
    },
    validatePublish(projectId) {
      return validateCategory(projectId, 'Publish');
    },
    getLatestReport(projectId) {
      if (projectId === undefined) {
        return history[0] ?? null;
      }
      return history.find((item) => item.projectId === projectId) ?? null;
    },
    getHistory(projectId) {
      if (projectId === undefined) {
        return [...history];
      }
      return history.filter((item) => item.projectId === projectId);
    },
    getEvents(projectId) {
      if (projectId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.projectId === projectId);
    },
    listRules() {
      return [...rules];
    },
  };
}
