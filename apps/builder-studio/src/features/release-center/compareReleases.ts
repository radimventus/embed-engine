/**
 * EPIC-BX-07 — product-level release compare (not file diff).
 */

import type { ReleaseProductSnapshot, ReleaseRecord } from './releaseRecord';

export type ReleaseCompareChange = {
  readonly area: 'Hero' | 'Media' | 'Experience' | 'Knowledge' | 'Videos' | 'Rooms';
  readonly detail: string;
  readonly changed: boolean;
};

export type ReleaseCompareResult = {
  readonly left: ReleaseRecord;
  readonly right: ReleaseRecord;
  readonly changes: readonly ReleaseCompareChange[];
  readonly changeCount: number;
};

export function compareReleaseProducts(
  left: ReleaseRecord,
  right: ReleaseRecord,
): ReleaseCompareResult {
  const changes: ReleaseCompareChange[] = [
    heroChange(left.product, right.product),
    mediaChange(left.product, right.product),
    experienceChange(left.product, right.product),
    knowledgeChange(left.product, right.product),
    {
      area: 'Videos',
      detail: `${left.product.videoCount} → ${right.product.videoCount}`,
      changed: left.product.videoCount !== right.product.videoCount,
    },
    {
      area: 'Rooms',
      detail: `${left.product.roomCount} → ${right.product.roomCount}`,
      changed: left.product.roomCount !== right.product.roomCount,
    },
  ];

  return {
    left,
    right,
    changes,
    changeCount: changes.filter((item) => item.changed).length,
  };
}

function heroChange(
  left: ReleaseProductSnapshot,
  right: ReleaseProductSnapshot,
): ReleaseCompareChange {
  const changed = left.heroPath !== right.heroPath;
  return {
    area: 'Hero',
    detail: changed
      ? `${left.heroPath || '—'} → ${right.heroPath || '—'}`
      : left.heroPath || 'bez změny',
    changed,
  };
}

function mediaChange(
  left: ReleaseProductSnapshot,
  right: ReleaseProductSnapshot,
): ReleaseCompareChange {
  const leftSet = new Set(left.galleryFiles);
  const rightSet = new Set(right.galleryFiles);
  const added = right.galleryFiles.filter((file) => !leftSet.has(file));
  const removed = left.galleryFiles.filter((file) => !rightSet.has(file));
  const changed = added.length > 0 || removed.length > 0;
  const parts: string[] = [];
  if (added.length > 0) {
    parts.push(`+${added.length}`);
  }
  if (removed.length > 0) {
    parts.push(`−${removed.length}`);
  }
  return {
    area: 'Media',
    detail: changed
      ? `Galerie ${parts.join(' · ')} (${left.galleryFiles.length} → ${right.galleryFiles.length})`
      : `${left.galleryFiles.length} snímků`,
    changed,
  };
}

function experienceChange(
  left: ReleaseProductSnapshot,
  right: ReleaseProductSnapshot,
): ReleaseCompareChange {
  const leftSet = new Set(left.experienceModules);
  const rightSet = new Set(right.experienceModules);
  const added = right.experienceModules.filter((id) => !leftSet.has(id));
  const removed = left.experienceModules.filter((id) => !rightSet.has(id));
  const changed = added.length > 0 || removed.length > 0;
  return {
    area: 'Experience',
    detail: changed
      ? [
          added.length > 0 ? `zapnuto: ${added.join(', ')}` : null,
          removed.length > 0 ? `vypnuto: ${removed.join(', ')}` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : `${left.experienceModules.length} modulů`,
    changed,
  };
}

function knowledgeChange(
  left: ReleaseProductSnapshot,
  right: ReleaseProductSnapshot,
): ReleaseCompareChange {
  const leftMap = new Map(
    left.knowledgeAreas.map((area) => [area.id, area.health]),
  );
  const changedAreas = right.knowledgeAreas.filter(
    (area) => leftMap.get(area.id) !== area.health,
  );
  const changed = changedAreas.length > 0;
  return {
    area: 'Knowledge',
    detail: changed
      ? changedAreas.map((area) => `${area.label}: ${area.health}`).join(' · ')
      : 'Knowledge beze změny',
    changed,
  };
}
