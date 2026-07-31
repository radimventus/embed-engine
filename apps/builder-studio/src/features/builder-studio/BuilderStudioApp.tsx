import { useState } from 'react';

import { AppShell } from '../../components/layout/AppShell';
import {
  HousePackageEditView,
  HousePackageMountPanel,
  HousePackageRuntimePreview,
  HousePackageSidebar,
  useHousePackageEditController,
  type HousePackageNavId,
} from '../house-package';

/**
 * CAP-BLD-07 — production Authoring Surface: HP + Shared Runtime Preview.
 */
export function BuilderStudioApp() {
  const {
    mountStatus,
    snapshot,
    session,
    saving,
    validating,
    publishing,
    previewOpen,
    validationReport,
    releaseSummary,
    releaseVerification,
    publishError,
    apply,
    save,
    validate,
    publish,
    openPreview,
    closePreview,
  } = useHousePackageEditController();
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
            {mountStatus.status === 'ready' && publishing && 'Publishing…'}
            {mountStatus.status === 'ready' &&
              !publishing &&
              previewOpen &&
              'Runtime Preview'}
            {mountStatus.status === 'ready' &&
              !publishing &&
              !previewOpen &&
              releaseSummary !== null &&
              'Publish OK · Preview ready'}
            {mountStatus.status === 'ready' &&
              !publishing &&
              !previewOpen &&
              releaseSummary === null &&
              publishError !== null &&
              'Publish failed · retry available'}
            {mountStatus.status === 'ready' &&
              !publishing &&
              !previewOpen &&
              releaseSummary === null &&
              publishError === null &&
              validationReport !== null &&
              (!validationReport.canPublish
                ? 'Validation ERROR · Publish blocked'
                : validationReport.status === 'WARNING'
                  ? 'Validation WARNING · Publish ready'
                  : validationReport.status === 'ERROR'
                    ? 'Geometry refresh needed · Publish ready'
                    : 'Validation PASS · Publish ready')}
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
          validationReport={validationReport}
          releaseSummary={releaseSummary}
          publishError={publishError}
          loadError={loadError}
          saving={saving}
          validating={validating}
          publishing={publishing}
          onChange={apply}
          onSave={() => {
            void save();
          }}
          onValidate={() => {
            void validate();
          }}
          onNavigate={setActiveNav}
          onPublish={() => {
            void publish();
          }}
          onOpenPreview={openPreview}
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
      {releaseSummary !== null &&
        releaseVerification !== null &&
        previewOpen && (
          <HousePackageRuntimePreview
            open={previewOpen}
            releaseSummary={releaseSummary}
            verification={releaseVerification}
            onClose={closePreview}
          />
        )}
    </AppShell>
  );
}
