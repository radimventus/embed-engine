/**
 * EPIC-BX-02 — derive project dashboard view-model from HP-002 + workspace metadata.
 * No parallel content model (ADR-023).
 */

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import type { HousePackageNavId } from '../house-package/HousePackageSidebar';
import type { HousePackageReleaseSummary } from '../house-package/productionPublishGate';
import type {
  WorkspaceProject,
  WorkspaceProjectStatus,
} from '../workspace/workspaceRegistry';

export type ReadinessTone = 'ok' | 'warn' | 'missing';

export type ProjectReadinessItem = {
  readonly id: string;
  readonly label: string;
  readonly tone: ReadinessTone;
  readonly nav: HousePackageNavId;
};

export type ProjectDashboardStats = {
  readonly rooms: number;
  readonly photos: number;
  readonly videos: number;
  readonly svgPlans: number;
  readonly experienceModules: number;
  readonly validationLabel: string;
};

export type ProjectPublishHeadline = {
  readonly label: string;
  readonly version: string | null;
};

export type ProjectDashboardModel = {
  readonly projectName: string;
  readonly companyName: string;
  readonly companyInitials: string;
  readonly heroPath: string | null;
  readonly publishHeadline: ProjectPublishHeadline;
  readonly lastChangedLabel: string;
  readonly readinessStateLabel: string;
  readonly readiness: readonly ProjectReadinessItem[];
  readonly stats: ProjectDashboardStats;
  readonly lastPublication: {
    readonly version: string;
    readonly fingerprint: string;
    readonly dateLabel: string;
    readonly author: string;
  } | null;
};

const EXPERIENCE_FLOW_MODULES = 4;

export function buildProjectDashboardModel(input: {
  readonly project: WorkspaceProject;
  readonly companyName: string;
  readonly snapshot: HousePackageEditSnapshot;
  readonly validationReport: HousePackageValidationReport | null;
  readonly releaseSummary: HousePackageReleaseSummary | null;
}): ProjectDashboardModel {
  const { project, companyName, snapshot, validationReport, releaseSummary } =
    input;
  const pkg = snapshot.validation.builderImport;
  const canPublish = validationReport?.canPublish === true;
  const manifest = parseManifest(snapshot.working.manifestJson);
  const version = formatPackageVersion(manifest?.version);
  const experienceModules = countExperienceModules(manifest);

  const rooms = pkg?.rooms.rooms.length ?? 0;
  const photos = pkg?.gallery.entries.length ?? 0;
  const videos = pkg?.videos.entries.length ?? 0;
  const svgPlans =
    pkg?.svg.entries.length ?? pkg?.floors.floors.length ?? 0;

  const readiness = buildReadinessItems({
    snapshot,
    validationReport,
    canPublish,
    photos,
    rooms,
    videos,
    experienceModules,
  });

  return {
    projectName: project.name,
    companyName,
    companyInitials: initialsFromName(companyName),
    heroPath:
      snapshot.working.heroRelativePath.trim().length > 0
        ? snapshot.working.heroRelativePath.trim()
        : null,
    publishHeadline: buildPublishHeadline({
      projectStatus: project.status,
      releaseSummary,
      version,
      canPublish,
      validationReport,
    }),
    lastChangedLabel: formatCzechDateTime(snapshot.mountedAt),
    readinessStateLabel: buildReadinessStateLabel({
      validationReport,
      canPublish,
      releaseSummary,
      projectStatus: project.status,
      snapshotOk: snapshot.validation.ok,
    }),
    readiness,
    stats: {
      rooms,
      photos,
      videos,
      svgPlans,
      experienceModules: experienceModules,
      validationLabel:
        validationReport === null
          ? snapshot.validation.ok
            ? 'Validation PASS'
            : 'Validation ERROR'
          : `Validation ${validationReport.status}`,
    },
    lastPublication:
      releaseSummary === null
        ? null
        : {
            version: `v${releaseSummary.housePackageVersion}`,
            fingerprint: releaseSummary.buildFingerprint,
            dateLabel: formatCzechDateTime(releaseSummary.releaseTimestamp),
            author: 'uživatel',
          },
  };
}

function buildPublishHeadline(input: {
  readonly projectStatus: WorkspaceProjectStatus;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly version: string;
  readonly canPublish: boolean;
  readonly validationReport: HousePackageValidationReport | null;
}): ProjectPublishHeadline {
  if (input.releaseSummary !== null) {
    return {
      label: 'Publikováno',
      version: `v${input.releaseSummary.housePackageVersion}`,
    };
  }
  if (input.projectStatus === 'published') {
    return { label: 'Publikováno', version: input.version };
  }
  return {
    label: input.canPublish
      ? 'Ready for Publish'
      : input.validationReport?.status === 'ERROR'
        ? 'Blokováno'
        : statusLabel(input.projectStatus),
    version: input.version,
  };
}

