import type {
  Asset,
  AssetLocation,
  AssetPackage,
  AssetValidation,
  AssetValidationIssue,
} from '../../model';

export type AssetValidator = {
  validate(pkg: AssetPackage): AssetValidation;
  validateAsset(asset: Asset): readonly string[];
  validateLocation(location: AssetLocation): readonly string[];
  validateMetadata(asset: Asset): readonly string[];
  validateIntegrity(pkg: AssetPackage): readonly string[];
};

export function createBasicAssetValidator(): AssetValidator {
  const toIssues = (
    code: string,
    messages: readonly string[],
    severity: 'error' | 'warning',
  ): readonly AssetValidationIssue[] =>
    messages.map((message) => ({ code, severity, message }));

  return {
    validate(pkg) {
      const issues: AssetValidationIssue[] = [
        ...pkg.assets.flatMap((asset) =>
          toIssues('asset', this.validateAsset(asset), 'error'),
        ),
        ...pkg.assets.flatMap((asset) =>
          toIssues('location', this.validateLocation(asset.location), 'error'),
        ),
        ...pkg.assets.flatMap((asset) =>
          toIssues('metadata', this.validateMetadata(asset), 'warning'),
        ),
        ...toIssues('integrity', this.validateIntegrity(pkg), 'error'),
      ];

      return {
        valid: issues.every((issue) => issue.severity !== 'error'),
        issues,
        validatedAt: new Date().toISOString(),
      };
    },

    validateAsset(asset) {
      const issues: string[] = [];
      if (!asset.id.trim()) issues.push('asset.id is required.');
      if (!asset.projectId.trim()) issues.push('asset.projectId is required.');
      if (!asset.name.trim()) issues.push('asset.name is required.');
      if (asset.size < 0) issues.push('asset.size must be >= 0.');
      return issues;
    },

    validateLocation(location) {
      const issues: string[] = [];
      if (!location.uri.trim()) {
        issues.push('location.uri is required.');
      }
      if (
        (location.provider === 'S3' || location.provider === 'CLOUDINARY') &&
        !location.key
      ) {
        issues.push(`${location.provider} location requires key.`);
      }
      if (location.provider === 'S3' && !location.bucket) {
        issues.push('S3 location requires bucket.');
      }
      return issues;
    },

    validateMetadata(asset) {
      const issues: string[] = [];
      if (!asset.metadata.label.trim()) {
        issues.push('asset.metadata.label is required.');
      }
      return issues;
    },

    validateIntegrity(pkg) {
      const issues: string[] = [];
      const ids = new Set<string>();
      for (const asset of pkg.assets) {
        if (ids.has(asset.id)) {
          issues.push(`Duplicate asset id: ${asset.id}`);
        }
        ids.add(asset.id);
        if (
          pkg.metadata.projectId &&
          asset.projectId !== pkg.metadata.projectId
        ) {
          issues.push(
            `Asset ${asset.id} belongs to project ${asset.projectId}, package expects ${pkg.metadata.projectId}.`,
          );
        }
      }
      return issues;
    },
  };
}
