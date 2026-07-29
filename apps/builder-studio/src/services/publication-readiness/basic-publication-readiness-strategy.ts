import type {
  InitializePublicationReadinessInput,
  PublicationReadinessPackage,
  PublicationReadinessReport,
  ValidatePublicationReadinessInput,
} from '../../model';

export type PublicationReadinessStrategy = {
  readonly id: string;
  supports(input: ValidatePublicationReadinessInput): boolean;
  validate(
    input: ValidatePublicationReadinessInput,
    createId: (prefix: string) => string,
  ): PublicationReadinessReport;
  evaluate(report: PublicationReadinessReport): PublicationReadinessReport;
};

export function createBasicPublicationReadinessStrategy(): PublicationReadinessStrategy {
  return {
    id: 'basic-publication-readiness-strategy',

    supports(input) {
      return (
        input.publicationId.trim().length > 0 &&
        input.objectId.trim().length > 0 &&
        input.version.trim().length > 0
      );
    },

    validate(input, createId) {
      const checks =
        input.checks ??
        [
          {
            id: createId('publication-check'),
            name: 'Metadata completeness',
            result: 'pass',
            severity: 'info',
            message: 'Required metadata are present.',
          },
          {
            id: createId('publication-check'),
            name: 'Reference integrity',
            result: 'pass',
            severity: 'info',
            message: 'References are consistent.',
          },
          {
            id: createId('publication-check'),
            name: 'Client consumption readiness',
            result: 'pass',
            severity: 'info',
            message: 'Publication is ready for Client Studio consumption.',
          },
        ];

      const warnings = checks
        .filter((check) => check.result === 'warning')
        .map((check) => check.message);
      const errors = checks
        .filter((check) => check.result === 'fail')
        .map((check) => check.message);

      return {
        id: createId('publication-readiness-report'),
        publicationId: input.publicationId,
        status:
          errors.length > 0
            ? 'NOT_READY'
            : warnings.length > 0
              ? 'READY_WITH_WARNINGS'
              : 'READY',
        checks,
        warnings,
        errors,
        metadata: {
          title: input.title?.trim() || input.objectId,
          notes:
            input.notes?.trim() ||
            'Publication readiness gate — validation only.',
          objectId: input.objectId,
          version: input.version,
        },
      };
    },

    evaluate(report) {
      const warnings = report.checks
        .filter((check) => check.result === 'warning')
        .map((check) => check.message);
      const errors = report.checks
        .filter((check) => check.result === 'fail')
        .map((check) => check.message);
      return {
        ...report,
        warnings,
        errors,
        status:
          errors.length > 0
            ? 'NOT_READY'
            : warnings.length > 0
              ? 'READY_WITH_WARNINGS'
              : 'READY',
      };
    },
  };
}

export function buildInitialPublicationReadinessPackage(
  input: InitializePublicationReadinessInput,
  createId: (prefix: string) => string,
  now: () => Date,
): PublicationReadinessPackage {
  const stamp = now().toISOString();
  return {
    id: createId('publication-readiness-package'),
    version: '1.0.0',
    report: {
      id: createId('publication-readiness-report'),
      publicationId: 'publication-pending',
      status: 'NOT_READY',
      checks: [],
      warnings: [],
      errors: [],
      metadata: {
        title: input.title?.trim() || `Publication Readiness ${input.sessionId}`,
        notes: 'Awaiting validation.',
        objectId: 'object-pending',
        version: '0.0.0',
      },
    },
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: input.title?.trim() || `Publication Readiness ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Publication readiness package — validation only.',
      status: 'Draft',
    },
  };
}
