import { useState } from 'react';

import { AppShell } from '../../components/layout/AppShell';
import {
  HousePackageEditView,
  HousePackageMountPanel,
  HousePackageSidebar,
  useHousePackageEditController,
  type HousePackageNavId,
} from '../house-package';

/**
 * CAP-BLD-04 — Builder mounts, edits, and persists HP-002 (ADR-023).
 */
export function BuilderStudioApp() {
  const { mountStatus, snapshot, session, saving, apply, save } =
    useHousePackageEditController();
  const [activeNav, setActiveNav] = useState<HousePackageNavId>('overview');

  const loadError =
    mountStatus.status === 'error' ? mountStatus.message : null;

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
            {mountStatus.status === 'loading' && 'Mounting HP-002…'}
            {mountStatus.status === 'ready' &&
              snapshot !== null &&
              (snapshot.dirtyState === 'save-failed'
                ? 'Save failed'
                : !snapshot.validation.ok
                  ? 'HP-002 invalid'
                  : snapshot.dirtyState === 'modified'
                    ? 'HP-002 modified'
                    : 'HP-002 clean')}
            {mountStatus.status === 'error' && 'Mount failed'}
          </div>
        </header>
      }
      sidebar={
        <HousePackageSidebar
          snapshot={snapshot}
          activeNav={activeNav}
          onSelectNav={setActiveNav}
        />
      }
      publishPanel={
        <HousePackageMountPanel
          snapshot={snapshot}
          session={session}
          loadError={loadError}
          saving={saving}
          onChange={apply}
          onSave={() => {
            void save();
          }}
        />
      }
    >
      {mountStatus.status === 'loading' && (
        <p className="text-sm text-builder-muted">
          Mounting House Package from apps/client-studio/public/house-package…
        </p>
      )}
      {mountStatus.status === 'error' && (
        <p className="rounded-lg bg-builder-draftBg px-4 py-3 text-sm text-builder-draft">
          {mountStatus.message}
        </p>
      )}
      {mountStatus.status === 'ready' &&
        snapshot !== null &&
        session !== null && (
          <HousePackageEditView
            snapshot={snapshot}
            session={session}
            activeNav={activeNav}
            saving={saving}
            onChange={apply}
            onSave={() => {
              void save();
            }}
          />
        )}
    </AppShell>
  );
}
