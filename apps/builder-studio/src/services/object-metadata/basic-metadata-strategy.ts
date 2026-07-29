import type {
  CreateObjectMetadataInput,
  ObjectMetadataDocument,
  SeoMetadata,
} from '../../model';

export type MetadataStrategy = {
  readonly id: string;
  supports(input: CreateObjectMetadataInput): boolean;
  create(
    input: CreateObjectMetadataInput,
    createId: () => string,
    now: () => string,
  ): ObjectMetadataDocument;
  validate(document: ObjectMetadataDocument): boolean;
};

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'object';
}

function defaultSeo(title: string, partial?: Partial<SeoMetadata>): SeoMetadata {
  return {
    title: partial?.title?.trim() || title,
    description: partial?.description?.trim() || '',
    keywords: partial?.keywords ?? [],
    canonicalUrl: partial?.canonicalUrl?.trim() || '',
    socialImageAssetId: partial?.socialImageAssetId ?? null,
  };
}

export function createBasicMetadataStrategy(): MetadataStrategy {
  return {
    id: 'basic-metadata-strategy',

    supports(input) {
      return (
        input.projectId.trim().length > 0 && input.title.trim().length > 0
      );
    },

    create(input, createId, now) {
      const stamp = now();
      const title = input.title.trim();
      return {
        id: createId(),
        projectId: input.projectId.trim(),
        title,
        slug: input.slug?.trim() || slugify(title),
        summary: input.summary?.trim() || '',
        description: input.description?.trim() || '',
        category: input.category?.trim() || 'general',
        language: input.language?.trim() || 'cs',
        status: 'DRAFT',
        tags: input.tags ?? [],
        seo: defaultSeo(title, input.seo),
        attributes: (input.attributes ?? []).map((attribute, index) => ({
          id: attribute.id || `attr-${index + 1}`,
          key: attribute.key,
          value: attribute.value,
          type: attribute.type,
          group: attribute.group,
          order: attribute.order,
          metadata: attribute.metadata ?? {
            notes: 'Custom attribute.',
            editable: true,
          },
        })),
        assetReferences: input.assetReferences ?? [],
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          notes: input.notes?.trim() || 'Object metadata document.',
          authorLabel: 'Builder Studio',
        },
      };
    },

    validate(document) {
      return (
        document.projectId.trim().length > 0 &&
        document.title.trim().length > 0 &&
        document.slug.trim().length > 0
      );
    },
  };
}
