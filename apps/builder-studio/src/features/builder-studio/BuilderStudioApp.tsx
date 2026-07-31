import { useState } from 'react';

import { AppShell } from '../../components/layout/AppShell';
import {
  HousePackageMountPanel,
  HousePackageReadonlyView,
  HousePackageSidebar,
  useHousePackageMount,
  type HousePackageNavId,
} from '../house-package';

/**
 * CAP-BLD-02 — Builder opens by mounting HP-002 (ADR-023).
 * Mock Project session is not used on the authoring surface.
 */
export function BuilderStudioApp() {
  const mountState = useHousePackageMount();
  const [activeNav, setActiveNav] = useState<HousePackageNavId>('overview');

  const mount =
    mountState.status === 'ready' ? mountState.mount : null;
  const loadError =
    mountState.status === 'error' ? mountState.message : null;

  return (
    <AppShell
      header={
        <header className="flex h-builder-header shrink-0 items-center justify-between border-b border-builder-lineSoft bg-white px-[30px]">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">
              CONIS Builder
            </h1>
            <div className="text-sm text-builder-muted">
              House Package · Authoring Surface
            </div>
          </div>
          <div className="text-sm text-builder-muted">
            {mountState.status === 'loading' && 'Mounting HP-002…'}
            {mountState.status === 'ready' &&
              (mount?.ok ? 'HP-002 mounted' : 'HP-002 mount errors')}
            {mountState.status === 'error' && 'Mount failed'}
          </div>
        </header>
      }
      sidebar={
        <HousePackageSidebar
          mount={mount}
          activeNav={activeNav}
          onSelectNav={setActiveNav}
        />
      }
      publishPanel={
        <HousePackageMountPanel mount={mount} loadError={loadError} />
      }
    >
      {mountState.status === 'loading' && (
        <p className="text-sm text-builder-muted">
          Mounting House Package from apps/client-studio/public/house-package…
        </p>
      )}
      {mountState.status === 'error' && (
        <p className="rounded-lg bg-builder-draftBg px-4 py-3 text-sm text-builder-draft">
          {mountState.message}
        </p>
      )}
      {mountState.status === 'ready' && (
        <HousePackageReadonlyView mount={mountState.mount} activeNav={activeNav} />
      )}
    </AppShell>
  );
}
