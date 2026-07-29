import type {
  ExportCertificate,
  ExportCertificationValidation,
  ExportCertificationValidationIssue,
} from '../../model';

export type ExportCertificationValidator = {
  validate(certificate: ExportCertificate): ExportCertificationValidation;
  validatePolicy(certificate: ExportCertificate): readonly string[];
  validateCapability(certificate: ExportCertificate): readonly string[];
  validateCompatibility(certificate: ExportCertificate): readonly string[];
  validateIntegrity(certificate: ExportCertificate): readonly string[];
};

export function createBasicExportCertificationValidator(): ExportCertificationValidator {
  const toIssues = (
    code: string,
    messages: readonly string[],
    severity: 'error' | 'warning',
  ): readonly ExportCertificationValidationIssue[] =>
    messages.map((message) => ({ code, severity, message }));

  return {
    validate(certificate) {
      const issues: ExportCertificationValidationIssue[] = [
        ...toIssues('policy', this.validatePolicy(certificate), 'error'),
        ...toIssues('capability', this.validateCapability(certificate), 'error'),
        ...toIssues('compatibility', this.validateCompatibility(certificate), 'error'),
        ...toIssues('integrity', this.validateIntegrity(certificate), 'warning'),
      ];

      return {
        valid: issues.every((i) => i.severity !== 'error'),
        issues,
        validatedAt: new Date().toISOString(),
      };
    },

    validatePolicy(certificate) {
      const issues: string[] = [];
      if (!certificate.artifactId.trim()) {
        issues.push('artifactId is required.');
      }
      return issues;
    },

    validateCapability(certificate) {
      const issues: string[] = [];
      if (!certificate.schemaVersion.trim()) {
        issues.push('schemaVersion is required.');
      }
      return issues;
    },

    validateCompatibility(certificate) {
      const issues: string[] = [];
      if (!certificate.certificationVersion.trim()) {
        issues.push('certificationVersion is required.');
      }
      return issues;
    },

    validateIntegrity(certificate) {
      const issues: string[] = [];
      if (!certificate.id.trim()) {
        issues.push('certificate.id is required.');
      }
      return issues;
    },
  };
}

