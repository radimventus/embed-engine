import {
  applyDurableProjectConfigs,
  platformApiOrigin,
} from '@embed-engine/platform-access';

export async function hydrateDurableProjectPrivacy(
  projectId: string,
  signal?: AbortSignal,
): Promise<void> {
  const normalized = projectId.trim();
  if (normalized.length === 0) return;

  try {
    const response = await fetch(
      `${platformApiOrigin().replace(/\/$/, '')}/public/projects/${encodeURIComponent(normalized)}/config`,
      { signal },
    );
    if (!response.ok) return;
    const body = (await response.json()) as { privacyUrl?: unknown };
    applyDurableProjectConfigs([
      {
        projectId: normalized,
        privacyUrl:
          typeof body.privacyUrl === 'string' ? body.privacyUrl : null,
      },
    ]);
  } catch {
    // Fail closed — missing overlay leaves Project privacyUrl unset.
  }
}
