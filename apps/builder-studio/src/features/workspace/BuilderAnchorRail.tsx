import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import type { HpEditSection } from '../house-package/validateHousePackageWorking';

type AnchorItem = {
  readonly id: HousePackageNavId;
  readonly label: string;
  readonly section: HpEditSection | null;
};

const ANCHORS: readonly AnchorItem[] = [
  { id: 'overview', label: 'Dashboard', section: null },
  { id: 'media-studio', label: 'Media', section: null },
  { id: 'rooms', label: 'Rooms', section: 'rooms' },
  { id: 'knowledge', label: 'Knowledge', section: null },
  { id: 'experience', label: 'Experience', section: null },
  { id: 'preview-center', label: 'Preview', section: null },
  { id: 'release-center', label: 'Release', section: null },
  { id: 'collaboration', label: 'Collaboration', section: null },
  { id: 'intelligence', label: 'Intelligence', section: null },
];

type BuilderAnchorRailProps = {
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly activeNav: HousePackageNavId;
  readonly onSelectNav: (id: HousePackageNavId) => void;
};

/**
 * VR-FIX-02 — Sticky product modules (click-model builder-tabs grammar).
 */
export function BuilderAnchorRail({
  snapshot,
  activeNav,
  onSelectNav,
}: BuilderAnchorRailProps) {
  return (
    <nav
      className="sticky top-0 z-20 mb-6 flex flex-wrap gap-2.5 bg-builder-canvas pb-4"
      aria-label="Anchor Rail"
      data-studio-shell="anchor-rail"
    >
      {ANCHORS.map((item) => {
        const active = item.id === activeNav;
        const dirty =
          item.section !== null &&
          snapshot?.dirty.includes(item.section) === true;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectNav(item.id)}
            className={`rounded-[10px] border px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              active
                ? 'border-builder-navy bg-builder-navy text-white'
                : 'border-[#DDE5EF] bg-white text-builder-ink hover:bg-builder-hover'
            }`}
          >
            {item.label}
            {dirty ? ' ·' : ''}
          </button>
        );
      })}
    </nav>
  );
}
