import type {
  DashboardValidationReport,
  PublishPrepareInput,
  PublishSummary,
  PublishedArtifact,
} from '../../model';

export type PublishValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type PublishValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly PublishValidationIssue[];
};

/**
 * PublishValidator — gate only.
 * Checks Validation Dashboard READY + Export Certification presence.
 * Does not invent domain rules.
 */
export type PublishValidator = {
  validate(
    report: DashboardValidationReport | null,
    certificationId: string | null,
  ): PublishValidationResult;
};

export function createPublishValidator(): PublishValidator {
  return {
    validate(report, certificationId) {
      const issues: PublishValidationIssue[] = [];

      if (report === null) {
        issues.push({
          code: 'validation-report',
          severity: 'error',
          message: 'Validation Dashboard report is required.',
        });
      } else if (report.overallStatus !== 'READY') {
        issues.push({
          code: 'validation-status',
          severity: 'error',
          message: `Validation Dashboard status must be READY (got ${report.overallStatus}).`,
        });
      }

      if (certificationId === null || !certificationId.trim()) {
        issues.push({
          code: 'export-certification',
          severity: 'error',
          message: 'Export Certification is required.',
        });
      }

      return {
        valid: issues.every((issue) => issue.severity !== 'error'),
        issues,
      };
    },
  };
}

export type PublishStrategyContext = {
  readonly projectId: string;
  readonly sessionId: string;
  readonly summary: PublishSummary;
  readonly createId: (prefix: string) => string;
  readonly now: () => string;
};

export type PublishStrategy = {
  readonly id: string;
  supports(input: PublishPrepareInput): boolean;
  prepare(
    input: PublishPrepareInput,
    report: DashboardValidationReport,
  ): PublishSummary;
  publish(context: PublishStrategyContext): PublishedArtifact;
};

function nextVersion(projectId: string, stamp: string): string {
  const day = stamp.slice(0, 10).replace(/-/g, '');
  return `1.0.${day}-${projectId}`;
}

export function createBasicPublishStrategy(): PublishStrategy {
  return {
    id: 'basic-publish-strategy',

    supports(input) {
      return (
        input.validationReportId.trim().length > 0 &&
        input.certificationId.trim().length > 0 &&
        input.manifestId.trim().length > 0
      );
    },

    prepare(input, report) {
      return {
        projectId: report.projectId,
        projectTitle: input.projectTitle?.trim() || report.projectId,
        assetCount: input.assetCount ?? 0,
        metadataSlug: input.metadataSlug?.trim() || report.projectId,
        manifestId: input.manifestId.trim(),
        certificationId: input.certificationId.trim(),
        version: input.version?.trim() || nextVersion(report.projectId, report.generatedAt),
        validationReportId: report.id,
        readinessScore: report.readinessScore,
        overallStatus: report.overallStatus,
        warningCount: report.summary.warningCount,
        blockedCount: report.summary.blockedCount,
      };
    },

    publish(context) {
      const stamp = context.now();
      const publicationId = context.createId('publication');
      const embedId = `embed-${context.projectId}`;
      return {
        id: publicationId,
        projectId: context.projectId,
        version: context.summary.version,
        embedId,
        manifestId: context.summary.manifestId,
        certificationId: context.summary.certificationId,
        publishedAt: stamp,
        metadata: {
          title: context.summary.projectTitle,
          notes: 'Published via Publish Wizard.',
          embedCode: `<script src="https://embed.conis.ai/${embedId}.js" data-project="${context.projectId}" data-version="${context.summary.version}"></script>`,
          previewUrl: `https://preview.conis.ai/${context.projectId}?v=${encodeURIComponent(context.summary.version)}`,
          sessionId: context.sessionId,
        },
      };
    },
  };
}
