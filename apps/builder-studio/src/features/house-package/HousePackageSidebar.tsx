import type { HousePackageEditSnapshot } from './housePackageEditSession';
import type { HpEditSection } from './validateHousePackageWorking';

export type HousePackageNavId =
  | 'overview'
  | 'experience'
  | 'knowledge'
  | 'media-studio'
  | 'preview-center'
  | 'rooms'
  | 'gallery'
  | 'videos'
  | 'plans'
  | 'manifest'
  | 'media';

const NAV: readonly {
  id: HousePackageNavId;
  label: string;
  section: HpEditSection | null;
}[] = [
  { id: 'overview', label: 'Dashboard', section: null },
  { id: 'experience', label: 'Experience', section: null },
  { id: 'knowledge', label: 'Knowledge', section: null },
  { id: 'media-studio', label: 'Media', section: null },
  { id: 'preview-center', label: 'Preview', section: null },
  { id: 'rooms', label: 'Rooms', section: 'rooms' },
  { id: 'gallery', label: 'Gallery', section: 'gallery' },
  { id: 'videos', label: 'Videos', section: 'videos' },
  { id: 'plans', label: 'Plans', section: 'plans' },
  { id: 'media', label: 'Media (HP)', section: 'hero' },
  { id: 'manifest', label: 'Manifest', section: 'manifest' },
];

type HousePackageSidebarProps = {
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly activeNav: HousePackageNavId;
  readonly onSelectNav: (id: HousePackageNavId) => void;
  readonly projectName?: string | null;
};

/**
 * EPIC-BX-01 — project content navigation (House Package is internal).
 */
export function HousePackageSidebar({
  snapshot,
  activeNav,
  onSelectNav,
  projectName = null,
}: HousePackageSidebarProps) {
  const pkg = snapshot?.validation.builderImport;
  const rooms = pkg?.rooms.rooms.length ?? 0;
  const gallery = pkg?.gallery.entries.length ?? 0;
  const videos = pkg?.videos.entries.length ?? 0;
  const floors = pkg?.floors.floors.length ?? 0;

  return (
    <aside className="h-full overflow-y-auto border-r border-builder-line bg-white p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Projekt
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">
        {projectName ?? 'Obsah'}
      </h2>
      <p className="mt-2 text-[12px] text-builder-muted">
        Obsah projektu
      </p>
      {snapshot !== null && (
        <p
          className={`mt-2 text-[12px] font-semibold ${
            !snapshot.validation.ok || snapshot.dirtyState === 'save-failed'
              ? 'text-builder-draft'
              : snapshot.dirtyState === 'modified'
                ? 'text-builder-navy'
                : 'text-builder-success'
          }`}
        >
          {snapshot.validation.ok
            ? snapshot.dirtyState === 'save-failed'
              ? 'Uložení selhalo'
              : snapshot.dirtyState === 'modified'
                ? 'Neuložené změny'
                : 'Uloženo'
            : 'Neplatný obsah'}
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
        <Stat label="Rooms" value={String(rooms)} />
        <Stat label="Gallery" value={String(gallery)} />
        <Stat label="Videos" value={String(videos)} />
        <Stat label="Plans" value={String(floors)} />
      </dl>

      <nav className="mt-8 flex flex-col gap-1.5" aria-label="Sekce projektu">
        {NAV.map((item) => {
          const active = item.id === activeNav;
          const dirty =
            item.section !== null &&
            snapshot?.dirty.includes(item.section) === true;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNav(item.id)}
              className={`flex items-center justify-between rounded-[10px] border px-3.5 py-2.5 text-left text-sm font-medium ${
                active
                  ? 'border-builder-navy bg-builder-navy text-white'
                  : 'border-[#DDE5EF] bg-white text-builder-ink'
              }`}
            >
              <span>{item.label}</span>
              {dirty && (
                <span
                  className={`text-[10px] uppercase tracking-wide ${
                    active ? 'text-white/80' : 'text-builder-navy'
                  }`}
                >
                  změna
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function Stat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="rounded-lg border border-[#E8EEF5] bg-builder-canvas px-2.5 py-2">
      <dt className="text-[11px] text-builder-muted">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold text-builder-ink">{value}</dd>
    </div>
  );
}
