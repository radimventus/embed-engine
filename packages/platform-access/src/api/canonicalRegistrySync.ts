import {
  createPlatformAccessAuthClient,
} from './platformAccessClient';

import {
  hydrateCanonicalRegistryFromAuthority,
} from '../registry/companyRegistry';

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
      houses: result.registry.houses,
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
