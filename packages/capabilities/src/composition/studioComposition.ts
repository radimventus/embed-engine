/**
 * EPIC-BX-13 — Studio compositions (Studios are capability configurations).
 */

import type { StudioComposition } from '../domain/types';
import { BUILDER_CAPABILITY_MANIFEST } from '../manifests/builderManifest';
import { MANAGER_CAPABILITY_MANIFEST } from '../manifests/managerManifest';
import { SALES_CAPABILITY_MANIFEST } from '../manifests/salesManifest';
import { createCapabilityHost, type CapabilityHost } from '../host/capabilityHost';

export const BUILDER_STUDIO_COMPOSITION: StudioComposition = {
  studioId: 'builder',
  label: 'Builder Studio',
  manifest: BUILDER_CAPABILITY_MANIFEST,
};

export const MANAGER_STUDIO_COMPOSITION: StudioComposition = {
  studioId: 'manager',
  label: 'Manager Studio',
  manifest: MANAGER_CAPABILITY_MANIFEST,
};

export const SALES_STUDIO_COMPOSITION: StudioComposition = {
  studioId: 'sales',
  label: 'Sales Studio',
  manifest: SALES_CAPABILITY_MANIFEST,
};

export const STUDIO_COMPOSITIONS: readonly StudioComposition[] = [
  BUILDER_STUDIO_COMPOSITION,
  MANAGER_STUDIO_COMPOSITION,
  SALES_STUDIO_COMPOSITION,
];

export function composeStudio(
  composition: StudioComposition,
): CapabilityHost {
  const host = createCapabilityHost(composition.manifest);
  host.activateAll();
  return host;
}

export function composeStudioById(
  studioId: StudioComposition['studioId'],
): CapabilityHost {
  const composition = STUDIO_COMPOSITIONS.find(
    (item) => item.studioId === studioId,
  );
  if (composition === undefined) {
    throw new Error(`Unknown studio composition: ${studioId}`);
  }
  return composeStudio(composition);
}
