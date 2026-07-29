import type {
  AssetValidation,
  DashboardValidationCheck,
  DashboardValidationReport,
  DashboardOverallStatus,
  ExportCertificationValidation,
  MetadataValidation,
  PublicationReadinessReport,
  ValidationCheckSource,
  WorkspaceValidation,
} from '../../model';

/**
 * Snapshot of existing validator outputs.
 * Aggregator maps these into a unified report — no own rules.
 */
export type ValidationSourceSnapshot = {
  readonly workspace?: WorkspaceValidation | null;
  readonly assets?: AssetValidation | null;
  readonly metadata?: MetadataValidation | null;
  readonly publication?: PublicationReadinessReport | null;
  readonly exportCertification?: ExportCertificationValidation | null;
  readonly customChecks?: readonly DashboardValidationCheck[];
};

export type ValidationAggregator = {
  aggregate(
    projectId: string,
    sources: ValidationSourceSnapshot,
    options: {
      readonly createId: (prefix: string) => string;
      readonly now: () => string;
      readonly title?: string;
    },
  ): DashboardValidationReport;
};

function issueStatus(
  severity: 'error' | 'warning',
): DashboardOverallStatus {
  return severity === 'error' ? 'BLOCKED' : 'WARNING';
}

function mapIssueChecks(
  source: ValidationCheckSource,
  issues: readonly {
    readonly code: string;
    readonly severity: 'error' | 'warning';
    readonly message: string;
  }[],
  createId: (prefix: string) => string,
  action: string,
): DashboardValidationCheck[] {
  return issues.map((issue) => ({
    id: createId('check'),
    source,
    severity: issue.severity === 'error' ? 'ERROR' : 'WARNING',
    title: issue.code,
    description: issue.message,
    status: issueStatus(issue.severity),
    recommendation: action,
    metadata: {
      code: issue.code,
      notes: `${source} validator issue.`,
    },
  }));
}

function sourcePassCheck(
  source: ValidationCheckSource,
  createId: (prefix: string) => string,
  title: string,
): DashboardValidationCheck {
  return {
    id: createId('check'),
    source,
    severity: 'INFO',
    title,
    description: `${source} validation passed.`,
    status: 'READY',
    recommendation: 'No action required.',
    metadata: {
      code: `${source.toLowerCase()}-pass`,
      notes: 'Mapped from existing validator valid=true.',
    },
  };
}

function mapPublicationChecks(
  report: PublicationReadinessReport,
  createId: (prefix: string) => string,
): DashboardValidationCheck[] {
  return report.checks.map((check) => {
    const status: DashboardOverallStatus =
      check.result === 'fail'
        ? 'BLOCKED'
        : check.result === 'warning'
          ? 'WARNING'
          : 'READY';
    return {
      id: createId('check'),
      source: 'PUBLICATION' as const,
      severity:
        check.severity === 'error'
          ? 'ERROR'
          : check.severity === 'warning'
            ? 'WARNING'
            : 'INFO',
      title: check.name,
      description: check.message,
      status,
      recommendation:
        status === 'READY'
          ? 'No action required.'
          : 'Review Publication Readiness checks.',
      metadata: {
        code: check.id,
        notes: 'Mapped from PublicationReadinessValidator.',
      },
    };
  });
}

function computeScore(checks: readonly DashboardValidationCheck[]): number {
  if (checks.length === 0) return 100;
  const weight = (status: DashboardOverallStatus): number => {
    if (status === 'READY') return 1;
    if (status === 'WARNING') return 0.5;
    return 0;
  };
  const sum = checks.reduce((acc, check) => acc + weight(check.status), 0);
  return Math.round((sum / checks.length) * 100);
}

function overallStatus(
  checks: readonly DashboardValidationCheck[],
): DashboardOverallStatus {
  if (checks.some((check) => check.status === 'BLOCKED')) return 'BLOCKED';
  if (checks.some((check) => check.status === 'WARNING')) return 'WARNING';
  return 'READY';
}

export function createValidationAggregator(): ValidationAggregator {
  return {
    aggregate(projectId, sources, options) {
      const checks: DashboardValidationCheck[] = [];
      const usedSources: ValidationCheckSource[] = [];

      if (sources.workspace != null) {
        usedSources.push('WORKSPACE');
        if (sources.workspace.issues.length === 0 && sources.workspace.valid) {
          checks.push(
            sourcePassCheck(
              'WORKSPACE',
              options.createId,
              'Workspace validation',
            ),
          );
        } else {
          checks.push(
            ...mapIssueChecks(
              'WORKSPACE',
              sources.workspace.issues,
              options.createId,
              'Open Projects and resolve workspace issues.',
            ),
          );
        }
      }

      if (sources.assets != null) {
        usedSources.push('ASSETS');
        if (sources.assets.issues.length === 0 && sources.assets.valid) {
          checks.push(
            sourcePassCheck('ASSETS', options.createId, 'Asset validation'),
          );
        } else {
          checks.push(
            ...mapIssueChecks(
              'ASSETS',
              sources.assets.issues,
              options.createId,
              'Open Assets and resolve asset issues.',
            ),
          );
        }
      }

      if (sources.metadata != null) {
        usedSources.push('METADATA');
        if (sources.metadata.issues.length === 0 && sources.metadata.valid) {
          checks.push(
            sourcePassCheck(
              'METADATA',
              options.createId,
              'Metadata validation',
            ),
          );
        } else {
          checks.push(
            ...mapIssueChecks(
              'METADATA',
              sources.metadata.issues,
              options.createId,
              'Open Metadata and resolve metadata issues.',
            ),
          );
        }
      }

      if (sources.publication != null) {
        usedSources.push('PUBLICATION');
        const publicationChecks = mapPublicationChecks(
          sources.publication,
          options.createId,
        );
        if (publicationChecks.length === 0) {
          checks.push(
            sourcePassCheck(
              'PUBLICATION',
              options.createId,
              'Publication readiness',
            ),
          );
        } else {
          checks.push(...publicationChecks);
        }
      }

      if (sources.exportCertification != null) {
        usedSources.push('EXPORT');
        if (
          sources.exportCertification.issues.length === 0 &&
          sources.exportCertification.valid
        ) {
          checks.push(
            sourcePassCheck(
              'EXPORT',
              options.createId,
              'Export certification',
            ),
          );
        } else {
          checks.push(
            ...mapIssueChecks(
              'EXPORT',
              sources.exportCertification.issues,
              options.createId,
              'Open Export Certification and resolve issues.',
            ),
          );
        }
      }

      if (sources.customChecks != null && sources.customChecks.length > 0) {
        usedSources.push('CUSTOM');
        checks.push(...sources.customChecks);
      }

      const readyCount = checks.filter((c) => c.status === 'READY').length;
      const warningCount = checks.filter((c) => c.status === 'WARNING').length;
      const blockedCount = checks.filter((c) => c.status === 'BLOCKED').length;
      const overall = overallStatus(checks);
      const readinessScore = computeScore(checks);

      return {
        id: options.createId('validation-report'),
        projectId,
        overallStatus: overall,
        readinessScore,
        checks,
        summary: {
          readyCount,
          warningCount,
          blockedCount,
          totalCount: checks.length,
          notes:
            overall === 'READY'
              ? 'Project validation passed.'
              : overall === 'WARNING'
                ? 'Project has validation warnings.'
                : 'Project has blocking validation errors.',
        },
        generatedAt: options.now(),
        metadata: {
          title: options.title?.trim() || `Validation · ${projectId}`,
          notes: 'Aggregated from existing validators.',
          sources: usedSources,
        },
      };
    },
  };
}
