import type {
  MetadataPackage,
  MetadataValidation,
  MetadataValidationIssue,
  ObjectAttribute,
  ObjectMetadataDocument,
  SeoMetadata,
} from '../../model';

export type MetadataValidator = {
  validate(
    pkg: MetadataPackage,
    knownAssetIds?: ReadonlySet<string>,
  ): MetadataValidation;
  validateSeo(
    seo: SeoMetadata,
    knownAssetIds?: ReadonlySet<string>,
  ): readonly string[];
  validateAttributes(attributes: readonly ObjectAttribute[]): readonly string[];
  validateAssetReferences(
    references: readonly string[],
    knownAssetIds?: ReadonlySet<string>,
  ): readonly string[];
  validateIntegrity(pkg: MetadataPackage): readonly string[];
};

export function createBasicMetadataValidator(): MetadataValidator {
  const toIssues = (
    code: string,
    messages: readonly string[],
    severity: 'error' | 'warning',
  ): readonly MetadataValidationIssue[] =>
    messages.map((message) => ({ code, severity, message }));

  return {
    validate(pkg, knownAssetIds) {
      const document = pkg.objectMetadata;
      const issues: MetadataValidationIssue[] = [
        ...toIssues(
          'seo',
          this.validateSeo(document.seo, knownAssetIds),
          'warning',
        ),
        ...toIssues(
          'attributes',
          this.validateAttributes(document.attributes),
          'error',
        ),
        ...toIssues(
          'assetReferences',
          this.validateAssetReferences(
            document.assetReferences,
            knownAssetIds,
          ),
          'error',
        ),
        ...toIssues('integrity', this.validateIntegrity(pkg), 'error'),
      ];

      if (!document.title.trim()) {
        issues.push({
          code: 'document',
          severity: 'error',
          message: 'title is required.',
        });
      }
      if (!document.slug.trim()) {
        issues.push({
          code: 'document',
          severity: 'error',
          message: 'slug is required.',
        });
      }

      return {
        valid: issues.every((issue) => issue.severity !== 'error'),
        issues,
        validatedAt: new Date().toISOString(),
      };
    },

    validateSeo(seo, knownAssetIds) {
      const issues: string[] = [];
      if (seo.title.length > 70) {
        issues.push('SEO title should stay under 70 characters.');
      }
      if (seo.description.length > 160) {
        issues.push('SEO description should stay under 160 characters.');
      }
      if (
        seo.socialImageAssetId !== null &&
        knownAssetIds !== undefined &&
        knownAssetIds.size > 0 &&
        !knownAssetIds.has(seo.socialImageAssetId)
      ) {
        issues.push(
          `socialImageAssetId is unknown: ${seo.socialImageAssetId}`,
        );
      }
      return issues;
    },

    validateAttributes(attributes) {
      const issues: string[] = [];
      const keys = new Set<string>();
      const ids = new Set<string>();
      for (const attribute of attributes) {
        if (!attribute.id.trim()) {
          issues.push('attribute.id is required.');
        }
        if (ids.has(attribute.id)) {
          issues.push(`Duplicate attribute id: ${attribute.id}`);
        }
        ids.add(attribute.id);
        if (!attribute.key.trim()) {
          issues.push('attribute.key is required.');
        }
        if (keys.has(attribute.key)) {
          issues.push(`Duplicate attribute key: ${attribute.key}`);
        }
        keys.add(attribute.key);
        if (attribute.order < 0) {
          issues.push(`attribute.order must be >= 0 for ${attribute.key}.`);
        }
      }
      return issues;
    },

    validateAssetReferences(references, knownAssetIds) {
      const issues: string[] = [];
      const seen = new Set<string>();
      for (const assetId of references) {
        if (!assetId.trim()) {
          issues.push('asset reference id is required.');
          continue;
        }
        if (seen.has(assetId)) {
          issues.push(`Duplicate asset reference: ${assetId}`);
        }
        seen.add(assetId);
        if (
          knownAssetIds !== undefined &&
          knownAssetIds.size > 0 &&
          !knownAssetIds.has(assetId)
        ) {
          issues.push(`Unknown asset reference: ${assetId}`);
        }
      }
      return issues;
    },

    validateIntegrity(pkg) {
      const issues: string[] = [];
      const document: ObjectMetadataDocument = pkg.objectMetadata;
      if (
        pkg.metadata.projectId &&
        document.projectId !== pkg.metadata.projectId
      ) {
        issues.push(
          `Metadata project ${document.projectId} does not match package ${pkg.metadata.projectId}.`,
        );
      }
      return issues;
    },
  };
}
