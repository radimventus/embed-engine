import { useEffect, useState } from 'react';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import type { HpEditSection } from '../house-package/validateHousePackageWorking';

type AnchorItem = {
  readonly id: HousePackageNavId;
  readonly label: string;
  readonly domId: string;
  readonly section: HpEditSection | null;
};

/**
 * PR-008 — Anchor Rail = scroll na sekce (HTML click model), ne přepínače obrazovek.
 */
const ANCHORS: readonly AnchorItem[] = [
  { id: 'media-studio', label: 'Média', domId: 'b-media', section: null },
  { id: 'rooms', label: 'Dispozice', domId: 'b-layout', section: 'rooms' },
  { id: 'knowledge', label: 'Znalosti', domId: 'b-knowledge', section: null },
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
  const [scrollActive, setScrollActive] = useState<HousePackageNavId | null>(
    null,
  );

  useEffect(() => {
    const root = document.querySelector(
      '[data-studio-shell="builder-layout"] main',
    );
    if (!(root instanceof HTMLElement)) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        let bestId: HousePackageNavId | null = null;
        let bestRatio = 0;
        for (const item of ANCHORS) {
          const ratio = ratios.get(item.domId) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = item.id;
          }
        }
        if (bestId !== null) {
          setScrollActive(bestId);
        }
      },
      {
        root,
        threshold: [0.15, 0.35, 0.55, 0.75],
      },
    );

    for (const item of ANCHORS) {
      const el = document.getElementById(item.domId);
      if (el !== null) observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [snapshot]);

  const resolvedActive: HousePackageNavId =
    scrollActive ??
    (activeNav === 'media' ||
    activeNav === 'gallery' ||
    activeNav === 'videos' ||
    activeNav === 'media-studio'
      ? 'media-studio'
      : activeNav === 'rooms'
        ? 'rooms'
        : activeNav === 'knowledge'
          ? 'knowledge'
          : 'media-studio');

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
            onClick={() => {
              onSelectNav(item.id);
              window.setTimeout(() => {
                document
                  .getElementById(item.domId)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 40);
            }}
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
