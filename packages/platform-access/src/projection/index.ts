/**
 * CAP-PLAT-02 — Canonical Projection Layer barrel.
 */

export type {
  CanonicalBindSource,
  CanonicalPartnerProjection,
  CanonicalProjectIdentity,
  CanonicalHouseProjection,
  CanonicalBrandingProjection,
  CanonicalPublicationProjection,
  CanonicalExperienceRefs,
  CanonicalRuntimeBinding,
  CanonicalProjectProjection,
  CanonicalEntityHierarchy,
  ResolveCanonicalRuntimeBindingInput,
} from './canonicalProjectTypes';

export {
  projectCanonicalFromShared,
  listCanonicalProjects,
  listCanonicalHouses,
  listCanonicalHouseEntities,
  getCanonicalProject,
  getCanonicalHouse,
  getCanonicalHouseEntity,
  toCanonicalEntityHierarchy,
  isCanonicalSeedProject,
  resolveCanonicalRuntimeBinding,
} from './canonicalProjectProjection';
