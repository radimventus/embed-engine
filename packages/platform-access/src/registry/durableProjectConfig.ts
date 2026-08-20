export type DurableProjectConfigOverlay = {
  readonly projectId: string;
  readonly privacyUrl: string | null;
};

const overlayByProjectId = new Map<string, string | null>();

export function applyDurableProjectConfigs(
  configs: readonly DurableProjectConfigOverlay[],
): void {
  overlayByProjectId.clear();
  for (const config of configs) {
    const projectId = config.projectId.trim();
    if (projectId.length === 0) continue;
    overlayByProjectId.set(projectId, config.privacyUrl);
  }
}

export function resetDurableProjectConfigs(): void {
  overlayByProjectId.clear();
}

export function durableProjectPrivacyUrl(
  projectId: string,
): string | undefined {
  const overlay = overlayByProjectId.get(projectId);
  if (overlay === undefined || overlay === null || overlay.length === 0) {
    return undefined;
  }
  return overlay;
}
