import type { HousePackageMountState } from '../house-package/useHousePackageMount';

export function createBuilderPackageRuntimeEvidence(input: {
  readonly activeProjectId: string | null;
  readonly activeHouseId: string | null;
  readonly houseName: string | null;
  readonly houseStatus: string | null;
  readonly houseDataMode: string | null;
  readonly registryPackageRoot: string | null;
  readonly resolvedBuilderHousePackageRoot: string | null;
  readonly mountState: HousePackageMountState;
}): Record<string, unknown> {
  const mount =
    input.mountState.status === 'ready' ? input.mountState.mount : null;
  return {
    activeProjectId: input.activeProjectId,
    activeHouseId: input.activeHouseId,
    houseName: input.houseName,
    houseStatus: input.houseStatus,
    houseDataMode: input.houseDataMode,
    registryPackageRoot: input.registryPackageRoot,
    resolvedBuilderHousePackageRoot: input.resolvedBuilderHousePackageRoot,
    mountDiskRoot: input.resolvedBuilderHousePackageRoot,
    mountResult:
      mount === null
        ? {
            canonicalDiskRoot: null,
            packageRootLabel: null,
            ok: false,
            errorsLength: null,
          }
        : {
            canonicalDiskRoot: mount.canonicalDiskRoot,
            packageRootLabel: mount.packageRootLabel,
            ok: mount.ok,
            errorsLength: mount.errors.length,
          },
  };
}

export function logBuilderPackageRuntimeEvidence(
  payload: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  const enabled =
    new URLSearchParams(window.location.search).get('runtimeEvidence') === '1' ||
    window.localStorage.getItem('runtimeEvidence') === '1';
  if (enabled) {
    console.info('[PT-RUNTIME-EVIDENCE-01] BuilderPackageBinding', payload);
  }
}
