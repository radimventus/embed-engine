import { parseCsv } from '@embed-engine/object-house/builder-package';
import type { ReactNode } from 'react';

import {
  addCsvRow,
  removeCsvRow,
  updateCsvCell,
} from './housePackageCsv';
import type {
  HousePackageEditSession,
  HousePackageEditSnapshot,
} from './housePackageEditSession';
import type { HousePackageNavId } from './HousePackageSidebar';
import {
  HOUSE_PACKAGE_DISK_ROOT,
  HOUSE_PACKAGE_URL_ROOT,
} from './housePackagePaths';
import type { HpEditSection } from './validateHousePackageWorking';

type HousePackageEditViewProps = {
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly activeNav: HousePackageNavId;
  readonly saving: boolean;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onSave: () => void;
};

/**
 * CAP-BLD-03/04 — edit HP-002 texts; Save persists via Node host.
 */
export function HousePackageEditView({
  snapshot,
  session,
  activeNav,
  saving,
  onChange,
  onSave,
}: HousePackageEditViewProps) {
  const pkg = snapshot.validation.builderImport;
  const status = sectionStatus(snapshot, navToSection(activeNav));

  return (
    <div className="space-y-6" data-testid="house-package-edit">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Content SSOT · edit &amp; save
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            House Package (HP-002)
          </h2>
          <p className="mt-1 font-mono text-[12px] text-builder-muted">
            {snapshot.packageRootLabel} → {HOUSE_PACKAGE_DISK_ROOT}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={overallStatus(snapshot)} />
          <button
            type="button"
            disabled={
              saving ||
              snapshot.dirtyState === 'clean' ||
              !snapshot.validation.ok
            }
            onClick={onSave}
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            disabled={!snapshot.canUndo || saving}
            onClick={() => onChange(session.undo())}
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium text-builder-ink disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            disabled={snapshot.dirtyState === 'clean' || saving}
            onClick={() => onChange(session.discard())}
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium text-builder-ink disabled:opacity-40"
          >
            Discard / Reset
          </button>
        </div>
      </div>

      {snapshot.saveError !== null && (
        <p className="rounded-lg bg-builder-draftBg px-4 py-3 text-sm text-builder-draft">
          {snapshot.saveError}
        </p>
      )}

      {snapshot.sectionErrors.length > 0 && (
        <ErrorList
          errors={snapshot.sectionErrors.map(
            (error) => `${error.code}: ${error.message}`,
          )}
        />
      )}

      {activeNav === 'overview' && (
        <section className="space-y-4">
          <Panel title="Session" status={overallStatus(snapshot)}>
            <Row label="Dirty state" value={snapshot.dirtyState} />
            <Row
              label="Dirty sections"
              value={
                snapshot.dirty.length === 0
                  ? '—'
                  : snapshot.dirty.join(', ')
              }
            />
            <Row label="Mounted at" value={snapshot.mountedAt} />
            <Row label="Hero" value={snapshot.working.heroRelativePath} />
            <Row
              label="Validation"
              value={snapshot.validation.ok ? 'OK' : 'Invalid'}
            />
          </Panel>
          <p className="text-sm text-builder-muted">
            Save writes changed HP-002 files atomically via Node host. Publish
            is CAP-BLD-05.
          </p>
        </section>
      )}

      {activeNav === 'rooms' && (
        <CsvEditor
          title="rooms.csv"
          status={status}
          csv={snapshot.working.roomsCsv}
          columns={['floor', 'room', 'name', 'area']}
          onCsvChange={(next) => onChange(session.setRoomsCsv(next))}
          emptyRow={{ floor: 'p1', room: 'new-room', name: 'Nová místnost', area: '0' }}
        />
      )}

      {activeNav === 'gallery' && (
        <CsvEditor
          title="gallery.csv"
          status={status}
          csv={snapshot.working.galleryCsv}
          columns={['order', 'room', 'file']}
          onCsvChange={(next) => onChange(session.setGalleryCsv(next))}
          emptyRow={{ order: '99', room: 'exterior', file: '00.webp' }}
        />
      )}

      {activeNav === 'videos' && (
        <CsvEditor
          title="videos.csv"
          status={status}
          csv={snapshot.working.videosCsv}
          columns={['order', 'room', 'provider', 'mediaId']}
          onCsvChange={(next) => onChange(session.setVideosCsv(next))}
          emptyRow={{
            order: '99',
            room: 'exterior',
            provider: 'wistia',
            mediaId: '',
          }}
        />
      )}

      {activeNav === 'plans' && (
        <Panel title="Floor plans / SVG" status={status}>
          {pkg === null ? (
            <Empty />
          ) : (
            <ul className="space-y-3 text-sm">
              {pkg.floors.floors.map((floor) => {
                const geometry = snapshot.geometryByFloor[floor.floorId];
                const geometryLabel =
                  geometry === undefined || geometry === 'missing'
                    ? 'geometry missing'
                    : geometry === 'invalid'
                      ? 'geometry invalid'
                      : `geometry ok · ${geometry.rooms.length} rooms`;
                return (
                  <li
                    key={floor.floorId}
                    className="rounded-lg border border-[#E8EEF5] bg-white px-4 py-3"
                  >
                    <p className="font-semibold text-builder-ink">
                      {floor.floorId}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-builder-muted">
                      raster: {floor.planPng}
                    </p>
                    <p className="font-mono text-[11px] text-builder-muted">
                      svg:{' '}
                      {pkg.svg.entries.find((item) => item.floorId === floor.floorId)
                        ?.path ?? floor.planSvg}
                    </p>
                    <p className="mt-1 text-[12px] text-builder-muted">
                      {geometryLabel}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-[12px] text-builder-muted">
            Plan pairs derive from floors in rooms.csv (edit Rooms to change).
          </p>
        </Panel>
      )}

      {activeNav === 'media' && (
        <Panel title="Media metadata" status={sectionStatus(snapshot, 'hero')}>
          <label className="block text-sm">
            <span className="text-builder-muted">Hero relative path</span>
            <input
              className="mt-1 w-full rounded-lg border border-[#DDE5EF] px-3 py-2 font-mono text-[12px]"
              value={snapshot.working.heroRelativePath}
              onChange={(event) =>
                onChange(session.setHeroRelativePath(event.target.value))
              }
            />
          </label>
          <Row
            label="Hero URL"
            value={`${HOUSE_PACKAGE_URL_ROOT}/${snapshot.working.heroRelativePath}`}
          />
          {pkg !== null && (
            <>
              <p className="mt-4 text-[12px] font-medium text-builder-muted">
                Gallery paths ({pkg.gallery.entries.length}) — edit in Gallery
              </p>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto font-mono text-[11px]">
                {pkg.gallery.entries.map((entry) => (
                  <li key={`${entry.order}-${entry.path}`}>{entry.path}</li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      )}

      {activeNav === 'manifest' && (
        <Panel title="manifest.json" status={sectionStatus(snapshot, 'manifest')}>
          <textarea
            className="min-h-64 w-full rounded-lg border border-[#DDE5EF] bg-[#F8FAFC] p-3 font-mono text-[11px]"
            value={snapshot.working.manifestJson ?? ''}
            onChange={(event) =>
              onChange(
                session.setManifestJson(
                  event.target.value.length === 0 ? null : event.target.value,
                ),
              )
            }
            spellCheck={false}
          />
          {pkg !== null && (
            <details className="mt-4">
              <summary className="cursor-pointer text-[12px] font-medium text-builder-muted">
                Runtime Manifest (object-house)
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[#0F172A] p-4 text-[11px] text-[#E2E8F0]">
                {JSON.stringify(pkg.manifest, null, 2)}
              </pre>
            </details>
          )}
        </Panel>
      )}
    </div>
  );
}

type UiStatus = 'clean' | 'modified' | 'invalid' | 'save-failed';

function navToSection(nav: HousePackageNavId): HpEditSection | null {
  if (nav === 'rooms') return 'rooms';
  if (nav === 'gallery') return 'gallery';
  if (nav === 'videos') return 'videos';
  if (nav === 'manifest') return 'manifest';
  if (nav === 'media') return 'hero';
  if (nav === 'plans') return 'plans';
  return null;
}

function sectionStatus(
  snapshot: HousePackageEditSnapshot,
  section: HpEditSection | null,
): UiStatus {
  if (section === null) {
    return overallStatus(snapshot);
  }
  if (snapshot.dirtyState === 'save-failed') return 'save-failed';
  const dirty = snapshot.dirty.includes(section);
  const hasSectionError = snapshot.sectionErrors.some((error) => {
    const hay = `${error.path ?? ''} ${error.message}`.toLowerCase();
    if (section === 'rooms') return hay.includes('rooms');
    if (section === 'gallery') return hay.includes('gallery');
    if (section === 'videos') return hay.includes('video');
    if (section === 'plans') return hay.includes('plan');
    if (section === 'hero') return hay.includes('hero');
    if (section === 'manifest') return false;
    return false;
  });
  if (dirty && hasSectionError) return 'invalid';
  if (dirty) return 'modified';
  return 'clean';
}

function overallStatus(snapshot: HousePackageEditSnapshot): UiStatus {
  if (snapshot.dirtyState === 'save-failed') return 'save-failed';
  if (!snapshot.validation.ok) return 'invalid';
  if (snapshot.dirtyState === 'modified') return 'modified';
  return 'clean';
}

function StatusBadge({ status }: { readonly status: UiStatus }) {
  const label =
    status === 'clean'
      ? 'Clean'
      : status === 'modified'
        ? 'Modified'
        : status === 'save-failed'
          ? 'Save failed'
          : 'Invalid';
  const className =
    status === 'clean'
      ? 'bg-builder-successBg text-builder-success'
      : status === 'modified'
        ? 'bg-builder-panel text-builder-navy'
        : 'bg-builder-draftBg text-builder-draft';
  return (
    <span className={`rounded-xl px-3 py-1.5 text-sm font-bold ${className}`}>
      {label}
    </span>
  );
}

function CsvEditor({
  title,
  status,
  csv,
  columns,
  onCsvChange,
  emptyRow,
}: {
  readonly title: string;
  readonly status: UiStatus;
  readonly csv: string;
  readonly columns: readonly string[];
  readonly onCsvChange: (next: string) => void;
  readonly emptyRow: Readonly<Record<string, string>>;
}) {
  const table = parseCsv(csv);
  return (
    <Panel title={title} status={status}>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-1.5 text-sm font-medium text-white"
          onClick={() => onCsvChange(addCsvRow(csv, emptyRow))}
        >
          Add row
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-builder-divider text-builder-muted">
              {columns.map((column) => (
                <th key={column} className="py-2 pr-3 font-medium">
                  {column}
                </th>
              ))}
              <th className="py-2 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-builder-divider/60">
                {columns.map((column) => (
                  <td key={column} className="py-1.5 pr-2">
                    <input
                      className="w-full min-w-[5rem] rounded border border-[#E8EEF5] px-2 py-1.5 font-mono text-[12px]"
                      value={row[column] ?? ''}
                      onChange={(event) =>
                        onCsvChange(
                          updateCsvCell(
                            csv,
                            rowIndex,
                            column,
                            event.target.value,
                          ),
                        )
                      }
                    />
                  </td>
                ))}
                <td className="py-1.5">
                  <button
                    type="button"
                    className="text-[12px] text-builder-draft"
                    onClick={() => onCsvChange(removeCsvRow(csv, rowIndex))}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-[12px] font-medium text-builder-muted">
          Raw CSV
        </summary>
        <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-[#F8FAFC] p-3 font-mono text-[11px]">
          {csv}
        </pre>
      </details>
    </Panel>
  );
}

function Panel({
  title,
  status,
  children,
}: {
  readonly title: string;
  readonly status?: UiStatus;
  readonly children: ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-builder-ink">{title}</h3>
        {status !== undefined && <StatusBadge status={status} />}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-builder-divider py-2 text-sm">
      <span className="text-builder-muted">{label}</span>
      <span className="font-mono text-[12px] text-builder-ink">{value}</span>
    </div>
  );
}

function Empty() {
  return (
    <p className="text-sm text-builder-muted">
      Registries unavailable — fix validation errors.
    </p>
  );
}

function ErrorList({ errors }: { readonly errors: readonly string[] }) {
  return (
    <ul className="rounded-lg border border-builder-draft/30 bg-builder-draftBg px-4 py-3 text-sm text-builder-draft">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}
