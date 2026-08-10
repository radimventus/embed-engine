/**
 * CAP-PLAT-02d.1 / CAP-PLAT-04i — Manager host helper over Canonical Projection Layer.
 * Session projectId → Runtime Binding (House bind; dual-read). No Experience / Journey logic.
 * PT-CS-07 — no published-default fallback (explicit session required).
 */

import {
  isHouseInProject,
  resolveCanonicalRuntimeBinding,
  type CanonicalRuntimeBinding,
} from '@embed-engine/platform-access';

/**
 * Session `projectId` → Canonical Runtime Binding (bound House + parent Project).
 * Does not mutate Session.
 */
export function resolveCanonicalRuntimeBindingFromSession(
  sessionProjectId: string | null,
  activeHouseId: string | null = null,
): CanonicalRuntimeBinding {
  if (
    sessionProjectId !== null &&
    activeHouseId !== null &&
    isHouseInProject(activeHouseId, sessionProjectId)
  ) {
    return resolveCanonicalRuntimeBinding({
      explicitProjectId: activeHouseId,
      fallbackToFirstPublished: false,
    });
  }
  const binding = resolveCanonicalRuntimeBinding({
    sessionProjectId,
    fallbackToFirstPublished: false,
  });
  if (sessionProjectId === null || activeHouseId !== null) {
    return binding;
  }
  return {
    ...binding,
    runtimeHouseId: null,
    packagePublicRoot: null,
    isPublished: false,
  };
}

/** CAP-PLAT-04i — active Manager bind target is the House id. */
export function readManagerBoundHouseId(
  binding: CanonicalRuntimeBinding,
): string | null {
  return binding.runtimeHouseId?.trim() || null;
}

/** CAP-PLAT-04i — parent Canonical Project id from the same binding. */
export function readManagerBoundProjectId(
  binding: CanonicalRuntimeBinding,
): string | null {
  return binding.runtimeProjectId?.trim() || null;
}
