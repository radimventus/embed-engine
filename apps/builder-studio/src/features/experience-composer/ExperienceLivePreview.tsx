import { useEffect, useRef, useState } from 'react';

import { mountHousePackageRuntimePreview } from '../house-package/mountHousePackageRuntimePreview';

type ExperienceLivePreviewProps = {
  /**
   * Snapshot identity for the next manual Náhled mount.
   * Does not auto-remount — only the Náhled button opens/refreshes preview.
   */
  readonly remountKey: string;
};

/**
 * PR-022D — On-demand Náhled (no Live Preview auto-redraw).
 */
export function ExperienceLivePreview({ remountKey }: ExperienceLivePreviewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (previewToken === null) {
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
      setError(null);
      handle = mountHousePackageRuntimePreview({ target });
    } catch (caught: unknown) {
      console.error('Náhled mount failed', caught);
      const message =
        caught instanceof Error ? caught.message : 'Náhled se nepodařilo načíst.';
      setError(message);
      target.textContent = message;
    }

    return () => {
      if (disposed) {
        return;
      }
      disposed = true;
      handle?.dispose();
    };
  }, [previewToken]);

  const openPreview = () => {
    setPreviewToken(`${remountKey}::${Date.now()}`);
  };

  return (
    <aside className="flex h-full min-h-[70vh] flex-col overflow-hidden border-l border-builder-line bg-white">
      <div className="shrink-0 border-b border-builder-lineSoft px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Náhled
        </p>
        <h2 className="mt-1 text-sm font-semibold text-builder-ink">
          Shared Runtime
        </h2>
        <p className="mt-1 text-[11px] text-builder-muted">
          Embed.mount · otevře se jen na požadavek
        </p>
        <button
          type="button"
          onClick={openPreview}
          className="mt-3 w-full rounded-[10px] border border-builder-blue bg-builder-blue px-3 py-2.5 text-sm font-semibold text-white hover:bg-builder-blueHover"
        >
          Náhled
        </button>
        {error !== null && (
          <p className="mt-2 text-[11px] text-builder-danger">{error}</p>
        )}
      </div>
      {previewToken === null ? (
        <div
          className="flex min-h-0 flex-1 items-center justify-center bg-builder-canvas px-4 text-center text-sm text-builder-muted"
          data-testid="experience-preview-idle"
        >
          Náhled není spuštěný. Klikněte na Náhled.
        </div>
      ) : (
        <div
          ref={mountRef}
          className="min-h-0 flex-1 overflow-hidden bg-builder-canvas"
          data-testid="experience-live-preview"
        />
      )}
    </aside>
  );
}
