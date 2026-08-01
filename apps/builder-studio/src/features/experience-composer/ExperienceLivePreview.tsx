import { useEffect, useRef } from 'react';

import { mountHousePackageRuntimePreview } from '../house-package/mountHousePackageRuntimePreview';

type ExperienceLivePreviewProps = {
  /** Remount Shared Runtime when composition or HP content revision changes. */
  readonly remountKey: string;
};

/**
 * EPIC-BX-03 — Live Runtime Preview via Embed.mount (Shared Runtime, no stub).
 */
export function ExperienceLivePreview({ remountKey }: ExperienceLivePreviewProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
      console.error('Experience Live Preview mount failed', error);
      target.textContent =
        error instanceof Error
          ? error.message
          : 'Preview se nepodařilo načíst.';
    }

    return () => {
      if (disposed) {
        return;
      }
      disposed = true;
      handle?.dispose();
    };
  }, [remountKey]);

  return (
    <aside className="flex h-full min-h-[70vh] flex-col overflow-hidden border-l border-builder-line bg-white">
      <div className="shrink-0 border-b border-builder-lineSoft px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Live Preview
        </p>
        <h2 className="mt-1 text-sm font-semibold text-builder-ink">
          Shared Runtime
        </h2>
        <p className="mt-1 text-[11px] text-builder-muted">
          Embed.mount · Decision Experience nad aktuálním projektem
        </p>
      </div>
      <div
        ref={mountRef}
        className="min-h-0 flex-1 overflow-hidden bg-builder-canvas"
        data-testid="experience-live-preview"
      />
    </aside>
  );
}
