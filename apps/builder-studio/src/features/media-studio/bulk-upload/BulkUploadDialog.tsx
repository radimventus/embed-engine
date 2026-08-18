/**
 * BU-001 / BU-001A / BU-002 — Unified bulk upload dialog (Nový projekt grammar).
 *
 * BU-002: drop / ＋ Přidat feed `initialFiles` into this shell — no dialog redesign.
 * BU-003: rename / preview / delete / versioning on completed rows & staging.
 */

import { useEffect, useRef, useState } from 'react';

import {
  PlatformDialog,
  PlatformField,
} from '@embed-engine/platform-shell';

import {
  BULK_UPLOAD_KINDS,
  isAllowedBulkExtension,
  type BulkUploadKind,
} from './bulkUploadKinds';
import { requestBulkMediaUpload } from './requestBulkMediaUpload';

/** Reveal progress only when upload is still running after this delay. */
export const BULK_UPLOAD_PROGRESS_REVEAL_MS = 300;

export type BulkUploadCompletedFile = {
  readonly fileName: string;
  readonly relativePath: string;
  readonly mediaUrl?: string;
};

type BulkUploadDialogProps = {
  readonly open: boolean;
  /** Active House Package scope required by the authenticated Platform API. */
  readonly houseId: string;
  readonly kind: BulkUploadKind;
  readonly onClose: () => void;
  readonly onCompleted: (files: readonly BulkUploadCompletedFile[]) => void;
  /** Prefill from drop or ＋ Přidat file picker. */
  readonly initialFiles?: readonly File[];
  /** When true with initialFiles, start upload immediately (drop path). */
  readonly autoStart?: boolean;
};

type Phase = 'pick' | 'uploading' | 'done';

export function BulkUploadDialog({
  open,
  houseId,
  kind,
  onClose,
  onCompleted,
  initialFiles,
  autoStart = false,
}: BulkUploadDialogProps) {
  const config = BULK_UPLOAD_KINDS[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoStartedRef = useRef(false);
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('pick');
  const [showProgress, setShowProgress] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<BulkUploadCompletedFile[]>([]);

  const clearProgressTimer = () => {
    if (progressTimerRef.current !== null) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!open) {
      autoStartedRef.current = false;
      return;
    }
    clearProgressTimer();
    const seeded =
      initialFiles !== undefined && initialFiles.length > 0
        ? Array.from(initialFiles).filter((file) =>
            isAllowedBulkExtension(kind, file.name),
          )
        : [];
    setFiles(seeded);
    setPhase('pick');
    setShowProgress(false);
    setDoneCount(0);
    setTotalCount(0);
    setError(
      initialFiles !== undefined &&
        initialFiles.length > 0 &&
        seeded.length === 0
        ? 'Žádný soubor nemá podporovaný formát.'
        : null,
    );
    setCompleted([]);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }, [open, kind, initialFiles]);

  useEffect(() => () => clearProgressTimer(), []);

  const remaining = Math.max(totalCount - doneCount, 0);
  const busy = phase === 'uploading';

  const runUpload = async (sourceFiles: readonly File[]) => {
    if (sourceFiles.length === 0 || busy) return;
    const accepted = sourceFiles.filter((file) =>
      isAllowedBulkExtension(kind, file.name),
    );
    if (accepted.length === 0) {
      setError('Žádný soubor nemá podporovaný formát.');
      setPhase('pick');
      return;
    }
    setError(null);
    setPhase('uploading');
    setShowProgress(false);
    setTotalCount(accepted.length);
    setDoneCount(0);
    clearProgressTimer();
    progressTimerRef.current = setTimeout(() => {
      setShowProgress(true);
    }, BULK_UPLOAD_PROGRESS_REVEAL_MS);

    const uploaded: BulkUploadCompletedFile[] = [];
    for (let index = 0; index < accepted.length; index += 1) {
      const result = await requestBulkMediaUpload({
        houseId,
        kind,
        file: accepted[index],
      });
      if (!result.ok || result.relativePath.length === 0) {
        clearProgressTimer();
        setShowProgress(false);
        setError(result.error ?? `Upload selhal: ${accepted[index].name}`);
        setPhase('pick');
        return;
      }
      uploaded.push({
        fileName: result.fileName,
        relativePath: result.relativePath,
        mediaUrl: result.mediaUrl,
      });
      setDoneCount(index + 1);
    }

    clearProgressTimer();
    setShowProgress(false);
    setCompleted(uploaded);
    setPhase('done');
    onCompleted(uploaded);
  };

  useEffect(() => {
    if (!open || !autoStart || autoStartedRef.current) return;
    if (files.length === 0) return;
    autoStartedRef.current = true;
    void runUpload(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once when seeded
  }, [open, autoStart, files]);

  return (
    <PlatformDialog
      open={open}
      title={phase === 'done' ? 'Nahráno' : config.title}
      description={
        phase === 'done'
          ? `Hotovo · ${completed.length} souborů.`
          : config.description
      }
      primaryLabel={
        phase === 'done'
          ? 'Hotovo – Zavřít'
          : phase === 'uploading'
            ? 'Nahrávám…'
            : 'Nahrát'
      }
      secondaryLabel="Zrušit"
      hideSecondary={phase === 'done'}
      busy={busy}
      primaryDisabled={phase === 'pick' && files.length === 0}
      asForm={phase === 'pick'}
      onClose={() => {
        if (!busy) onClose();
      }}
      onPrimary={() => {
        if (phase === 'done') {
          onClose();
          return;
        }
        void runUpload(files);
      }}
      onSecondary={() => {
        if (!busy) onClose();
      }}
    >
      {phase === 'pick' && (
        <>
          <PlatformField
            label="Soubory"
            helper={`Povolené: ${config.extensions.join(', ')}`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={config.accept}
              onChange={(event) => {
                const list = event.target.files;
                setFiles(list !== null ? Array.from(list) : []);
              }}
            />
          </PlatformField>
          {files.length > 0 && (
            <p className="platform-type-helper">
              Vybráno: {files.length}{' '}
              {files.length === 1 ? 'soubor' : 'souborů'}
            </p>
          )}
          {error !== null && (
            <p role="alert" className="text-sm text-[var(--platform-red)]">
              {error}
            </p>
          )}
        </>
      )}

      {phase === 'uploading' && showProgress && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--platform-navy)]">
            Nahráno {doneCount} z {totalCount}
          </p>
          <p className="text-sm text-[var(--platform-navy)]">
            Zbývá: {remaining}
          </p>
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: 'var(--platform-line)' }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-valuenow={doneCount}
          >
            <div
              className="h-full rounded-full"
              style={{
                width:
                  totalCount === 0
                    ? '0%'
                    : `${Math.round((doneCount / totalCount) * 100)}%`,
                background: 'var(--platform-blue)',
              }}
            />
          </div>
        </div>
      )}

      {phase === 'done' && (
        <ul className="space-y-1">
          {completed.map((file) => (
            <li
              key={file.relativePath}
              className="text-sm text-[var(--platform-navy)]"
            >
              {file.fileName}
            </li>
          ))}
        </ul>
      )}
    </PlatformDialog>
  );
}
