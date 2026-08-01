import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import type { HpEditSection } from '../house-package/validateHousePackageWorking';

type AnchorItem = {
  readonly id: HousePackageNavId;
  readonly label: string;
  readonly section: HpEditSection | null;
};

/**
 * PR-005 — Anchor Rail přesně podle HTML click modelu.
 * Pouze: Média · Dispozice · Znalosti.
 */
const ANCHORS: readonly AnchorItem[] = [
  { id: 'media-studio', label: 'Média', section: null },
  { id: 'rooms', label: 'Dispozice', section: 'rooms' },
  { id: 'knowledge', label: 'Znalosti', section: null },
];

type BuilderAnchorRailProps = {
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly activeNav: HousePackageNavId;
  readonly onSelectNav: (id: HousePackageNavId) => void;
};

export function BuilderAnchorRail({
  snapshot,
  activeNav,
  onSelectNav,
}: BuilderAnchorRailProps) {
  const resolvedActive: HousePackageNavId =
    activeNav === 'media' ||
    activeNav === 'gallery' ||
    activeNav === 'videos' ||
    activeNav === 'media-studio'
      ? 'media-studio'
      : activeNav === 'rooms'
        ? 'rooms'
        : activeNav === 'knowledge'
          ? 'knowledge'
          : activeNav;

  return (
    <nav
      className="mb-0 flex flex-wrap gap-2.5 pb-4"
      aria-label="Anchor Rail"
      data-studio-shell="anchor-rail"
    >
      {ANCHORS.map((item) => {
        const active = item.id === resolvedActive;
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
