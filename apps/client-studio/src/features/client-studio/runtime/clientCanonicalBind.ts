/**
 * CAP-PLAT-02c / CAP-PLAT-04h — Client host helpers over Canonical Projection Layer.
 * Domain identity / bind only — no Experience / Journey logic.
 *
 * CAP-PLAT-04h — bind House; menu from House CPL; header = company · house.name.
 */

import {
  getCanonicalHouse,
  getCanonicalProject,
  getDefaultCompanyRegistry,
  getSharedWorkspaceContext,
  isHouseInProject,
  listCanonicalHouses,
  listCanonicalProjects,
  loadPlatformSession,
  resolveCanonicalRuntimeBinding,
  resolveWorkspaceHouseBinding,
  type CanonicalProjectProjection,
  type CanonicalRuntimeBinding,
} from '@embed-engine/platform-access';

/**
 * CAP-PLAT-02c.1b — Collect Session / URL (and host) projectId pointers only.
 * CAP-VR33c — Session always carries a canonical Project id; House selection
 * remains URL-local. No Company / Project / House copies are made here.
 */
export function readClientBindCandidates(): {
  readonly urlProjectId: string | null;
  readonly urlHouseId: string | null;
  readonly workspaceContextProjectId: string | null;
  readonly workspaceContextHouseId: string | null;
  readonly sessionProjectId: string | null;
  readonly sessionHouseId: string | null;
  readonly embedObjectId: string | null;
} {
  const session = loadPlatformSession();
  const urlProjectId =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('projectId')
      : null;
  const urlHouseId =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('houseId')
      : null;
  const embedObjectId =
    typeof document !== 'undefined'
      ? document
          .querySelector('[data-embed-root], [data-client-studio-root]')
          ?.getAttribute('data-object-id')
      : null;

  return {
    urlProjectId,
    urlHouseId,
    workspaceContextProjectId:
      getSharedWorkspaceContext()?.projectId?.trim() || null,
    workspaceContextHouseId:
      getSharedWorkspaceContext()?.activeHouseId?.trim() || null,
    sessionProjectId: session?.projectId?.trim() || null,
    sessionHouseId: session?.activeHouseId?.trim() || null,
    embedObjectId: embedObjectId ?? null,
  };
}

/**
 * CAP-PLAT-02c.1b — URL `projectId` → Canonical Runtime Binding (House bind).
 * Does not mutate URL.
 */
export function resolveCanonicalRuntimeBindingFromUrl(
  urlProjectId: string | null,
): CanonicalRuntimeBinding {
  const houseId = urlProjectId?.trim() ?? '';
  return resolveCanonicalRuntimeBinding({
    urlProjectId:
      houseId.length > 0 && getCanonicalHouse(houseId) !== null
        ? houseId
        : null,
    fallbackToFirstPublished: false,
  });
}

/**
 * CAP-VR33c — Session `projectId` is accepted only as a canonical Project.
 * Does not mutate Session.
 */
export function resolveCanonicalRuntimeBindingFromSession(
  _sessionProjectId: string | null,
): CanonicalRuntimeBinding {
  return resolveCanonicalRuntimeBinding({
    fallbackToFirstPublished: false,
  });
}

/** CAP-PLAT-02c.1a/1b / CAP-PLAT-04h — Client Runtime bind: Session/URL → House. */
export function resolveClientRuntimeBinding(): CanonicalRuntimeBinding {
  return resolveClientRuntimeBindingFromCandidates(readClientBindCandidates());
}

/**
 * CAP-VR33c — Shared Session defines the Client Project scope. A House URL may
 * select a House only when that House belongs to the scoped Project.
 */
