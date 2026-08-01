/**
 * BU-002 — Cursor-following ghost while dragging files over Builder media sections.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  countFileDragItems,
  dataTransferHasFiles,
  firstImagePreviewUrl,
} from './fileDragUtils';

type GhostState = {
  readonly x: number;
  readonly y: number;
  readonly count: number;
  readonly previewUrl: string | null;
};

/**
 * Shows a semi-transparent thumbnail (+N) under the cursor during OS file drags.
 */
export function FileDragGhost() {
  const [ghost, setGhost] = useState<GhostState | null>(null);

  useEffect(() => {
    let previewUrl: string | null = null;
    let active = false;

    const revoke = () => {
      if (previewUrl !== null) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
    };

    const hide = () => {
      active = false;
      revoke();
      setGhost(null);
    };

    const onDragEnter = (event: DragEvent) => {
      if (!dataTransferHasFiles(event.dataTransfer)) return;
      active = true;
      const count = Math.max(1, countFileDragItems(event.dataTransfer));
      revoke();
      previewUrl = firstImagePreviewUrl(event.dataTransfer);
      setGhost({
        x: event.clientX,
        y: event.clientY,
        count,
        previewUrl,
      });
    };

    const onDragOver = (event: DragEvent) => {
      if (!active || !dataTransferHasFiles(event.dataTransfer)) return;
      event.preventDefault();
      const count = Math.max(1, countFileDragItems(event.dataTransfer));
      setGhost((current) => ({
        x: event.clientX,
        y: event.clientY,
        count,
        previewUrl: current?.previewUrl ?? previewUrl,
      }));
    };

    const onDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) {
        hide();
      }
    };

    const onDrop = () => hide();
    const onDragEnd = () => hide();

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    window.addEventListener('dragend', onDragEnd);

    return () => {
      hide();
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('dragend', onDragEnd);
    };
  }, []);

  if (ghost === null || typeof document === 'undefined') {
    return null;
  }

  const extra = ghost.count > 1 ? ghost.count - 1 : 0;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[10000]"
      style={{
        left: ghost.x + 12,
        top: ghost.y + 12,
      }}
      aria-hidden
    >
      <div
        className="relative h-16 w-16 overflow-hidden rounded-[12px] border-2 border-white shadow-lg"
        style={{
          opacity: 0.72,
          background: 'var(--platform-cream-light, #f7f6f4)',
        }}
      >
        {ghost.previewUrl !== null ? (
          <img
            src={ghost.previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs font-bold"
            style={{ color: 'var(--platform-navy, #001930)' }}
          >
            FILE
          </div>
        )}
        {extra > 0 && (
          <span
            className="absolute -right-2 -top-2 rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white"
            style={{ background: 'var(--platform-blue, #18428f)' }}
          >
            +{extra}
          </span>
        )}
      </div>
    </div>,
    document.body,
  );
}
