import type { PlatformSession } from '../domain/types';
import { createPlatformAccessAuthClient } from '../api/platformAccessClient';
import { ensureCanonicalProjectAuthority } from '../api/canonicalProjectAuthority';
import { loadPlatformSession, savePlatformSession } from '../session/sessionStore';

export const AUTHORITATIVE_PROJECT_CONTEXT_CHANGED = 'conis:authoritative-project-context-changed';

export type ProjectContextStudio = 'client' | 'builder' | 'manager' | 'sales';

/** Switch Project through durable session authority before applying UI state. */
export async function switchAuthoritativeProjectContext(
  projectId: string,
  activeStudio: ProjectContextStudio,
): Promise<{ readonly ok: true; readonly session: PlatformSession } | { readonly ok: false; readonly error: string }> {
  if (loadPlatformSession() === null) {
    return { ok: false, error: 'Nejste přihlášeni.' };
  }
  const authority = await ensureCanonicalProjectAuthority(projectId);
  if (!authority.ok) return authority;
  let result;
  try {
    result = await createPlatformAccessAuthClient().mutateSessionContext({
      action: 'switch',
      activeStudio,
      projectId,
      activeHouseId: null,
    });
  } catch {
    return { ok: false, error: 'Kontext projektu se nepodařilo spojit s Platform API.' };
  }
  if (!result.ok) return result;
  if (result.session.projectId !== projectId) {
    return { ok: false, error: 'Platform API nepotvrdilo požadovaný kontext projektu.' };
  }
  savePlatformSession(result.session);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTHORITATIVE_PROJECT_CONTEXT_CHANGED));
  }
  return result;
}
