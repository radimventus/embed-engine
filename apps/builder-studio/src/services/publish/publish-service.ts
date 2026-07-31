/**
 * @legacy CAP-BLD-07 quarantine — mock in-memory PublishService.
 * NOT production Publish. Production uses `pnpm embed:publish` (CAP-BLD-06).
 * Kept only for legacy unit tests (`pnpm test:legacy`).
 * See `src/legacy/README.md`.
 */

import type {
  DistributionModel,
  ProjectPackage,
  PublishedPackage,
  PublishManifest,
  PublishResult,
  PublishValidationResult,
} from '../../model';
import { createPublishManifest } from './create-publish-manifest';
import {
  createPublishedPackage,
  createPublishResult,
} from './create-publish-result';
import { prepareDistribution } from './prepare-distribution';
import { validatePackage } from './validate-package';

const MAX_HISTORY = 10;
const MOCK_RUNTIME_VERSION = 'runtime-1.0.0-mock';

export type PublishService = {
  publishPackage(packageId: string): PublishResult;
  validatePackage(packageId: string): PublishValidationResult;
  createPublishManifest(packageId: string): PublishManifest;
  prepareDistribution(packageId: string): DistributionModel;
  createPublishResult(packageId: string): PublishResult;
  getLatestPublish(packageId?: string): PublishResult | null;
  getPublishHistory(packageId?: string): readonly PublishResult[];
  getPublishedPackage(packageId: string): PublishedPackage | null;
};

function mockChecksum(projectPackage: ProjectPackage): string {
  const seed = [
    projectPackage.packageId,
    projectPackage.manifest.version,
    projectPackage.assets.hero.length,
    projectPackage.assets.photographs.length,
    projectPackage.knowledge.length,
  ].join(':');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `mock-${hash.toString(16).padStart(8, '0')}`;
}

function nextPublishVersion(previous: PublishResult | null): string {
  if (previous?.publishManifest === null || previous === null) {
    return '1.0.0';
  }
  const parts = previous.publishManifest.version.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

/**
 * PublishService (EPIC-BLD-04).
 * Consumes ProjectPackage only — never Project, never Build logic.
 */
export function createPublishService(options: {
  readonly getPackage: (packageId: string) => ProjectPackage | null;
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): PublishService {
  const now = options.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      sequence += 1;
      const stamp = now().toISOString().replace(/[:.]/g, '-');
      return `${prefix}-${stamp}-${String(sequence).padStart(4, '0')}`;
    });

  const history: PublishResult[] = [];
  const publishedByPackageId = new Map<string, PublishedPackage>();

  const pushHistory = (result: PublishResult): void => {
    history.unshift(result);
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }
  };

  const latestSuccessfulFor = (packageId: string): PublishResult | null =>
    history.find(
      (item) => item.packageId === packageId && item.success === true,
    ) ?? null;

  const requirePackage = (packageId: string): ProjectPackage => {
    const projectPackage = options.getPackage(packageId);
    if (projectPackage === null) {
      throw new Error(`ProjectPackage not found: ${packageId}`);
    }
    return projectPackage;
  };

  return {
    validatePackage(packageId: string): PublishValidationResult {
      return validatePackage(options.getPackage(packageId));
    },

    createPublishManifest(packageId: string): PublishManifest {
      const projectPackage = requirePackage(packageId);
      const previous = latestSuccessfulFor(packageId);
      return createPublishManifest({
        projectPackage,
        version: nextPublishVersion(previous),
        publishTime: now().toISOString(),
        checksum: mockChecksum(projectPackage),
        runtimeVersion: MOCK_RUNTIME_VERSION,
      });
    },

    prepareDistribution(packageId: string): DistributionModel {
      const projectPackage = requirePackage(packageId);
      const publishManifest = this.createPublishManifest(packageId);
      return prepareDistribution(projectPackage, publishManifest);
    },

    createPublishResult(packageId: string): PublishResult {
      return this.publishPackage(packageId);
    },

    publishPackage(packageId: string): PublishResult {
      const publishTime = now().toISOString();
      const projectPackage = options.getPackage(packageId);
      const validation = validatePackage(projectPackage);

      if (projectPackage === null || validation.errors.length > 0) {
        const failed = createPublishResult({
          publishId: createId('publish'),
          packageId,
          success: false,
          errors: validation.errors,
          warnings: validation.warnings,
          publishedPackage: null,
          publishManifest: null,
          distribution: null,
          buildVersion: projectPackage?.manifest.version ?? null,
          publishedAt: publishTime,
        });
        pushHistory(failed);
        return failed;
      }

      const previous = latestSuccessfulFor(packageId);
      const publishManifest = createPublishManifest({
        projectPackage,
        version: nextPublishVersion(previous),
        publishTime,
        checksum: mockChecksum(projectPackage),
        runtimeVersion: MOCK_RUNTIME_VERSION,
      });
      const distribution = prepareDistribution(
        projectPackage,
        publishManifest,
      );
      const runtimeEntry = `runtime://packages/${projectPackage.projectId}/entry.json`;
      const publishedPackage = createPublishedPackage({
        projectPackage,
        publishManifest,
        distribution,
        runtimeEntry,
      });

      publishedByPackageId.set(packageId, publishedPackage);

      const result = createPublishResult({
        publishId: createId('publish'),
        packageId,
        success: true,
        errors: validation.errors,
        warnings: validation.warnings,
        publishedPackage,
        publishManifest,
        distribution,
        buildVersion: projectPackage.manifest.version,
        publishedAt: publishTime,
      });
      pushHistory(result);
      return result;
    },

    getLatestPublish(packageId?: string): PublishResult | null {
      if (packageId === undefined) {
        return history[0] ?? null;
      }
      return history.find((item) => item.packageId === packageId) ?? null;
    },

    getPublishHistory(packageId?: string): readonly PublishResult[] {
      if (packageId === undefined) {
        return [...history];
      }
      return history.filter((item) => item.packageId === packageId);
    },

    getPublishedPackage(packageId: string): PublishedPackage | null {
      return publishedByPackageId.get(packageId) ?? null;
    },
  };
}
