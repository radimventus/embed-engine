import type { AssetCollection } from '../../model';
import { AssetFileList } from './AssetFileList';
import { AssetStateBadge } from './AssetStateBadge';
import { UiStatePanel } from './UiStatePanel';

type AssetCardProps = {
  readonly collection: AssetCollection;
  readonly onUploadPlaceholder: () => void;
  readonly onRemove: (assetId: string) => void;
  readonly onUpdateMetadata: (
    assetId: string,
    patch: { readonly label: string },
  ) => void;
};

/**
 * Unified Asset Card (EPIC-BLD-02).
 * Presentation only — mutations via callbacks into application services.
 */
export function AssetCard({
  collection,
  onUploadPlaceholder,
  onRemove,
  onUpdateMetadata,
}: AssetCardProps) {
  const fileCount = collection.files.length;

  return (
    <article className="mb-6 rounded-2xl border border-builder-sectionBorder bg-builder-section p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h4 className="text-base font-semibold">{collection.title}</h4>
            <AssetStateBadge state={collection.state} />
          </div>
          <p className="mt-1 text-sm text-builder-muted">
            {collection.description}
          </p>
        </div>
        <span className="shrink-0 text-[13px] text-builder-muted">
          {fileCount} {fileCount === 1 ? 'soubor' : 'souborů'}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onUploadPlaceholder}
          className="inline-flex items-center gap-2 rounded-[10px] border border-builder-panelBorder bg-builder-panel px-5 py-3 text-sm font-semibold text-builder-navy transition hover:border-builder-blue hover:bg-builder-creamMid"
        >
          Nahrát {collection.title}
        </button>
      </div>

      <div
        className="mb-4 rounded-[12px] border border-dashed border-builder-panelBorder bg-white/70 px-4 py-5 text-center text-sm text-builder-muted"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onUploadPlaceholder();
        }}
      >
        Drag & drop · přijímá `{collection.acceptHint}`
      </div>

      <UiStatePanel state={collection.state}>
        {collection.files.length > 0 ? (
          <AssetFileList
            files={collection.files}
            onRemove={onRemove}
            onUpdateMetadata={onUpdateMetadata}
          />
        ) : null}
      </UiStatePanel>
    </article>
  );
}
