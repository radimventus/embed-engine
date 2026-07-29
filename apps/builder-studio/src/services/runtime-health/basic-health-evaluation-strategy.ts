import type {
  DiagnosticFinding,
  InspectRuntimeInput,
  RuntimeHealthPackage,
  RuntimeHealthReport,
  RuntimeHealthValidation,
  RuntimeHealthValidationIssue,
  RuntimeOverallHealth,
} from '../../model';

/**
 * HealthEvaluationStrategy (EPIC-BLD-37).
 * Deterministic rules only — no AI.
 */
export type HealthEvaluationStrategy = {
  readonly id: string;
  supports(input: InspectRuntimeInput): boolean;
  evaluate(
    input: InspectRuntimeInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): {
    readonly overallHealth: RuntimeOverallHealth;
    readonly score: number;
    readonly findings: readonly DiagnosticFinding[];
  };
};

/**
 * BasicHealthEvaluationStrategy — deterministic health rules.
 */
export function createBasicHealthEvaluationStrategy(): HealthEvaluationStrategy {
  return {
    id: 'basic-health-evaluation-strategy',

    supports(input) {
      return input.sessionId.trim().length > 0;
    },

    evaluate(input, createId, now) {
      const stamp = now().toISOString();
      const findings: DiagnosticFinding[] = [];
      const observationCount = input.observationCount ?? 0;
      const executionCount = input.executionCount ?? 0;
      const moduleEventCount = input.moduleEventCount ?? 0;
      const stateEventCount = input.stateEventCount ?? 0;
      const observabilityScore = input.observabilityHealthScore ?? 0.5;
      const hasTimeline = input.hasTimeline ?? observationCount > 0;
      const stateConsistent = input.stateConsistent ?? true;
      const transitionConsistent = input.transitionConsistent ?? true;
      const validationPassed = input.validationPassed ?? null;

      let score = Math.max(0.2, Math.min(1, observabilityScore));

      if (!hasTimeline || observationCount === 0) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'warning',
          category: 'RuntimeHealth',
          description: 'No runtime observations available for health evaluation.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'no-observations',
            notes: 'Collect Observability first for richer diagnostics.',
          },
        });
        score = Math.min(score, 0.45);
      }

      if (executionCount === 0 && observationCount > 0) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'warning',
          category: 'SessionHealth',
          description: 'Session has observations but no execution ids.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'missing-execution',
            notes: 'Session health degraded.',
          },
        });
        score = Math.min(score, 0.65);
      }

      if (moduleEventCount === 0 && observationCount > 0) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'info',
          category: 'ModuleHealth',
          description: 'No module events observed in this session.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'no-module-events',
            notes: 'Module health unknown / idle.',
          },
        });
      }

      if (!stateConsistent) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'error',
          category: 'StateConsistency',
          description: 'Experience state consistency check failed.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'state-inconsistent',
            notes: 'State snapshot mismatches runtime refs.',
          },
        });
        score = Math.min(score, 0.35);
      } else if (stateEventCount === 0 && observationCount > 0) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'warning',
          category: 'StateConsistency',
          description: 'No state events observed; consistency unverified.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'state-unverified',
            notes: 'State consistency assumed.',
          },
        });
        score = Math.min(score, 0.7);
      }

      if (!transitionConsistent) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'error',
          category: 'TransitionConsistency',
          description: 'Runtime transition sequence is inconsistent.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'transition-inconsistent',
            notes: 'Timeline gaps or out-of-order transitions.',
          },
        });
        score = Math.min(score, 0.3);
      }

      if (validationPassed === false) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'error',
          category: 'ValidationSummary',
          description: 'Upstream observability or state validation failed.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'validation-failed',
            notes: 'Validation summary negative.',
          },
        });
        score = Math.min(score, 0.4);
      } else if (validationPassed === true) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'info',
          category: 'ValidationSummary',
          description: 'Upstream validation passed.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'validation-ok',
            notes: 'Validation summary positive.',
          },
        });
      }

      if (
        input.observabilityHealth === 'Degraded' ||
        (input.observabilityHealthScore !== undefined &&
          input.observabilityHealthScore < 0.7)
      ) {
        findings.push({
          id: createId('diagnostic-finding'),
          severity: 'warning',
          category: 'RuntimeHealth',
          description: 'Observability layer reports degraded runtime health.',
          source: 'basic-health-evaluation-strategy',
          timestamp: stamp,
          metadata: {
            code: 'observability-degraded',
            notes: `Observability health=${input.observabilityHealth ?? 'n/a'}.`,
          },
        });
        score = Math.min(score, 0.6);
      }

      score = Math.round(score * 1000) / 1000;
      const errorCount = findings.filter((item) => item.severity === 'error')
        .length;
      const warningCount = findings.filter(
        (item) => item.severity === 'warning',
      ).length;

      let overallHealth: RuntimeOverallHealth;
      if (observationCount === 0 && findings.every((f) => f.severity !== 'error')) {
        overallHealth = 'Unknown';
      } else if (errorCount > 0 || score < 0.4) {
        overallHealth = 'Critical';
      } else if (warningCount > 0 || score < 0.7) {
        overallHealth = 'Degraded';
      } else {
        overallHealth = 'Healthy';
      }

      return { overallHealth, score, findings };
    },
  };
}

