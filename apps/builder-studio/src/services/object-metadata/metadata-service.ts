import type {
  CreateObjectMetadataInput,
  MetadataEvent,
  MetadataEventType,
  MetadataIndexEntry,
  MetadataPackage,
  MetadataValidation,
  ObjectAttribute,
  ObjectMetadataDocument,
  InitializeMetadataInput,
  UpdateObjectMetadataDocumentInput,
} from '../../model';
import {
  createBasicMetadataStrategy,
  type MetadataStrategy,
} from './basic-metadata-strategy';
import {
  createBasicMetadataValidator,
  type MetadataValidator,
} from './basic-metadata-validator';
import { createMetadataIndex, type MetadataIndex } from './metadata-index';

export type MetadataServiceOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: MetadataStrategy;
  readonly validator?: MetadataValidator;
  readonly index?: MetadataIndex;
  readonly knownAssetIds?: () => ReadonlySet<string>;
};

/**
 * Object Metadata Editor service (EPIC-BX-04).
 * Canonical metadata only — asset references, no Asset Manager mutation.
 */
export type MetadataService = {
  initialize(input: InitializeMetadataInput): MetadataPackage;
  createMetadata(
    packageId: string,
    input: CreateObjectMetadataInput,
  ): ObjectMetadataDocument;
  updateMetadata(
    packageId: string,
    patch: UpdateObjectMetadataDocumentInput,
  ): ObjectMetadataDocument;
  publishDraft(packageId: string): ObjectMetadataDocument;
  findMetadata(metadataId: string): ObjectMetadataDocument | null;
  findMetadataBySlug(slug: string): ObjectMetadataDocument | null;
  validateMetadata(packageId: string): MetadataValidation;
  attachAssetReference(
    packageId: string,
    assetId: string,
  ): ObjectMetadataDocument;
  detachAssetReference(
    packageId: string,
    assetId: string,
  ): ObjectMetadataDocument;
  addAttribute(
    packageId: string,
    attribute: Omit<ObjectAttribute, 'id' | 'metadata'> & {
      readonly id?: string;
      readonly metadata?: ObjectAttribute['metadata'];
    },
  ): ObjectMetadataDocument;
  removeAttribute(packageId: string, key: string): ObjectMetadataDocument;
  dispose(packageId: string): MetadataPackage;
  getPackage(packageId: string): MetadataPackage | null;
  listPackages(): readonly MetadataPackage[];
  getEvents(): readonly MetadataEvent[];
  getIndex(): readonly MetadataIndexEntry[];
};

