/**
 * EPIC-BX-07 — Release Center view-model over existing publish + release metadata.
 */

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageReleaseSummary } from '../house-package/productionPublishGate';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import {
  compareReleaseProducts,
  type ReleaseCompareResult,
} from './compareReleases';
import { loadProjectReleases } from './releaseHistoryStorage';
import type { ReleaseNotesDraft, ReleaseRecord } from './releaseRecord';
import {
  buildReleaseReadiness,
  type ReleaseReadinessReport,
} from './releaseReadiness';

export type PreparedChange = {
  readonly id: string;
  readonly label: string;
};

export type ReleaseCenterModel = {
  readonly current: ReleaseRecord | null;
  readonly sessionSummary: HousePackageReleaseSummary | null;
  readonly history: readonly ReleaseRecord[];
  readonly readiness: ReleaseReadinessReport;
  readonly preparedChanges: readonly PreparedChange[];
  readonly compare: ReleaseCompareResult | null;
  readonly readyToRelease: boolean;
};

export function buildReleaseCenterModel(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly notesDraft: ReleaseNotesDraft;
  readonly compareLeftId: string | null;
  readonly compareRightId: string | null;
  readonly historyTick?: number;
}): ReleaseCenterModel {
  void input.notesDraft;
  void input.historyTick;
  const { releases, activeReleaseId } = loadProjectReleases(input.projectId);
  const current =
    releases.find((item) => item.id === activeReleaseId) ??
    releases.find((item) => item.status === 'active') ??
    releases[0] ??
    null;

  const readiness = buildReleaseReadiness({
    projectId: input.projectId,
    snapshot: input.snapshot,
    validationReport: input.validationReport,
  });

  const left =
    releases.find((item) => item.id === input.compareLeftId) ?? null;
  const right =
    releases.find((item) => item.id === input.compareRightId) ?? null;
  const compare =
    left !== null && right !== null && left.id !== right.id
      ? compareReleaseProducts(left, right)
      : null;

  return {
    current,
    sessionSummary: input.releaseSummary,
    history: releases,
    readiness,
    preparedChanges: buildPreparedChanges(input.snapshot),
    compare,
    readyToRelease: readiness.readyToRelease,
  };
}

function buildPreparedChanges(
  snapshot: HousePackageEditSnapshot | null,
): readonly PreparedChange[] {
  if (snapshot === null) {
    return [];
  }
  const changes: PreparedChange[] = [];
  if (snapshot.dirtyState !== 'clean') {
    changes.push({
      id: 'dirty',
      label: 'Neuložené pracovní změny',
    });
  }
  for (const section of snapshot.dirty) {
    changes.push({
      id: section,
      label: `Změna: ${section}`,
    });
  }
  if (changes.length === 0 && snapshot.validation.ok) {
    changes.push({
      id: 'clean',
      label: 'Žádné připravené změny oproti uloženému obsahu',
    });
  }
  return changes;
}
