/**
 * BU-002 — Section drop zone for Galerie / SVG / Dokumenty.
 */

import { useRef, useState, type DragEvent, type ReactNode } from 'react';

import type { BulkUploadKind } from './bulkUploadKinds';
import {
  dataTransferHasFiles,
  filesFromDataTransfer,
} from './fileDragUtils';

type AssetDropZoneProps = {
  readonly kind: BulkUploadKind;
  readonly children: ReactNode;
  readonly onDropFiles: (files: File[]) => void;
  readonly className?: string;
};

export function AssetDropZone({
  kind,
  children,
  onDropFiles,
  className = '',
}: AssetDropZoneProps) {
  const [active, setActive] = useState(false);
  const depthRef = useRef(0);

  const onDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!dataTransferHasFiles(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    depthRef.current += 1;
    setActive(true);
  };

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    if (!dataTransferHasFiles(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setActive(true);
  };

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!dataTransferHasFiles(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    depthRef.current = Math.max(0, depthRef.current - 1);
    if (depthRef.current === 0) {
      setActive(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    if (!dataTransferHasFiles(event.dataTransfer)) return;
    event.preventDefault();
    event.stopPropagation();
    depthRef.current = 0;
    setActive(false);
    const files = filesFromDataTransfer(event.dataTransfer, kind);
    if (files.length > 0) {
      onDropFiles(files);
    }
  };

  return (
    <section
      className={`relative rounded-[16px] border bg-white p-5 shadow-sm transition-[border-color,background-color,box-shadow] ${
        active
          ? 'border-[var(--platform-blue)] bg-[var(--platform-blue-bg)] shadow-[0_0_0_3px_rgba(24,66,143,0.12)]'
          : 'border-[#E3E3E3]'
      } ${className}`.trim()}
      data-drop-active={active ? 'true' : 'false'}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      {active && (
        <div
          className="pointer-events-none absolute inset-3 z-10 flex items-center justify-center rounded-[14px] border-2 border-dashed"
          style={{
            borderColor: 'var(--platform-blue)',
            background: 'rgba(24, 66, 143, 0.08)',
          }}
        >
          <p
            className="rounded-[10px] px-4 py-2 text-sm font-semibold"
            style={{
              color: 'var(--platform-navy)',
              background: 'rgba(255, 255, 255, 0.92)',
            }}
          >
            Pusťte soubory pro nahrání
          </p>
        </div>
      )}
    </section>
  );
}
