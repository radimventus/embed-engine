import { useEffect, useRef } from 'react';

import type { HousePackageReleaseSummary } from './productionPublishGate';
import type { ReleaseVerification } from './releaseVerification';
import { mountHousePackageRuntimePreview } from './mountHousePackageRuntimePreview';

type HousePackageRuntimePreviewProps = {
  readonly open: boolean;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly verification: ReleaseVerification | null;
  readonly onClose: () => void;
};

/**
 * CAP-BLD-07 / PR-022D — on-demand Náhled (Shared Runtime over HP-002).
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
      target.replaceChildren();
      handle = mountHousePackageRuntimePreview({ target });
    } catch (error: unknown) {
      console.error('Náhled mount failed', error);
      target.textContent =
        error instanceof Error ? error.message : 'Náhled se nepodařilo načíst.';
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
    <div className="flex min-h-screen flex-col bg-builder-canvas">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-builder-line bg-white px-6 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Náhled
          </p>
          <h2 className="mt-1 text-lg font-semibold text-builder-ink">
            Decision Experience · Shared Runtime
          </h2>
          {verification !== null && releaseSummary !== null ? (
            <dl className="mt-3 grid gap-1 font-mono text-[11px] text-builder-ink sm:grid-cols-2">
              <div>
                <dt className="inline text-builder-muted">HP version · </dt>
                <dd className="inline">{releaseSummary.housePackageVersion}</dd>
              </div>
              <div>
                <dt className="inline text-builder-muted">Embed · </dt>
                <dd className="inline">{releaseSummary.embedVersion}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-[12px] text-builder-muted">
              Aktuální House Package · otevřeno na požadavek
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-[10px] border border-builder-blue bg-white px-3 py-2 text-sm font-semibold text-builder-blue hover:bg-builder-blue hover:text-white"
          style={{ borderColor: '#18428F', color: '#18428F' }}
        >
          Zavřít
        </button>
      </header>
      <div
        ref={mountRef}
        className="min-h-0 flex-1 overflow-auto bg-[#f7f6f4]"
        data-builder-runtime-preview=""
        data-testid="builder-nahled"
      />
    </div>
  );
}
