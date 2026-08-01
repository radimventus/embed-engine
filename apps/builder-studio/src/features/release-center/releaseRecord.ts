/**
 * EPIC-BX-07 — Release metadata (not HP-002). Product-level snapshot for compare.
 */

import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageReleaseSummary } from '../house-package/productionPublishGate';
import { buildKnowledgeDashboardModel } from '../knowledge-composer/knowledgeProjection';
import type { DecisionQaReport } from '../preview-center/decisionQa';

export type ReleaseProductSnapshot = {
  readonly heroPath: string;
  readonly galleryFiles: readonly string[];
  readonly videoCount: number;
  readonly roomCount: number;
  readonly experienceModules: readonly string[];
  readonly knowledgeAreas: readonly {
    readonly id: string;
    readonly label: string;
    readonly health: string;
  }[];
};

export type ReleaseStatus = 'active' | 'superseded' | 'rolled-back';

export type ReleaseRecord = {
  readonly id: string;
  readonly projectId: string;
  readonly version: string;
  readonly embedVersion: string;
  readonly fingerprint: string;
  readonly releasedAt: string;
  readonly author: string;
  readonly status: ReleaseStatus;
  readonly notes: {
    readonly changed: string;
    readonly why: string;
    readonly internal: string;
  };
  readonly validationStatus: string;
  readonly decisionQaLabel: string;
  readonly summary: HousePackageReleaseSummary;
  readonly product: ReleaseProductSnapshot;
};

export type ReleaseNotesDraft = {
  readonly changed: string;
  readonly why: string;
  readonly internal: string;
  readonly updatedAt: string;
};

export function captureReleaseProductSnapshot(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
}): ReleaseProductSnapshot {
  const { projectId, snapshot } = input;
  const pkg = snapshot?.validation.builderImport ?? null;
  const composition = loadExperienceComposition(
    projectId,
    snapshot?.working.heroRelativePath,
  );
  const knowledge = buildKnowledgeDashboardModel({ projectId, snapshot });

  return {
    heroPath: snapshot?.working.heroRelativePath.trim() ?? '',
    galleryFiles: (pkg?.gallery.entries ?? []).map(
      (entry) => entry.file || entry.path,
    ),
    videoCount: pkg?.videos.entries.length ?? 0,
    roomCount: pkg?.rooms.rooms.length ?? 0,
    experienceModules: composition.modules
      .filter((module) => module.enabled)
      .map((module) => module.id),
    knowledgeAreas: knowledge.categories.map((category) => ({
      id: category.id,
      label: category.label,
      health: category.health,
    })),
  };
}

export function createReleaseRecord(input: {
  readonly projectId: string;
  readonly summary: HousePackageReleaseSummary;
  readonly notes: ReleaseNotesDraft;
  readonly product: ReleaseProductSnapshot;
  readonly qa: DecisionQaReport;
  readonly author?: string;
}): ReleaseRecord {
  return {
    id: `${input.summary.housePackageVersion}:${input.summary.buildFingerprint}`,
    projectId: input.projectId,
    version: input.summary.housePackageVersion,
    embedVersion: input.summary.embedVersion,
    fingerprint: input.summary.buildFingerprint,
    releasedAt: input.summary.releaseTimestamp,
    author: input.author ?? 'uživatel',
    status: 'active',
    notes: {
      changed: input.notes.changed.trim(),
      why: input.notes.why.trim(),
      internal: input.notes.internal.trim(),
    },
    validationStatus: input.qa.validationStatus,
    decisionQaLabel: input.qa.summaryLabel,
    summary: input.summary,
    product: input.product,
  };
}

export function emptyReleaseNotesDraft(): ReleaseNotesDraft {
  return {
    changed: '',
    why: '',
    internal: '',
    updatedAt: new Date().toISOString(),
  };
}
