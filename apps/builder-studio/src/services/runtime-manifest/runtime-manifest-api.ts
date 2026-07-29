import type {
  CollectManifestInput,
  RuntimeCapabilityDescriptor,
  RuntimeManifestEvent,
  RuntimeManifestIndexEntry,
  RuntimeManifestPackage,
  RuntimeManifestValidation,
} from '../../model';
import {
  createRuntimeManifestEngine,
  type RuntimeManifestEngine,
} from './runtime-manifest-engine';

/**
 * Runtime Manifest Engine API (EPIC-BLD-50).
 */
export type RuntimeManifestApi = {
  generateRuntimeManifest(input: CollectManifestInput): RuntimeManifestPackage;
  previewRuntimeManifest(packageId: string): RuntimeManifestPackage | null;
  listRuntimeCapabilities(
    packageId?: string,
  ): readonly RuntimeCapabilityDescriptor[];
  validateRuntimeManifest(packageId: string): RuntimeManifestValidation;
  publishRuntimeManifest(packageId: string): RuntimeManifestPackage;
  listPackages(): readonly RuntimeManifestPackage[];
  listEvents(): readonly RuntimeManifestEvent[];
  listIndex(): readonly RuntimeManifestIndexEntry[];
  dispose(packageId: string): RuntimeManifestPackage;
};

export function createRuntimeManifestApi(
  engine?: RuntimeManifestEngine,
): RuntimeManifestApi {
  const manifest = engine ?? createRuntimeManifestEngine();

  return {
    generateRuntimeManifest(input) {
      return manifest.generate(input);
    },
    previewRuntimeManifest(packageId) {
      return manifest.getPackage(packageId);
    },
    listRuntimeCapabilities(packageId) {
      return manifest.listCapabilities(packageId);
    },
    validateRuntimeManifest(packageId) {
      return manifest.validate(packageId);
    },
    publishRuntimeManifest(packageId) {
      manifest.validate(packageId);
      return manifest.publish(packageId);
    },
    listPackages() {
      return manifest.listPackages();
    },
    listEvents() {
      return manifest.getEvents();
    },
    listIndex() {
      return manifest.getIndex();
    },
    dispose(packageId) {
      return manifest.dispose(packageId);
    },
  };
}
