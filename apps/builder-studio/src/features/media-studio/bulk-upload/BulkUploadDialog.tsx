/**
 * BU-001 — Unified bulk upload dialog (same grammar as Nový projekt / Nový objekt).
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

export type BulkUploadCompletedFile = {
  readonly fileName: string;
  readonly relativePath: string;
};

type BulkUploadDialogProps = {
  readonly open: boolean;
  readonly kind: BulkUploadKind;
  readonly onClose: () => void;
  readonly onCompleted: (files: readonly BulkUploadCompletedFile[]) => void;
};

type Phase = 'pick' | 'uploading' | 'done';

export function BulkUploadDialog({
  open,
  kind,
  onClose,
  onCompleted,
}: BulkUploadDialogProps) {
  const config = BULK_UPLOAD_KINDS[kind];
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>('pick');
  const [doneCount, setDoneCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<BulkUploadCompletedFile[]>([]);

  useEffect(() => {
    if (!open) return;
    setFiles([]);
    setPhase('pick');
    setDoneCount(0);
    setTotalCount(0);
    setError(null);
    setCompleted([]);
    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }, [open, kind]);

  const remaining = Math.max(totalCount - doneCount, 0);
  const busy = phase === 'uploading';

  const runUpload = async () => {
    if (files.length === 0 || busy) return;
    const accepted = files.filter((file) =>
      isAllowedBulkExtension(kind, file.name),
    );
    if (accepted.length === 0) {
      setError('Žádný soubor nemá podporovaný formát.');
      return;
    }
    setError(null);
    setPhase('uploading');
    setTotalCount(accepted.length);
    setDoneCount(0);
    const uploaded: BulkUploadCompletedFile[] = [];
    for (let index = 0; index < accepted.length; index += 1) {
      const result = await requestBulkMediaUpload({
        kind,
        file: accepted[index],
      });
      if (!result.ok || result.relativePath.length === 0) {
        setError(result.error ?? `Upload selhal: ${accepted[index].name}`);
        setPhase('pick');
        return;
      }
      uploaded.push({
        fileName: result.fileName,
        relativePath: result.relativePath,
      });
      setDoneCount(index + 1);
    }
    setCompleted(uploaded);
    setPhase('done');
    onCompleted(uploaded);
  };

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
          ? 'Hotovo'
          : phase === 'uploading'
            ? 'Nahrávám…'
            : 'Nahrát'
      }
      secondaryLabel={phase === 'done' ? 'Zavřít' : 'Zrušit'}
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
        void runUpload();
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

      {phase === 'uploading' && (
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
