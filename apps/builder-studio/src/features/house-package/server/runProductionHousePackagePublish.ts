/**
 * CAP-BLD-06 — Node orchestration: validate HP → optional geometry → embed:publish.
 * Does not invent content or a second publish pipeline.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { BuilderPackageImportError } from '@embed-engine/object-house/builder-package';

import {
  buildHousePackageReleaseSummary,
  decideProductionPublishGate,
  type HousePackageReleaseSummary,
  type ProductionPublishStage,
} from '../productionPublishGate';

export type ProductionPublishSuccess = {
  readonly ok: true;
  readonly summary: HousePackageReleaseSummary;
  readonly validationErrors: readonly BuilderPackageImportError[];
};

export type ProductionPublishFailure = {
  readonly ok: false;
  readonly stage: ProductionPublishStage;
  readonly error: string;
  readonly validationErrors?: readonly BuilderPackageImportError[];
};

export type ProductionPublishResult =
  | ProductionPublishSuccess
  | ProductionPublishFailure;

type ImportFn = (packageRoot: string) => Promise<
  | { readonly ok: true; readonly result: unknown }
  | { readonly ok: false; readonly errors: readonly BuilderPackageImportError[] }
>;

type PublishGeometryFn = (
  packageRoot: string,
) => Promise<
  readonly (
    | { readonly ok: true }
    | {
        readonly ok: false;
        readonly errors: readonly {
          readonly code: string;
          readonly message: string;
          readonly path?: string;
        }[];
      }
  )[]
>;

function formatCommandOutput(
  stdout: string | null | undefined,
  stderr: string | null | undefined,
): string {
  const parts = [stderr, stdout]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part.length > 0);
  return parts.join('\n').trim();
}

/**
 * Orchestrate production publish against the canonical HP-002 disk root.
 */
export async function runProductionHousePackagePublish(input: {
  readonly packageRoot: string;
  readonly repoRoot: string;
  readonly importBuilderHousePackage: ImportFn;
  readonly publishAllFloorPlanGeometry: PublishGeometryFn;
  readonly runEmbedPublish?: () => {
    readonly status: number | null;
    readonly stdout: string;
    readonly stderr: string;
  };
}): Promise<ProductionPublishResult> {
  const runEmbedPublish =
    input.runEmbedPublish ??
    (() => {
      const result = spawnSync('pnpm', ['embed:publish'], {
        cwd: input.repoRoot,
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
        shell: process.platform === 'win32',
      });
      return {
        status: result.status,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
      };
    });

  let geometryRan = false;

  let importResult = await input.importBuilderHousePackage(input.packageRoot);
  let errors: readonly BuilderPackageImportError[] = importResult.ok
    ? []
    : importResult.errors;

  const firstGate = decideProductionPublishGate(errors);
  if (firstGate.action === 'block') {
    return {
      ok: false,
      stage: 'validate',
      error: `Publish blocked by object-house validation (${errors.length} error(s)).`,
      validationErrors: errors,
    };
  }

  if (firstGate.action === 'run-geometry') {
    geometryRan = true;
    const geometryResults = await input.publishAllFloorPlanGeometry(
      input.packageRoot,
    );
    const geometryFailures = geometryResults.filter((result) => !result.ok);
    if (geometryFailures.length > 0) {
      const details = geometryFailures
        .flatMap((result) =>
          result.ok
            ? []
            : result.errors.map(
                (error) =>
                  `${error.code}: ${error.message}${error.path ? ` (${error.path})` : ''}`,
              ),
        )
        .join('\n');
      return {
        ok: false,
        stage: 'geometry',
        error: `Floorplan geometry publish failed:\n${details}`,
      };
    }

    importResult = await input.importBuilderHousePackage(input.packageRoot);
    errors = importResult.ok ? [] : importResult.errors;
    const secondGate = decideProductionPublishGate(errors);
    if (secondGate.action !== 'continue') {
      return {
        ok: false,
        stage: 'validate',
        error: `Publish blocked after geometry: object-house still reports ${errors.length} error(s).`,
        validationErrors: errors,
      };
    }
  }

  const publish = runEmbedPublish();
  if (publish.status !== 0) {
    const output = formatCommandOutput(publish.stdout, publish.stderr);
    return {
      ok: false,
      stage: 'embed:publish',
      error:
        output.length > 0
          ? `pnpm embed:publish failed (exit ${publish.status ?? 1}):\n${output}`
          : `pnpm embed:publish failed (exit ${publish.status ?? 1}).`,
      validationErrors: errors,
    };
  }

  try {
    const embedVersionJson = JSON.parse(
      readFileSync(join(input.repoRoot, 'docs/embed/version.json'), 'utf8'),
    ) as {
      version?: unknown;
      fingerprint?: { marker?: unknown; builtAt?: unknown };
    };
    const housePackageManifest = JSON.parse(
      readFileSync(join(input.packageRoot, 'manifest.json'), 'utf8'),
    ) as { version?: unknown };

    const summary = buildHousePackageReleaseSummary({
      embedVersionJson,
      housePackageManifest,
      geometryRan,
    });

    return {
      ok: true,
      summary,
      validationErrors: errors,
    };
  } catch (error: unknown) {
    return {
      ok: false,
      stage: 'summary',
      error:
        error instanceof Error
          ? error.message
          : 'Failed to read Release Summary artifacts.',
    };
  }
}
