import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type {
  HousePackageNavId,
} from '../house-package/HousePackageSidebar';
import type { HpEditSection } from '../house-package/validateHousePackageWorking';

type AnchorItem = {
  readonly id: HousePackageNavId;
  readonly label: string;
  readonly section: HpEditSection | null;
  readonly group: 'authoring' | 'content' | 'platform';
};

const ANCHORS: readonly AnchorItem[] = [
  { id: 'overview', label: 'Dashboard', section: null, group: 'authoring' },
  { id: 'media-studio', label: 'Média', section: null, group: 'authoring' },
  { id: 'rooms', label: 'Dispozice', section: 'rooms', group: 'content' },
  { id: 'knowledge', label: 'Znalosti', section: null, group: 'authoring' },
  { id: 'experience', label: 'Experience', section: null, group: 'authoring' },
  { id: 'preview-center', label: 'Preview', section: null, group: 'authoring' },
  { id: 'release-center', label: 'Release', section: null, group: 'authoring' },
  {
    id: 'collaboration',
    label: 'Collaboration',
    section: null,
    group: 'platform',
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    section: null,
    group: 'platform',
  },
];

type BuilderAnchorRailProps = {
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly activeNav: HousePackageNavId;
  readonly onSelectNav: (id: HousePackageNavId) => void;
};

/**
 * VR-FIX-01 — Sticky Anchor Rail (workspace navigation, not left menu).
 * Product-facing capability groups from click model (Média / Dispozice / Znalosti +).
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
            className={`rounded-[10px] border px-5 py-2.5 text-[13px] font-semibold ${
              active
                ? 'border-builder-navy bg-builder-navy text-white'
                : 'border-[#DDE5EF] bg-white text-builder-ink'
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
