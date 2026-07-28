import type {
  QualityGate,
  ValidationFinding,
  ValidationReport,
} from '../../model';

export function decideQualityGate(
  errors: readonly ValidationFinding[],
  warnings: readonly ValidationFinding[],
): QualityGate {
  if (errors.length > 0) {
    return 'Failed';
  }
  if (warnings.length > 0) {
    return 'PassedWithWarnings';
  }
  return 'Passed';
}

export function computeValidationScore(
  findings: readonly ValidationFinding[],
  totalRules: number,
): number {
  if (totalRules <= 0) {
    return 100;
  }
  const errorWeight = 12;
  const warningWeight = 4;
  const infoWeight = 1;
  let penalty = 0;
  for (const finding of findings) {
    if (finding.severity === 'error') {
      penalty += errorWeight;
    } else if (finding.severity === 'warning') {
      penalty += warningWeight;
    } else {
      penalty += infoWeight;
    }
  }
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function buildValidationReport(input: {
  readonly projectId: string;
  readonly findings: readonly ValidationFinding[];
  readonly totalRules: number;
  readonly timestamp: string;
}): ValidationReport {
  const errors = input.findings.filter((item) => item.severity === 'error');
  const warnings = input.findings.filter((item) => item.severity === 'warning');
  const infos = input.findings.filter((item) => item.severity === 'info');
  const qualityGate = decideQualityGate(errors, warnings);
  const recommendations = [
    ...errors.map((item) => item.recommendation),
    ...warnings.map((item) => item.recommendation),
    ...infos.map((item) => item.recommendation),
  ];

  return {
    projectId: input.projectId,
    score: computeValidationScore(input.findings, input.totalRules),
    passed: qualityGate !== 'Failed',
    qualityGate,
    warnings,
    errors,
    recommendations,
    timestamp: input.timestamp,
    findings: input.findings,
  };
}

/**
 * Publish may proceed only when Quality Gate is not Failed.
 */
export function isPublishAllowedByQualityGate(gate: QualityGate): boolean {
  return gate === 'Passed' || gate === 'PassedWithWarnings';
}
