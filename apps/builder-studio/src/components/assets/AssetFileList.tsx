import type { AssetFile } from '../../model';

type AssetFileListProps = {
  readonly files: readonly AssetFile[];
  readonly onRemove: (assetId: string) => void;
  readonly onUpdateMetadata: (
    assetId: string,
    patch: { readonly label: string },
  ) => void;
};

function formatBytes(sizeBytes: number): string {
  if (sizeBytes <= 0) {
    return 'odkaz';
  }
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function AssetFileList({
  files,
  onRemove,
  onUpdateMetadata,
}: AssetFileListProps) {
  return (
    <ul className="mt-4 space-y-3">
      {files.map((file) => (
        <li
          key={file.assetId}
          className="rounded-[10px] border border-[#E1E8F2] bg-white p-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[#F0F4FA] text-lg">
              ▭
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-builder-ink">
                {file.name}
              </div>
              <div className="mt-1 text-xs text-builder-muted">
                {formatBytes(file.sizeBytes)} · {formatDate(file.uploadedAt)}
              </div>
              <label className="mt-2 block text-xs text-builder-muted">
                Metadata label
                <input
                  className="mt-1 w-full rounded-[8px] border border-[#DCE5F0] px-3 py-2 text-sm text-builder-ink"
                  value={file.metadata.label}
                  onChange={(event) =>
                    onUpdateMetadata(file.assetId, {
                      label: event.target.value,
                    })
                  }
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => onRemove(file.assetId)}
              className="platform-icon-btn--danger"
              aria-label="Odstranit"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