export function resolveClientRuntimeBindingFromCandidates(
  candidates: ReturnType<typeof readClientBindCandidates>,
): CanonicalRuntimeBinding {
  const activeProjectId = resolveClientActiveProjectId(
    candidates.sessionProjectId,
  );
  // An Embed mount selects one explicit House. It is a validated input to the
  // shared binding boundary and must not be silently replaced by a stale
  // workspace/session active House.
  const requestedHouseId = candidates.embedObjectId ?? candidates.urlHouseId;
  if (activeProjectId !== null && requestedHouseId !== null) {
    const workspaceBinding = resolveWorkspaceHouseBinding({
      projectId: activeProjectId,
      houseId: requestedHouseId,
    });
    if (
      workspaceBinding !== null &&
      workspaceBinding.authoringDraftPackage !== null
    ) {
      return resolveAuthoringDraftRuntimeBinding(workspaceBinding);
    }
    if (isHouseInProject(requestedHouseId, activeProjectId)) {
      const canonicalBinding = resolveCanonicalRuntimeBinding({
        explicitProjectId: requestedHouseId,
        fallbackToFirstPublished: false,
      });
      if (canonicalBinding.runtimeHouseId !== null) {
        return canonicalBinding;
      }
    }
  }
  const sharedHouseId =
    candidates.sessionHouseId ??
    candidates.workspaceContextHouseId ??
    candidates.urlHouseId;
  if (
    activeProjectId !== null &&
    sharedHouseId !== null &&
    isHouseInProject(sharedHouseId, activeProjectId)
  ) {
    const canonicalBinding = resolveCanonicalRuntimeBinding({
      explicitProjectId: sharedHouseId,
      fallbackToFirstPublished: false,
    });
    if (canonicalBinding.runtimeHouseId !== null) {
      return canonicalBinding;
    }
  }
  if (activeProjectId !== null && sharedHouseId !== null) {
    const workspaceBinding = resolveWorkspaceHouseBinding({
      projectId: activeProjectId,
      houseId: sharedHouseId,
    });
    if (
      workspaceBinding !== null &&
      workspaceBinding.authoringDraftPackage !== null
    ) {
      return resolveAuthoringDraftRuntimeBinding(workspaceBinding);
    }
  }
  if (activeProjectId !== null) {
    return resolveCanonicalRuntimeBinding({
      fallbackToFirstPublished: false,
    });
  }
  const explicitHouseId = [
    candidates.urlProjectId,
    candidates.embedObjectId,
  ].find((candidate) => {
    const houseId = candidate?.trim() ?? '';
    return houseId.length > 0 && getCanonicalHouse(houseId) !== null;
  });
  return resolveCanonicalRuntimeBinding({
    explicitProjectId: explicitHouseId ?? null,
    fallbackToFirstPublished: false,
  });
}

function resolveAuthoringDraftRuntimeBinding(
  workspaceBinding: NonNullable<
    ReturnType<typeof resolveWorkspaceHouseBinding>
  >,
): CanonicalRuntimeBinding {
  const draft = workspaceBinding.authoringDraftPackage;
  if (draft === null) {
    throw new Error('AUTHORING_DRAFT package is required for draft runtime binding.');
  }
  const parentProject = getCanonicalProject(workspaceBinding.projectId);
  if (parentProject === null) {
    return {
      runtimeHouseId: null,
      runtimeProjectId: null,
      packagePublicRoot: null,
      isPublished: false,
      bindSource: 'none',
      project: null,
    };
  }
  return {
    runtimeHouseId: workspaceBinding.houseId,
    runtimeProjectId: workspaceBinding.projectId,
    packagePublicRoot: draft.packagePublicRoot,
    isPublished: false,
    bindSource: 'workspace-context',
    project: {
      ...parentProject,
      house: {
        houseId: workspaceBinding.houseId,
        name: draft.name,
        slug: workspaceBinding.houseId,
        objectType: 'house',
        packageRoot: draft.packageRoot,
        packagePublicRoot: draft.packagePublicRoot,
        dataMode: workspaceBinding.dataMode,
      },
    },
  };
}

/**
 * CAP-PLAT-04h / CAP-PLAT-04R4b — Client header: `{company.name} · {house.name}`.
 * Zero Houses → Partner only (never invent House from Project).
 */
export function formatClientPartnerHouseTitle(
  projection: CanonicalProjectProjection | null | undefined,
): string {
  if (projection === null || projection === undefined) {
    return '';
  }
  const partner = projection.partner.companyName.trim();
  const houseSlice = projection.house;
  if (houseSlice === null) {
    return partner;
  }
  const house = houseSlice.name.trim() || houseSlice.houseId;
  if (partner.length === 0) return house;
  return `${partner} · ${house}`;
}

/** CAP-PLAT-04h / CAP-PLAT-04R4b — Client house menu from CPL Houses with a House slice. */
export function resolveClientActiveProjectId(
  sessionProjectId: string | null | undefined = loadPlatformSession()?.projectId,
): string | null {
  const candidate = sessionProjectId?.trim() ?? '';
  return listCanonicalProjects().some(
    (projection) => projection.project.projectId === candidate,
  )
    ? candidate
    : null;
}

/** CAP-VR33c — House menu is constrained to the shared canonical Project. */
export function listClientHouses(
  projectId: string | null = resolveClientActiveProjectId(),
): readonly CanonicalProjectProjection[] {
  const byId = new Map(
    listCanonicalHouses(projectId ?? undefined)
      .filter((projection) => projection.house !== null)
      .map((projection) => [projection.house!.houseId, projection]),
  );
  if (projectId !== null) {
    for (const house of getDefaultCompanyRegistry().projects) {
      if (house.canonicalProjectId !== projectId || byId.has(house.id)) {
        continue;
      }
      const projection = getCanonicalHouse(house.id);
      if (
        projection !== null &&
        projection.house !== null &&
        projection.project.projectId === projectId
      ) {
        byId.set(house.id, projection);
      }
    }
  }
  return [...byId.values()];
}

/** CAP-PLAT-04h — active menu / session pointer is the bound House id. */
export function readActiveClientHouseId(
  binding: CanonicalRuntimeBinding = resolveClientRuntimeBinding(),
): string {
  return binding.runtimeHouseId?.trim() ?? '';
}
