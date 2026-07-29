import type {
  CreateObjectMetadataInput,
  InitializeMetadataInput,
  MetadataEvent,
  MetadataIndexEntry,
  MetadataPackage,
  MetadataValidation,
  ObjectAttribute,
  ObjectMetadataDocument,
  UpdateObjectMetadataDocumentInput,
} from '../../model';
import {
  createMetadataService,
  type MetadataService,
} from './metadata-service';

export type MetadataApi = {
  createMetadata(
    packageId: string | null,
    input: CreateObjectMetadataInput,
    init?: InitializeMetadataInput,
  ): ObjectMetadataDocument;
  updateMetadata(
    packageId: string,
    patch: UpdateObjectMetadataDocumentInput,
  ): ObjectMetadataDocument;
  publishMetadataDraft(packageId: string): ObjectMetadataDocument;
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
  disposeMetadata(packageId: string): MetadataPackage;
  getPackage(packageId: string): MetadataPackage | null;
  listPackages(): readonly MetadataPackage[];
  listEvents(): readonly MetadataEvent[];
  listIndex(): readonly MetadataIndexEntry[];
};

export function createMetadataApi(service?: MetadataService): MetadataApi {
  const metadata = service ?? createMetadataService();

  return {
    createMetadata(packageId, input, init) {
      if (packageId === null) {
        const pkg = metadata.initialize({
          projectId: init?.projectId ?? input.projectId,
          title: init?.title ?? 'Object Metadata',
        });
        return metadata.createMetadata(pkg.id, input);
      }
      return metadata.createMetadata(packageId, input);
    },

    updateMetadata(packageId, patch) {
      return metadata.updateMetadata(packageId, patch);
    },

    publishMetadataDraft(packageId) {
      return metadata.publishDraft(packageId);
    },

    findMetadata(metadataId) {
      return metadata.findMetadata(metadataId);
    },

    findMetadataBySlug(slug) {
      return metadata.findMetadataBySlug(slug);
    },

    validateMetadata(packageId) {
      return metadata.validateMetadata(packageId);
    },

    attachAssetReference(packageId, assetId) {
      return metadata.attachAssetReference(packageId, assetId);
    },

    detachAssetReference(packageId, assetId) {
      return metadata.detachAssetReference(packageId, assetId);
    },

    addAttribute(packageId, attribute) {
      return metadata.addAttribute(packageId, attribute);
    },

    removeAttribute(packageId, key) {
      return metadata.removeAttribute(packageId, key);
    },

    disposeMetadata(packageId) {
      return metadata.dispose(packageId);
    },

    getPackage(packageId) {
      return metadata.getPackage(packageId);
    },

    listPackages() {
      return metadata.listPackages();
    },

    listEvents() {
      return metadata.getEvents();
    },

    listIndex() {
      return metadata.getIndex();
    },
  };
}
