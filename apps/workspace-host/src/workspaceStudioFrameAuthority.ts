import type { WorkspaceStudioSurface } from '@embed-engine/platform-access';

/**
 * Manager owns a Project-scoped local SessionProvider and canonical registry.
 * Remount it when the Host confirms another authoritative Project so the new
 * runtime restores that server session before rendering Manager data.
 *
 * House selection remains an in-runtime scope change and deliberately does
 * not participate in iframe identity.
 */
export function workspaceStudioFrameAuthorityKey(
  surface: Exclude<WorkspaceStudioSurface, 'client'>,
  projectId: string | null,
): string {
  return surface === 'manager'
    ? `${surface}:${projectId ?? 'none'}`
    : surface;
}
