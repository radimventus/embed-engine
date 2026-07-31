import { useEffect, useRef } from 'react';

import type { HousePackageReleaseSummary } from './productionPublishGate';
import type { ReleaseVerification } from './releaseVerification';
import { mountHousePackageRuntimePreview } from './mountHousePackageRuntimePreview';

type HousePackageRuntimePreviewProps = {
  readonly open: boolean;
  readonly releaseSummary: HousePackageReleaseSummary;
  readonly verification: ReleaseVerification;
  readonly onClose: () => void;
};

/**
 * CAP-BLD-07 — full-bleed Runtime Preview host (Embed Experience over HP-002).
 */
export function HousePackageRuntimePreview({
  open,
  releaseSummary,
  verification,
  onClose,
}: HousePackageRuntimePreviewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const target = mountRef.current;
    if (target === null) {
      return;
    }

    let disposed = false;
    let handle: ReturnType<typeof mountHousePackageRuntimePreview> | null =
      null;
    try {
      handle = mountHousePackageRuntimePreview({ target });
    } catch (error: unknown) {
      console.error('Runtime Preview mount failed', error);
    }

    return () => {
      if (disposed) {
        return;
      }
      disposed = true;
      handle?.dispose();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-builder-canvas">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-builder-line bg-white px-6 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Runtime Preview
          </p>
          <h2 className="mt-1 text-lg font-semibold text-builder-ink">
            Decision Experience · Shared Runtime
          </h2>
          <dl className="mt-3 grid gap-1 font-mono text-[11px] text-builder-ink sm:grid-cols-2">
            <div>
              <dt className="inline text-builder-muted">Publish · </dt>
              <dd className="inline break-all">
                {verification.publishFingerprint}
              </dd>
            </div>
            <div>
              <dt className="inline text-builder-muted">Runtime · </dt>
              <dd className="inline break-all">
                {verification.runtimeFingerprint}
              </dd>
            </div>
            <div>
              <dt className="inline text-builder-muted">House Package · </dt>
              <dd className="inline break-all">
                {verification.housePackageFingerprint}
              </dd>
            </div>
            <div>
              <dt className="inline text-builder-muted">Built · </dt>
              <dd className="inline">{verification.buildTimestamp}</dd>
            </div>
            <div>
              <dt className="inline text-builder-muted">HP version · </dt>
              <dd className="inline">{releaseSummary.housePackageVersion}</dd>
            </div>
            <div>
              <dt className="inline text-builder-muted">Embed · </dt>
              <dd className="inline">{releaseSummary.embedVersion}</dd>
            </div>
          </dl>
          <p
            className={`mt-2 text-[12px] font-semibold ${
              verification.runtimeAligned
                ? 'text-builder-success'
                : 'text-builder-draft'
            }`}
          >
            {verification.runtimeAligned
              ? 'Verified: Preview runs on production Runtime projection'
              : 'Runtime source mismatch'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium"
        >
          Close Preview
        </button>
      </header>
      <div
        ref={mountRef}
        className="min-h-0 flex-1 overflow-auto bg-[#f7f6f4]"
        data-builder-runtime-preview=""
      />
    </div>
  );
}
