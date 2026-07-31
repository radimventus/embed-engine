import type { HousePackageMount } from './mountHousePackage';
import { HOUSE_PACKAGE_DISK_ROOT } from './housePackagePaths';

export type HousePackageNavId =
  | 'overview'
  | 'rooms'
  | 'gallery'
  | 'videos'
  | 'plans'
  | 'manifest'
  | 'media';

const NAV: readonly { id: HousePackageNavId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'videos', label: 'Videos' },
  { id: 'plans', label: 'Plans / SVG' },
  { id: 'media', label: 'Media' },
  { id: 'manifest', label: 'Manifest' },
];

type HousePackageSidebarProps = {
  readonly mount: HousePackageMount | null;
  readonly activeNav: HousePackageNavId;
  readonly onSelectNav: (id: HousePackageNavId) => void;
};

/**
 * CAP-BLD-02 — sidebar bound to mounted HP-002 (no mock projects).
 */
export function HousePackageSidebar({
  mount,
  activeNav,
  onSelectNav,
}: HousePackageSidebarProps) {
  const rooms = mount?.builderImport?.rooms.rooms.length ?? 0;
  const gallery = mount?.builderImport?.gallery.entries.length ?? 0;
  const videos = mount?.builderImport?.videos.entries.length ?? 0;
  const floors = mount?.builderImport?.floors.floors.length ?? 0;

  return (
    <aside className="h-full overflow-y-auto border-r border-builder-line bg-white p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        House Package
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">HP-002</h2>
      <p className="mt-2 break-all font-mono text-[11px] text-builder-muted">
        {HOUSE_PACKAGE_DISK_ROOT}
      </p>
      <p className="mt-1 text-[12px] text-builder-muted">
        Read-only mount · ADR-023
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
        <Stat label="Rooms" value={String(rooms)} />
        <Stat label="Gallery" value={String(gallery)} />
        <Stat label="Videos" value={String(videos)} />
        <Stat label="Floors" value={String(floors)} />
      </dl>

      <nav className="mt-8 flex flex-col gap-1.5" aria-label="House Package">
        {NAV.map((item) => {
          const active = item.id === activeNav;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNav(item.id)}
              className={`rounded-[10px] border px-3.5 py-2.5 text-left text-sm font-medium ${
                active
                  ? 'border-builder-navy bg-builder-navy text-white'
                  : 'border-[#DDE5EF] bg-white text-builder-ink'
              }`}
            >
              {item.label}
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