export function createMetadataService(
  options: MetadataServiceOptions = {},
): MetadataService {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicMetadataStrategy();
  const validator = options.validator ?? createBasicMetadataValidator();
  const index = options.index ?? createMetadataIndex();
  const knownAssetIds = options.knownAssetIds ?? (() => new Set<string>());

  const packages = new Map<string, MetadataPackage>();
  const events: MetadataEvent[] = [];

  const emit = (
    type: MetadataEventType,
    packageId: string,
    metadataId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('metadata-event'),
      type,
      packageId,
      metadataId,
      at: now().toISOString(),
      message,
    });
  };

  const req = (packageId: string): MetadataPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Metadata package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: MetadataPackage): MetadataPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const assertUniqueSlug = (
    slug: string,
    exceptMetadataId?: string,
  ): void => {
    const existing = index.findBySlug(slug);
    if (existing !== null && existing.metadataId !== exceptMetadataId) {
      throw new Error(`Slug is not unique in workspace: ${slug}`);
    }
  };

  const placeholderDocument = (
    projectId: string,
    stamp: string,
  ): ObjectMetadataDocument => ({
    id: createId('object-metadata'),
    projectId,
    title: 'Untitled object',
    slug: `untitled-${projectId}`,
    summary: '',
    description: '',
    category: 'general',
    language: 'cs',
    status: 'DRAFT',
    tags: [],
    seo: {
      title: '',
      description: '',
      keywords: [],
      canonicalUrl: '',
      socialImageAssetId: null,
    },
    attributes: [],
    assetReferences: [],
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      notes: 'Awaiting metadata.',
      authorLabel: 'Builder Studio',
    },
  });

  const replaceDocument = (
    pkg: MetadataPackage,
    document: ObjectMetadataDocument,
    notes: string,
  ): MetadataPackage =>
    store({
      ...pkg,
      updatedAt: document.updatedAt,
      objectMetadata: document,
      validation: null,
      metadata: {
        ...pkg.metadata,
        notes,
      },
    });

  return {
    initialize(input) {
      if (!input.projectId.trim()) {
        throw new Error('Metadata service requires projectId.');
      }
      const stamp = now().toISOString();
      const projectId = input.projectId.trim();
      const pkg: MetadataPackage = {
        id: createId('metadata-package'),
        version: '1.0.0',
        objectMetadata: placeholderDocument(projectId, stamp),
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: input.title?.trim() || `Metadata ${projectId}`,
          projectId,
          notes: 'Object metadata package.',
          status: 'Draft',
        },
        validation: null,
      };
      return store(pkg);
    },

    createMetadata(packageId, input) {
      const pkg = req(packageId);
      if (input.projectId.trim() !== pkg.metadata.projectId) {
        throw new Error(
          `Metadata projectId must match package project ${pkg.metadata.projectId}.`,
        );
      }
      if (!strategy.supports(input)) {
        throw new Error('Metadata strategy does not support this input.');
      }
      const document = strategy.create(
        input,
        () => createId('object-metadata'),
        () => now().toISOString(),
      );
      assertUniqueSlug(document.slug, pkg.objectMetadata.id);
      const next = replaceDocument(
        {
          ...pkg,
          metadata: {
            ...pkg.metadata,
            status: 'Ready',
          },
        },
        document,
        `Metadata created: ${document.title}.`,
      );
      emit(
        'MetadataCreated',
        next.id,
        document.id,
        `Created metadata ${document.slug}.`,
      );
      return document;
    },

    updateMetadata(packageId, patch) {
      const pkg = req(packageId);
      const current = pkg.objectMetadata;
      const nextSlug = patch.slug?.trim() ?? current.slug;
      if (nextSlug !== current.slug) {
        assertUniqueSlug(nextSlug, current.id);
      }
      const seoChanged = patch.seo !== undefined;
      const updated: ObjectMetadataDocument = {
        ...current,
        title: patch.title?.trim() ?? current.title,
        slug: nextSlug,
        summary: patch.summary?.trim() ?? current.summary,
        description: patch.description?.trim() ?? current.description,
        category: patch.category?.trim() ?? current.category,
        language: patch.language?.trim() ?? current.language,
        status: patch.status ?? current.status,
        tags: patch.tags ?? current.tags,
        seo: patch.seo
          ? {
              title: patch.seo.title?.trim() ?? current.seo.title,
              description:
                patch.seo.description?.trim() ?? current.seo.description,
              keywords: patch.seo.keywords ?? current.seo.keywords,
              canonicalUrl:
                patch.seo.canonicalUrl?.trim() ?? current.seo.canonicalUrl,
              socialImageAssetId:
                patch.seo.socialImageAssetId !== undefined
                  ? patch.seo.socialImageAssetId
                  : current.seo.socialImageAssetId,
            }
          : current.seo,
        attributes: patch.attributes ?? current.attributes,
        assetReferences: patch.assetReferences ?? current.assetReferences,
        updatedAt: now().toISOString(),
        metadata: {
          ...current.metadata,
          notes: patch.notes?.trim() ?? current.metadata.notes,
        },
      };
      replaceDocument(pkg, updated, `Metadata updated: ${updated.title}.`);
      emit(
        'MetadataUpdated',
        packageId,
        updated.id,
        `Updated metadata ${updated.slug}.`,
      );
      if (seoChanged) {
        emit(
          'SeoUpdated',
          packageId,
          updated.id,
          `SEO updated for ${updated.slug}.`,
        );
      }
      return updated;
    },

    publishDraft(packageId) {
      const pkg = req(packageId);
      const validation = validator.validate(pkg, knownAssetIds());
      if (!validation.valid) {
        throw new Error('Cannot publish metadata draft until validation passes.');
      }
      const published: ObjectMetadataDocument = {
        ...pkg.objectMetadata,
        status: 'PUBLISHED',
        updatedAt: now().toISOString(),
      };
      replaceDocument(
        pkg,
        published,
        `Metadata published: ${published.slug}.`,
      );
      emit(
        'MetadataPublished',
        packageId,
        published.id,
        `Published metadata draft ${published.slug}.`,
      );
      return published;
    },

    findMetadata(metadataId) {
      for (const pkg of packages.values()) {
        if (pkg.objectMetadata.id === metadataId) {
          return pkg.objectMetadata;
        }
      }
      return null;
    },

    findMetadataBySlug(slug) {
      const entry = index.findBySlug(slug);
      if (entry === null) return null;
      return packages.get(entry.packageId)?.objectMetadata ?? null;
    },

    validateMetadata(packageId) {
      const pkg = req(packageId);
      const validation = validator.validate(pkg, knownAssetIds());
      const slugCounts = new Map<string, number>();
      for (const entry of index.list()) {
        slugCounts.set(entry.slug, (slugCounts.get(entry.slug) ?? 0) + 1);
      }
      const duplicateSlug =
        (slugCounts.get(pkg.objectMetadata.slug) ?? 0) > 1
          ? [
              {
                code: 'integrity',
                severity: 'error' as const,
                message: `Slug is not unique in workspace: ${pkg.objectMetadata.slug}`,
              },
            ]
          : [];
      const merged: MetadataValidation = {
        valid: validation.valid && duplicateSlug.length === 0,
        issues: [...validation.issues, ...duplicateSlug],
        validatedAt: now().toISOString(),
      };
      store({
        ...pkg,
        updatedAt: now().toISOString(),
        validation: merged,
        metadata: {
          ...pkg.metadata,
          notes: merged.valid
            ? 'Metadata validated.'
            : 'Metadata validation failed.',
        },
      });
      emit(
        'MetadataValidated',
        packageId,
        pkg.objectMetadata.id,
        merged.valid ? 'Metadata valid.' : 'Metadata invalid.',
      );
      return merged;
    },

    attachAssetReference(packageId, assetId) {
      const pkg = req(packageId);
      const current = pkg.objectMetadata;
      const normalized = assetId.trim();
      if (!normalized) {
        throw new Error('assetId is required.');
      }
      if (current.assetReferences.includes(normalized)) {
        throw new Error(`Asset already attached: ${normalized}`);
      }
      const known = knownAssetIds();
      if (known.size > 0 && !known.has(normalized)) {
        throw new Error(`Unknown asset reference: ${normalized}`);
      }
      const updated: ObjectMetadataDocument = {
        ...current,
        assetReferences: [...current.assetReferences, normalized],
        updatedAt: now().toISOString(),
      };
      replaceDocument(pkg, updated, `Asset attached: ${normalized}.`);
      emit(
        'AssetReferenceAttached',
        packageId,
        updated.id,
        `Attached asset ${normalized}.`,
      );
      return updated;
    },

    detachAssetReference(packageId, assetId) {
      const pkg = req(packageId);
      const current = pkg.objectMetadata;
      if (!current.assetReferences.includes(assetId)) {
        throw new Error(`Asset reference not found: ${assetId}`);
      }
      const updated: ObjectMetadataDocument = {
        ...current,
        assetReferences: current.assetReferences.filter((id) => id !== assetId),
        seo: {
          ...current.seo,
          socialImageAssetId:
            current.seo.socialImageAssetId === assetId
              ? null
              : current.seo.socialImageAssetId,
        },
        updatedAt: now().toISOString(),
      };
      replaceDocument(pkg, updated, `Asset detached: ${assetId}.`);
      emit(
        'AssetReferenceDetached',
        packageId,
        updated.id,
        `Detached asset ${assetId}.`,
      );
      return updated;
    },

    addAttribute(packageId, attribute) {
      const pkg = req(packageId);
      const current = pkg.objectMetadata;
      if (current.attributes.some((item) => item.key === attribute.key)) {
        throw new Error(`Attribute already exists: ${attribute.key}`);
      }
      const nextAttribute: ObjectAttribute = {
        id: attribute.id?.trim() || createId('attr'),
        key: attribute.key.trim(),
        value: attribute.value,
        type: attribute.type,
        group: attribute.group.trim() || 'specs',
        order: attribute.order,
        metadata: attribute.metadata ?? {
          notes: 'Custom attribute.',
          editable: true,
        },
      };
      const updated: ObjectMetadataDocument = {
        ...current,
        attributes: [...current.attributes, nextAttribute].sort(
          (left, right) => left.order - right.order,
        ),
        updatedAt: now().toISOString(),
      };
      replaceDocument(pkg, updated, `Attribute added: ${nextAttribute.key}.`);
      emit(
        'AttributeAdded',
        packageId,
        updated.id,
        `Attribute added: ${nextAttribute.key}.`,
      );
      return updated;
    },

    removeAttribute(packageId, key) {
      const pkg = req(packageId);
      const current = pkg.objectMetadata;
      if (!current.attributes.some((item) => item.key === key)) {
        throw new Error(`Attribute not found: ${key}`);
      }
      const updated: ObjectMetadataDocument = {
        ...current,
        attributes: current.attributes.filter((item) => item.key !== key),
        updatedAt: now().toISOString(),
      };
      replaceDocument(pkg, updated, `Attribute removed: ${key}.`);
      emit(
        'AttributeRemoved',
        packageId,
        updated.id,
        `Attribute removed: ${key}.`,
      );
      return updated;
    },

    dispose(packageId) {
      const pkg = req(packageId);
      return store({
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed metadata package.',
        },
      });
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