function buildReadinessStateLabel(input: {
  readonly validationReport: HousePackageValidationReport | null;
  readonly canPublish: boolean;
  readonly releaseSummary: HousePackageReleaseSummary | null;
  readonly projectStatus: WorkspaceProjectStatus;
  readonly snapshotOk: boolean;
}): string {
  if (input.releaseSummary !== null || input.projectStatus === 'published') {
    return 'Published';
  }
  if (!input.snapshotOk) {
    return 'Needs attention';
  }
  if (input.canPublish) {
    return 'Ready for Publish';
  }
  if (input.validationReport === null) {
    return statusLabel(input.projectStatus);
  }
  return input.validationReport.status === 'WARNING'
    ? 'Ready with warnings'
    : 'Needs attention';
}

function buildReadinessItems(input: {
  readonly snapshot: HousePackageEditSnapshot;
  readonly validationReport: HousePackageValidationReport | null;
  readonly canPublish: boolean;
  readonly photos: number;
  readonly rooms: number;
  readonly videos: number;
  readonly experienceModules: number;
}): readonly ProjectReadinessItem[] {
  const { snapshot, validationReport, canPublish } = input;
  const hasIssue = (nav: HousePackageNavId, categories: readonly string[]) =>
    validationReport?.issues.some(
      (issue) =>
        issue.editor === nav || categories.includes(issue.category),
    ) === true;

  const toneFor = (
    ok: boolean,
    warn: boolean,
  ): ReadinessTone => {
    if (!ok || warn) return 'warn';
    return 'ok';
  };

  return [
    {
      id: 'media',
      label: 'Média',
      tone: toneFor(
        snapshot.working.heroRelativePath.trim().length > 0,
        hasIssue('media', ['media', 'missing-assets']),
      ),
      nav: 'media',
    },
    {
      id: 'disposition',
      label: 'Dispozice',
      tone: toneFor(
        input.rooms > 0,
        hasIssue('rooms', ['rooms', 'orphan-refs', 'duplicates', 'plans']),
      ),
      nav: 'rooms',
    },
    {
      id: 'gallery',
      label: 'Galerie',
      tone: toneFor(
        input.photos > 0,
        hasIssue('gallery', ['gallery', 'missing-assets']),
      ),
      nav: 'gallery',
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      tone: hasIssue('videos', ['videos'])
        ? 'warn'
        : input.videos > 0
          ? 'ok'
          : 'missing',
      nav: 'videos',
    },
    {
      id: 'experience',
      label: 'Experience',
      tone: hasIssue('manifest', ['manifest', 'mandatory'])
        ? 'warn'
        : input.experienceModules > 0
          ? 'ok'
          : 'missing',
      nav: 'manifest',
    },
    {
      id: 'runtime',
      label: 'Runtime',
      tone: snapshot.validation.ok ? 'ok' : 'warn',
      nav: 'overview',
    },
    {
      id: 'publish',
      label: 'Publikace',
      tone:
        validationReport === null
          ? 'missing'
          : canPublish
            ? validationReport.status === 'WARNING'
              ? 'warn'
              : 'ok'
            : 'warn',
      nav: 'overview',
    },
  ];
}

function parseManifest(
  raw: string | null,
): {
  readonly version?: unknown;
  readonly rooms?: readonly { readonly decisionCanvas?: unknown }[];
} | null {
  if (raw === null || raw.trim().length === 0) {
    return null;
  }
  try {
    return JSON.parse(raw) as {
      version?: unknown;
      rooms?: readonly { decisionCanvas?: unknown }[];
    };
  } catch {
    return null;
  }
}

function countExperienceModules(
  manifest: {
    readonly rooms?: readonly { readonly decisionCanvas?: unknown }[];
  } | null,
): number {
  if (manifest?.rooms === undefined) {
    return EXPERIENCE_FLOW_MODULES;
  }
  const canvases = manifest.rooms.filter(
    (room) =>
      typeof room.decisionCanvas === 'string' &&
      room.decisionCanvas.length > 0,
  ).length;
  return canvases > 0 ? canvases : EXPERIENCE_FLOW_MODULES;
}

function formatPackageVersion(version: unknown): string {
  if (typeof version === 'number') {
    return `v${version}`;
  }
  if (typeof version === 'string' && version.length > 0) {
    return version.startsWith('v') ? version : `v${version}`;
  }
  return 'v1';
}

function statusLabel(status: WorkspaceProjectStatus): string {
  if (status === 'published') return 'Publikováno';
  if (status === 'ready') return 'Připraveno';
  return 'Koncept';
}

export function formatCzechDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'C';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function toneGlyph(tone: ReadinessTone): string {
  if (tone === 'ok') return '✔';
  if (tone === 'warn') return '⚠';
  return '○';
}
