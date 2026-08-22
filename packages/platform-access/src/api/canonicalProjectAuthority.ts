import {
  createPlatformAccessAuthClient,
  type PlatformAccessWriteResult,
  type PlatformAccessCanonicalAuthorityBundle,
} from './platformAccessClient';
import { isPlatformAdmin } from '../domain/roles';
import { getDefaultCompanyRegistry } from '../registry/companyRegistry';
import { loadPlatformSession } from '../session/sessionStore';

const confirmedProjectIds = new Set<string>();

function bundleForProject(
  projectId: string,
): PlatformAccessCanonicalAuthorityBundle | null {
  const registry = getDefaultCompanyRegistry();

  const project = registry.canonicalProjects.find(
    (item) => item.id === projectId,
  );
  if (project === undefined) return null;

  const company = registry.companies.find(
    (item) => item.id === project.companyId,
  );
  if (company === undefined) return null;

  const workspace = registry.workspaces.find(
    (item) => item.id === project.workspaceId,
  );
  if (
    workspace === undefined ||
    workspace.companyId !== company.id
  ) {
    return null;
  }

  const tenant = registry.tenants.find(
    (item) => item.id === company.tenantId,
  );
  if (
    tenant === undefined ||
    tenant.companyId !== company.id
  ) {
    return null;
  }

  return {
    tenant,
    company,
    workspace,
    project,
  };
}

/**
 * TASK 66VR-FIX-04
 *
 * Browser canonical registry is a projection, never server authority.
 * Before a CONIS Admin performs an authoritative Project switch, reconcile
 * the complete canonical ownership bundle with Platform API.
 *
 * Existing server-known Projects are treated idempotently by Platform API.
 * Dynamic Projects are persisted into canonical-registry-extras.json.
 *
 * Non-admin users never gain a registration capability here; their switch
 * remains subject to the already-persisted server authority.
 */
export async function ensureCanonicalProjectAuthority(
  projectIdInput: string,
): Promise<PlatformAccessWriteResult> {
  const projectId = projectIdInput.trim();

  if (projectId.length === 0) {
    return {
      ok: false,
      error: 'Canonical Project ID není platné.',
    };
  }

  if (confirmedProjectIds.has(projectId)) {
    return { ok: true };
  }

  const session = loadPlatformSession();

  if (session === null) {
    return {
      ok: false,
      error: 'Nejste přihlášeni.',
    };
  }

  // Registration is a CONIS Admin capability only.
  // A partner/non-admin must rely on already persisted server authority.
  if (!isPlatformAdmin(session.user.roles)) {
    return { ok: true };
  }

  const bundle = bundleForProject(projectId);

  if (bundle === null) {
    return {
      ok: false,
      error:
        'Canonical Project není v klientském registru kompletní.',
    };
  }

  try {
    const result =
      await createPlatformAccessAuthClient()
        .persistCanonicalProjectAuthority(bundle);

    if (result.ok) {
      confirmedProjectIds.add(projectId);
    }

    return result;
  } catch {
    return {
      ok: false,
      error:
        'Canonical Project se nepodařilo spojit s Platform API.',
    };
  }
}
