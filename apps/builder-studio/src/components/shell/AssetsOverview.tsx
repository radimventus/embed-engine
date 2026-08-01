import { useState } from 'react';
import type {
  Asset,
  AssetManagerEvent,
  AssetPackage,
  AssetType,
} from '../../model';

type AssetsOverviewProps = {
  readonly assetPackage: AssetPackage | null;
  readonly assets: readonly Asset[];
  readonly events: readonly AssetManagerEvent[];
  readonly indexCount: number;
  readonly message: string | null;
  readonly onCreateAsset: () => void;
  readonly onRenameAsset: (assetId: string) => void;
  readonly onArchiveAsset: (assetId: string) => void;
  readonly onRestoreAsset: (assetId: string) => void;
};

type AssetFilter = 'ALL' | 'ARCHIVED' | AssetType;
type AssetSort = 'name' | 'updatedAt' | 'type' | 'provider';

function formatBytes(size: number): string {
  if (size <= 0) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return iso;
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
}

const FILTERS: readonly { id: AssetFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'IMAGE', label: 'Images' },
  { id: 'VIDEO', label: 'Videos' },
  { id: 'DOCUMENT', label: 'Documents' },
  { id: 'FLOORPLAN', label: 'Floorplans' },
  { id: 'MODEL_3D', label: '3D Models' },
  { id: 'URL', label: 'URLs' },
  { id: 'ARCHIVED', label: 'Archived' },
];

function filterAndSort(
  assets: readonly Asset[],
  filter: AssetFilter,
  sortBy: AssetSort,
): readonly Asset[] {
  let filtered = [...assets];
  if (filter === 'ARCHIVED') {
    filtered = filtered.filter((asset) => asset.status === 'ARCHIVED');
  } else if (filter !== 'ALL') {
    filtered = filtered.filter(
      (asset) => asset.type === filter && asset.status === 'ACTIVE',
    );
  }
  filtered.sort((left, right) => {
    if (sortBy === 'name') return left.name.localeCompare(right.name);
    if (sortBy === 'type') return left.type.localeCompare(right.type);
    if (sortBy === 'provider') {
      return left.location.provider.localeCompare(right.location.provider);
    }
    return right.updatedAt.localeCompare(left.updatedAt);
  });
  return filtered;
}

export function AssetsOverview({
  assetPackage,
  assets,
  events,
  indexCount,
  message,
  onCreateAsset,
  onRenameAsset,
  onArchiveAsset,
  onRestoreAsset,
}: AssetsOverviewProps) {
  const [filter, setFilter] = useState<AssetFilter>('ALL');
  const [sortBy, setSortBy] = useState<AssetSort>('updatedAt');
  const visible = filterAndSort(assets, filter, sortBy);

  return (
    <div className="space-y-8" data-testid="assets-overview">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Asset Manager
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            {assetPackage?.metadata.title ?? 'Assets'}
          </h2>
          <p className="mt-1 text-[13px] text-builder-muted">
            Evidencni vrstva medii — provider-agnosticky AssetLocation.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateAsset}
          className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2.5 text-sm font-medium text-white"
        >
          Create
        </button>
      </div>

      {message !== null ? (
        <p className="rounded-[10px] border border-[#DDE5EF] px-4 py-3 text-sm text-builder-muted">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-[10px] border px-3 py-2 text-sm ${
              filter === item.id
                ? 'border-builder-blue bg-builder-creamDark text-builder-blue'
                : 'border-[#DDE5EF] bg-white text-builder-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as AssetSort)}
          className="ml-auto rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm"
          data-testid="assets-sort"
        >
          <option value="updatedAt">Updated</option>
          <option value="name">Name</option>
          <option value="type">Type</option>
          <option value="provider">Provider</option>
        </select>
        <span className="text-[13px] text-builder-muted">
          {visible.length}/{assets.length} · index {indexCount}
        </span>
      </div>

      <section aria-labelledby="assets-list" className="space-y-3">
        <h3 id="assets-list" className="sr-only">
          Assets
        </h3>
        {visible.length === 0 ? (
          <p className="text-sm text-builder-muted">Zatim zadne assety.</p>
        ) : (
          visible.map((asset) => (
            <article
              key={asset.id}
              className="flex flex-wrap items-center gap-4 rounded-[14px] border border-[#DDE5EF] bg-white p-4"
              data-testid={`asset-row-${asset.id}`}
            >
              <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-[10px] bg-builder-creamMid text-[11px] font-semibold uppercase tracking-wide text-builder-muted">
                {asset.metadata.previewHint ?? asset.type}
              </div>
              <div className="min-w-[220px] flex-1">
                <h4 className="text-sm font-semibold text-builder-ink">
                  {asset.name}
                </h4>
                <p className="mt-1 text-[13px] text-builder-muted">
                  {asset.type} · {asset.location.provider} ·{' '}
                  {formatBytes(asset.size)} · {asset.status}
                </p>
                <p className="mt-1 text-[12px] text-builder-muted">
                  Zmena {formatDate(asset.updatedAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onRenameAsset(asset.id)}
                  disabled={asset.status === 'ARCHIVED'}
                  className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm font-medium disabled:opacity-40"
                >
                  Rename
                </button>
                {asset.status === 'ARCHIVED' ? (
                  <button
                    type="button"
                    onClick={() => onRestoreAsset(asset.id)}
                    className="rounded-[10px] border border-builder-navy px-3 py-2 text-sm font-medium text-builder-navy"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onArchiveAsset(asset.id)}
                    className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm font-medium"
                  >
                    Archive
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>

      <section aria-labelledby="assets-events">
        <h3 id="assets-events" className="text-base font-semibold text-builder-ink">
          Asset Events
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-builder-muted">Zatim zadne udalosti.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.slice(0, 10).map((event) => (
              <li
                key={event.eventId}
                className="rounded-[10px] border border-[#DDE5EF] px-3 py-2.5 text-[13px]"
              >
                <span className="font-medium text-builder-ink">{event.type}</span>
                <span className="mt-0.5 block text-builder-muted">
                  {event.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