export function splitFindings(findings: readonly DiagnosticFinding[]): {
  readonly warnings: readonly DiagnosticFinding[];
  readonly errors: readonly DiagnosticFinding[];
} {
  return {
    warnings: findings.filter((item) => item.severity === 'warning'),
    errors: findings.filter((item) => item.severity === 'error'),
  };
}

export function buildHealthReport(
  input: InspectRuntimeInput,
  evaluation: {
    readonly overallHealth: RuntimeOverallHealth;
    readonly score: number;
    readonly findings: readonly DiagnosticFinding[];
  },
  createId: (prefix: string) => string,
  now: () => Date,
): RuntimeHealthReport {
  const split = splitFindings(evaluation.findings);
  return {
    id: createId('runtime-health-report'),
    sessionId: input.sessionId,
    runtimeExecutionId: input.runtimeExecutionId ?? null,
    overallHealth: evaluation.overallHealth,
    warnings: split.warnings,
    errors: split.errors,
    findings: evaluation.findings,
    score: evaluation.score,
    createdAt: now().toISOString(),
    metadata: {
      title: input.title?.trim() || `Runtime Health ${input.sessionId}`,
      observabilityPackageId: input.observabilityPackageId ?? null,
      notes: 'Deterministic Runtime Health diagnostics.',
    },
  };
}

/**
 * RuntimeHealthValidator (EPIC-BLD-37).
 */
export type RuntimeHealthValidator = {
  validate(pkg: RuntimeHealthPackage): RuntimeHealthValidation;
  validateReport(
    pkg: RuntimeHealthPackage,
  ): readonly RuntimeHealthValidationIssue[];
  validateFindings(
    pkg: RuntimeHealthPackage,
  ): readonly RuntimeHealthValidationIssue[];
  validateScore(
    pkg: RuntimeHealthPackage,
  ): readonly RuntimeHealthValidationIssue[];
};

export function createRuntimeHealthValidator(options?: {
  readonly now?: () => Date;
}): RuntimeHealthValidator {
  const now = options?.now ?? (() => new Date());

  const validateReport = (
    pkg: RuntimeHealthPackage,
  ): RuntimeHealthValidationIssue[] => {
    const issues: RuntimeHealthValidationIssue[] = [];
    if (!pkg.report.sessionId.trim()) {
      issues.push({
        code: 'report-missing-session',
        severity: 'error',
        message: `Report ${pkg.report.id} missing sessionId.`,
      });
    }
    if (pkg.metadata.sessionId !== pkg.report.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match report.sessionId.',
      });
    }
    return issues;
  };

  const validateFindings = (
    pkg: RuntimeHealthPackage,
  ): RuntimeHealthValidationIssue[] => {
    const issues: RuntimeHealthValidationIssue[] = [];
    const warningIds = new Set(pkg.report.warnings.map((item) => item.id));
    const errorIds = new Set(pkg.report.errors.map((item) => item.id));
    for (const finding of pkg.report.findings) {
      if (!finding.description.trim()) {
        issues.push({
          code: 'finding-missing-description',
          severity: 'error',
          message: `Finding ${finding.id} missing description.`,
        });
      }
      if (finding.severity === 'warning' && !warningIds.has(finding.id)) {
        issues.push({
          code: 'warning-not-indexed',
          severity: 'error',
          message: `Warning finding ${finding.id} missing from warnings[].`,
        });
      }
      if (finding.severity === 'error' && !errorIds.has(finding.id)) {
        issues.push({
          code: 'error-not-indexed',
          severity: 'error',
          message: `Error finding ${finding.id} missing from errors[].`,
        });
      }
    }
    const expectedWarnings = pkg.report.findings.filter(
      (item) => item.severity === 'warning',
    ).length;
    const expectedErrors = pkg.report.findings.filter(
      (item) => item.severity === 'error',
    ).length;
    if (pkg.report.warnings.length !== expectedWarnings) {
      issues.push({
        code: 'warnings-count-mismatch',
        severity: 'error',
        message: 'warnings[] count does not match findings.',
      });
    }
    if (pkg.report.errors.length !== expectedErrors) {
      issues.push({
        code: 'errors-count-mismatch',
        severity: 'error',
        message: 'errors[] count does not match findings.',
      });
    }
    return issues;
  };

  const validateScore = (
    pkg: RuntimeHealthPackage,
  ): RuntimeHealthValidationIssue[] => {
    const issues: RuntimeHealthValidationIssue[] = [];
    if (pkg.report.score < 0 || pkg.report.score > 1) {
      issues.push({
        code: 'invalid-score',
        severity: 'error',
        message: `Score out of range (${pkg.report.score}).`,
      });
    }
    if (
      pkg.report.overallHealth === 'Healthy' &&
      pkg.report.errors.length > 0
    ) {
      issues.push({
        code: 'healthy-with-errors',
        severity: 'warning',
        message: 'Overall health Healthy despite error findings.',
      });
    }
    return issues;
  };

  return {
    validateReport,
    validateFindings,
    validateScore,
    validate(pkg) {
      const issues = [
        ...validateReport(pkg),
        ...validateFindings(pkg),
        ...validateScore(pkg),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
