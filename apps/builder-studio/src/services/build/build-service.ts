import type {
  ActiveProjectModel,
  BuildResult,
  BuildValidationResult,
  CollectedAssets,
  ProjectManifest,
  ProjectPackage,
} from '../../model';
import { collectAssets } from './collect-assets';
import { generateManifest } from './generate-manifest';
import { packageProject } from './package-project';
import { validateProject } from './validate-project';

const MAX_HISTORY = 10;

export type BuildService = {
  buildProject(projectId: string): BuildResult;
  validateProject(projectId: string): BuildValidationResult;
  collectAssets(projectId: string): CollectedAssets;
  generateManifest(projectId: string): ProjectManifest;
  packageProject(projectId: string): ProjectPackage;
  getLatestBuild(projectId: string): BuildResult | null;
  getBuildHistory(projectId?: string): readonly BuildResult[];
  /** Lookup built package for Publish Pipeline (never rebuilds). */
  getPackage(packageId: string): ProjectPackage | null;
};

function countCollected(collected: CollectedAssets): {
  assetCount: number;
  layoutCount: number;
  knowledgeCount: number;
} {
  return {
    assetCount:
      collected.hero.length +
      collected.photographs.length +
      collected.video.length,
    layoutCount:
      collected.svg.length +
      collected.floorplan.length +
      collected.csvRooms.length +
      collected.csvImages.length,
    knowledgeCount: collected.knowledge.length,
  };
}

function nextVersion(previous: BuildResult | null): string {
  if (previous === null) {
    return '1.0.0';
  }
  const parts = previous.manifest.version.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

/**
 * BuildService (EPIC-BLD-03).
 * Deterministic in-memory Project Package preparation for future Publish.
 * No Runtime interpretation, no upload, no disk export.
 */
export function createBuildService(options: {
  readonly getProject: (projectId: string) => ActiveProjectModel | null;
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): BuildService {
  const now = options.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      sequence += 1;
      const stamp = now().toISOString().replace(/[:.]/g, '-');
      return `${prefix}-${stamp}-${String(sequence).padStart(4, '0')}`;
    });

  const history: BuildResult[] = [];

  const requireProject = (projectId: string): ActiveProjectModel => {
    const project = options.getProject(projectId);
    if (project === null) {
      throw new Error(`Project not found for build: ${projectId}`);
    }
    return project;
  };

  const pushHistory = (result: BuildResult): void => {
    history.unshift(result);
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }
  };

  const latestFor = (projectId: string): BuildResult | null =>
    history.find((item) => item.projectId === projectId) ?? null;

  return {
    collectAssets(projectId: string): CollectedAssets {
      return collectAssets(requireProject(projectId));
    },

    validateProject(projectId: string): BuildValidationResult {
      const project = requireProject(projectId);
      const collected = collectAssets(project);
      const manifestId = `manifest-${project.projectId}`;
      return validateProject(project, collected, manifestId);
    },

    generateManifest(projectId: string): ProjectManifest {
      const project = requireProject(projectId);
      const collected = collectAssets(project);
      const buildTime = now().toISOString();
      const previous = latestFor(projectId);
      return generateManifest({
        project,
        collected,
        manifestId: `manifest-${project.projectId}`,
        version: nextVersion(previous),
        buildTime,
      });
    },

    packageProject(projectId: string): ProjectPackage {
      const validation = this.validateProject(projectId);
      const manifest = this.generateManifest(projectId);
      return packageProject({
        packageId: `package-${projectId}`,
        manifest,
        publishable: validation.errors.length === 0,
        createdAt: manifest.buildTime,
      });
    },

    buildProject(projectId: string): BuildResult {
      const started = now();
      const project = requireProject(projectId);
      const collected = collectAssets(project);
      const previous = latestFor(projectId);
      const buildTime = started.toISOString();
      const manifestId = `manifest-${project.projectId}`;
      const version = nextVersion(previous);

      const validation = validateProject(project, collected, manifestId);
      const manifest = generateManifest({
        project,
        collected,
        manifestId,
        version,
        buildTime,
      });
      const success = validation.errors.length === 0;
      const projectPackage = packageProject({
        packageId: createId('package'),
        manifest,
        publishable: success,
        createdAt: buildTime,
      });
      const counts = countCollected(collected);
      const finished = now();
      const result: BuildResult = {
        buildId: createId('build'),
        projectId,
        success,
        warnings: validation.warnings,
        errors: validation.errors,
        manifest,
        package: projectPackage,
        statistics: {
          ...counts,
          errorCount: validation.errors.length,
          warningCount: validation.warnings.length,
          durationMs: Math.max(0, finished.getTime() - started.getTime()),
        },
        builtAt: buildTime,
      };

      pushHistory(result);
      return result;
    },

    getLatestBuild(projectId: string): BuildResult | null {
      return latestFor(projectId);
    },

    getBuildHistory(projectId?: string): readonly BuildResult[] {
      if (projectId === undefined) {
        return [...history];
      }
      return history.filter((item) => item.projectId === projectId);
    },

    getPackage(packageId: string): ProjectPackage | null {
      const match = history.find(
        (item) => item.package.packageId === packageId,
      );
      return match?.package ?? null;
    },
  };
}
