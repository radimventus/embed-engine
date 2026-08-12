import { useEffect, useRef } from 'react';

import { mountHousePackageRuntimePreview } from '../house-package/mountHousePackageRuntimePreview';
import type { PreviewDevice } from './previewDevices';
import type { PreviewPersona } from './previewPersonas';
import { writePreviewPersonaScenario } from './previewScenario';

type PreviewLiveRuntimeProps = {
  readonly objectId: string;
  readonly remountKey: string;
  readonly persona: PreviewPersona;
  readonly device: PreviewDevice;
  readonly compact?: boolean;
};

/**
 * EPIC-BX-06 — Live Shared Runtime (Embed.mount) inside a device viewport frame.
 */
export function PreviewLiveRuntime({
  objectId,
  remountKey,
  persona,
  device,
  compact = false,
}: PreviewLiveRuntimeProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = mountRef.current;
    if (target === null) {
      return;
    }

    writePreviewPersonaScenario(persona.id);

    let disposed = false;
    let handle: ReturnType<typeof mountHousePackageRuntimePreview> | null =
      null;
    try {
      target.replaceChildren();
      handle = mountHousePackageRuntimePreview({ target, objectId });
    } catch (error: unknown) {
      console.error('Preview Center Runtime mount failed', error);
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
  }, [objectId, remountKey, persona.id]);

  const frameHeight = compact ? Math.min(device.height, 640) : device.height;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-full items-center justify-between px-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Live Runtime
        </p>
        <p className="text-[11px] text-builder-muted">
          {persona.label} · {device.label} · Embed.mount
        </p>
      </div>
      <div
        className="overflow-hidden rounded-[16px] border border-[#DDE5EF] bg-white shadow-sm"
        style={{
          width: `min(100%, ${device.width}px)`,
          height: frameHeight,
        }}
      >
        <div
          ref={mountRef}
          className="h-full w-full overflow-auto bg-builder-canvas"
          data-testid="preview-live-runtime"
          data-preview-persona={persona.id}
          data-preview-device={device.id}
        />
      </div>
    </div>
  );
}
