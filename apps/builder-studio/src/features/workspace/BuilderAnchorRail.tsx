import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import type { HpEditSection } from '../house-package/validateHousePackageWorking';

type AnchorItem = {
  readonly id: HousePackageNavId;
  readonly label: string;
  readonly section: HpEditSection | null;
};

/** VR-FIX-06 — click-model Czech product labels (IDs unchanged). */
const ANCHORS: readonly AnchorItem[] = [
  { id: 'overview', label: 'Dashboard', section: null },
  { id: 'media-studio', label: 'Média', section: null },
  { id: 'rooms', label: 'Dispozice', section: 'rooms' },
  { id: 'knowledge', label: 'Znalosti', section: null },
  { id: 'experience', label: 'Experience', section: null },
  { id: 'preview-center', label: 'Náhled', section: null },
  { id: 'release-center', label: 'Publikace', section: null },
  { id: 'collaboration', label: 'Spolupráce', section: null },
  { id: 'intelligence', label: 'Intelligence', section: null },
];

type BuilderAnchorRailProps = {
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly activeNav: HousePackageNavId;
  readonly onSelectNav: (id: HousePackageNavId) => void;
};

/**
 * VR-FIX-06 — Sticky product modules (click-model builder-tabs grammar).
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
            className={`platform-tab ${active ? 'platform-tab--active' : ''}`}
          >
            {item.label}
            {dirty ? ' ·' : ''}
          </button>
        );
      })}
    </nav>
  );
}
