export type {
  StudioId,
  CapabilityId,
  CapabilityMaturity,
  CapabilityHealthStatus,
  CapabilityDefinition,
  CapabilityMetadata,
  CapabilityHealth,
  CapabilityApi,
  CapabilityManifestEntry,
  CapabilityManifest,
  StudioComposition,
  CapabilityInspectorModel,
} from './domain/types';

export {
  listCapabilities,
  getCapability,
  requireCapability,
  listCapabilitiesForStudio,
  capabilityExistsOnce,
} from './registry/capabilityRegistry';

export { CAPABILITY_DEFINITIONS } from './registry/definitions';

export { createCapabilityApi } from './api/capabilityApi';

export {
  createCapabilityHost,
  type CapabilityHost,
} from './host/capabilityHost';

export { BUILDER_CAPABILITY_MANIFEST } from './manifests/builderManifest';
export { MANAGER_CAPABILITY_MANIFEST } from './manifests/managerManifest';
export { SALES_CAPABILITY_MANIFEST } from './manifests/salesManifest';

export {
  BUILDER_STUDIO_COMPOSITION,
  MANAGER_STUDIO_COMPOSITION,
  SALES_STUDIO_COMPOSITION,
  STUDIO_COMPOSITIONS,
  composeStudio,
  composeStudioById,
} from './composition/studioComposition';

export { capabilityIdFromBuilderNav } from './composition/builderNavBridge';
