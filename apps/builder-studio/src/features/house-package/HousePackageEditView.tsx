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
import { HOUSE_PACKAGE_URL_ROOT } from './housePackagePaths';
import type { HpEditSection } from './validateHousePackageWorking';
import type { HousePackageValidationReport } from './housePackageValidationReport';
import type { HousePackageReleaseSummary } from './productionPublishGate';
import type { WorkspaceProject } from '../workspace/workspaceRegistry';
import {
  buildProjectDashboardModel,
  ProjectDashboard,
} from '../project-dashboard';

type HousePackageEditViewProps = {
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly activeNav: HousePackageNavId;
  readonly saving: boolean;
  readonly companyName: string;
  readonly project: WorkspaceProject;
  readonly validationReport: HousePackageValidationReport | null;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly historyOpen?: boolean;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onSave: () => void;
  readonly onEditProject: () => void;
  readonly onNavigate: (nav: HousePackageNavId) => void;
  readonly onPublish: () => void;
};

/**
 * EPIC-BX-01/02 — Dashboard home + section editors (never an empty canvas).
 */
export function HousePackageEditView({
  snapshot,
  session,
  activeNav,
  saving,
  companyName,
  project,
  validationReport,
  releaseSummary,
  historyOpen = false,
  onChange,
  onSave,
  onEditProject,
  onNavigate,
  onPublish,
}: HousePackageEditViewProps) {
  const pkg = snapshot.validation.builderImport;
  const status = sectionStatus(snapshot, navToSection(activeNav));

  if (activeNav === 'overview') {
    return (
      <ProjectDashboard
        model={buildProjectDashboardModel({
          project,
          companyName,
          snapshot,
          validationReport,
          releaseSummary,
        })}
        onNavigate={onNavigate}
        onEditProject={onEditProject}
        onPublish={onPublish}
        historyOpen={historyOpen}
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="house-package-edit">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-builder-muted"
          >
            <span className="font-medium text-builder-ink">{companyName}</span>
            <span aria-hidden>/</span>
            <span className="font-semibold text-builder-ink">{project.name}</span>
          </nav>
          <p className="mt-2 text-sm text-builder-muted">
            {sectionHeadline(activeNav)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium text-builder-ink"
          >
            Dashboard
          </button>
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
            {saving ? 'Ukládám…' : 'Uložit'}
          </button>
          <button
            type="button"
            disabled={!snapshot.canUndo || saving}
            onClick={() => onChange(session.undo())}
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium text-builder-ink disabled:opacity-40"
          >
            Zpět
          </button>
          <button
            type="button"
            disabled={snapshot.dirtyState === 'clean' || saving}
            onClick={() => onChange(session.discard())}
            className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium text-builder-ink disabled:opacity-40"
          >
            Zahodit
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


      {activeNav === 'rooms' && (
        <CsvEditor
          title="Místnosti"
          status={status}
          csv={snapshot.working.roomsCsv}
          columns={['floor', 'room', 'name', 'area']}
          onCsvChange={(next) => onChange(session.setRoomsCsv(next))}
          emptyRow={{
            floor: 'p1',
            room: 'new-room',
            name: 'Nová místnost',
            area: '0',
          }}
        />
      )}

      {activeNav === 'gallery' && (
        <section className="space-y-4">
          {pkg !== null && pkg.gallery.entries.length > 0 && (
            <Panel title="Miniatury">
              <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
                {pkg.gallery.entries.map((entry) => (
                  <figure
                    key={`${entry.order}-${entry.path}`}
                    className="overflow-hidden rounded-[12px] border border-[#E8EEF5] bg-white"
                  >
                    <img
                      src={`${HOUSE_PACKAGE_URL_ROOT}/${entry.path}`}
                      alt=""
                      className="aspect-[4/3] w-full object-cover bg-builder-soft"
                    />
                    <figcaption className="px-2.5 py-2 text-[11px] text-builder-muted">
                      {entry.roomId} · {entry.order}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Panel>
          )}
          <CsvEditor
            title="Galerie — tabulka"
            status={status}
            csv={snapshot.working.galleryCsv}
            columns={['order', 'room', 'file']}
            onCsvChange={(next) => onChange(session.setGalleryCsv(next))}
            emptyRow={{ order: '99', room: 'exterior', file: '00.webp' }}
          />
        </section>
      )}

      {activeNav === 'videos' && (
        <CsvEditor
          title="Videa"
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
        <Panel title="Půdorysy" status={status}>
          {pkg === null ? (
            <Empty />
          ) : (
            <ul className="space-y-4">
              {pkg.floors.floors.map((floor) => {
                const svgPath =
                  pkg.svg.entries.find((item) => item.floorId === floor.floorId)
                    ?.path ?? floor.planSvg;
                const geometry = snapshot.geometryByFloor[floor.floorId];
                const geometryLabel =
                  geometry === undefined || geometry === 'missing'
                    ? 'Geometrie chybí'
                    : geometry === 'invalid'
                      ? 'Geometrie neplatná'
                      : `Geometrie OK · ${geometry.rooms.length} místností`;
                return (
                  <li
                    key={floor.floorId}
                    className="overflow-hidden rounded-[14px] border border-[#E8EEF5] bg-white"
                  >
                    <div className="grid gap-0 tablet:grid-cols-[220px_1fr]">
                      <div className="flex items-center justify-center bg-builder-soft p-4">
                        <img
                          src={`${HOUSE_PACKAGE_URL_ROOT}/${svgPath}`}
                          alt={`Půdorys ${floor.floorId}`}
                          className="max-h-48 w-full object-contain"
                        />
                      </div>
                      <div className="px-4 py-3">
                        <p className="font-semibold text-builder-ink">
                          {floor.floorId}
                        </p>
                        <p className="mt-1 text-[12px] text-builder-muted">
                          {geometryLabel}
                        </p>
                        <p className="mt-2 font-mono text-[11px] text-builder-muted">
                          {svgPath}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-[12px] text-builder-muted">
            Podlaží vycházejí z tabulky místností (sekce Rooms).
          </p>
        </Panel>
      )}

      {activeNav === 'media' && (
        <Panel title="Média" status={sectionStatus(snapshot, 'hero')}>
          <label className="block text-sm">
            <span className="text-builder-muted">Hero (relativní cesta)</span>
            <input
              className="mt-1 w-full rounded-lg border border-[#DDE5EF] px-3 py-2 font-mono text-[12px]"
              value={snapshot.working.heroRelativePath}
              onChange={(event) =>
                onChange(session.setHeroRelativePath(event.target.value))
              }
            />
          </label>
          {snapshot.working.heroRelativePath.length > 0 && (
            <img
              src={`${HOUSE_PACKAGE_URL_ROOT}/${snapshot.working.heroRelativePath}`}
              alt="Hero"
              className="mt-4 max-h-56 w-full rounded-[12px] object-cover bg-builder-soft"
            />
          )}
          {pkg !== null && (
            <>
              <p className="mt-4 text-[12px] font-medium text-builder-muted">
                Soubory galerie ({pkg.gallery.entries.length})
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 tablet:grid-cols-6">
                {pkg.gallery.entries.map((entry) => (
                  <img
                    key={`${entry.order}-${entry.path}`}
                    src={`${HOUSE_PACKAGE_URL_ROOT}/${entry.path}`}
                    alt=""
                    className="aspect-square w-full rounded-lg object-cover bg-builder-soft"
                  />
                ))}
              </div>
            </>
          )}
        </Panel>
      )}

      {activeNav === 'manifest' && (
        <Panel title="Manifest" status={sectionStatus(snapshot, 'manifest')}>
          <textarea
            className="min-h-80 w-full rounded-lg border border-[#DDE5EF] bg-[#F8FAFC] p-3 font-mono text-[11px]"
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
        </Panel>
      )}
    </div>
  );
}

type UiStatus = 'clean' | 'modified' | 'invalid' | 'save-failed';

function sectionHeadline(nav: HousePackageNavId): string {
  switch (nav) {
    case 'overview':
      return 'Přehled projektu a stavu obsahu';
    case 'experience':
      return 'Decision Experience Composer';
    case 'knowledge':
      return 'Knowledge Composer';
    case 'media-studio':
      return 'Media Studio';
    case 'preview-center':
      return 'Preview Center';
    case 'release-center':
      return 'Release Center';
    case 'collaboration':
      return 'Collaboration Center';
    case 'rooms':
      return 'Tabulka místností';
    case 'gallery':
      return 'Galerie — miniatury a tabulka';
    case 'videos':
      return 'Videa projektu';
    case 'plans':
      return 'Půdorysy a SVG';
    case 'media':
      return 'Hero a mediální soubory';
    case 'manifest':
      return 'Editor manifestu';
  }
}

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
      ? 'Uloženo'
      : status === 'modified'
        ? 'Změny'
        : status === 'save-failed'
          ? 'Chyba'
          : 'Neplatné';
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
          Přidat řádek
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
            {table.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="py-6 text-center text-builder-muted"
                >
                  Žádné řádky — přidejte první záznam.
                </td>
              </tr>
            ) : (
              table.rows.map((row, rowIndex) => (
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
                      Odstranit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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

function Empty() {
  return (
    <p className="text-sm text-builder-muted">
      Půdorysy nejsou dostupné — opravte chyby v místnostech.
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
