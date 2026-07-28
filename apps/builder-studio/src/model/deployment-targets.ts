import type { DeploymentTarget, DeploymentTargetKind } from './publish-types';

/**
 * Declared deployment targets for future adapters (EPIC-BLD-04).
 * Interface / catalog only — no deploy implementations.
 */
export const DEPLOYMENT_TARGET_KINDS: readonly DeploymentTargetKind[] = [
  'GitHub Pages',
  'S3',
  'Local',
  'Cloud Storage',
] as const;

export function listDeploymentTargets(): readonly DeploymentTarget[] {
  return DEPLOYMENT_TARGET_KINDS.map((kind) => ({
    kind,
    id: kind.toLowerCase().replace(/\s+/g, '-'),
    label: kind,
  }));
}
