import {
  createPlatformAccessAuthClient,
} from './platformAccessClient';

import {
  hydrateCanonicalRegistryFromAuthority,
} from '../registry/companyRegistry';
import type { HouseDataMode } from '../domain/types';

function normalizeHouseDataMode(
  value: string | undefined,
): HouseDataMode | undefined {
  switch (value) {
    case 'REFERENCE_DEMO':
    case 'LIVE_EMPTY':
    case 'LIVE':
      return value;
    default:
      return undefined;
  }
}

export type CanonicalRegistrySyncResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly error: string;
    };

export async function syncCanonicalRegistryFromAuthority():
  Promise<CanonicalRegistrySyncResult> {
  try {
    const result =
      await createPlatformAccessAuthClient()
        .readCanonicalRegistry();

    if (!result.ok) {
      return result;
    }

    hydrateCanonicalRegistryFromAuthority({
      tenants: result.registry.tenants,
      companies: result.registry.companies,
      workspaces: result.registry.workspaces,
      projects: result.registry.projects,
      houses: result.registry.houses.map((house) => ({
        ...house,
        dataMode: normalizeHouseDataMode(house.dataMode),
      })),
    });

    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        'Canonical registry se nepodařilo synchronizovat.',
    };
  }
}
