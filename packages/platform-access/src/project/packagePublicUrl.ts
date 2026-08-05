/**
 * PT-PDM-02 — Map repo-relative packageRoot → Vite public URL.
 */

const PUBLIC_PREFIX = 'apps/client-studio/public';

/**
 * `apps/client-studio/public/house-package` → `/house-package`
 * Absolute `/…` roots pass through.
 */
export function packageRootToPublicUrl(packageRoot: string): string {
  const trimmed = packageRoot.trim().replace(/\/+$/, '');
  if (trimmed.length === 0) {
    return '/house-package';
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  if (trimmed.startsWith(PUBLIC_PREFIX)) {
    const rest = trimmed.slice(PUBLIC_PREFIX.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  const marker = '/public/';
  const idx = trimmed.indexOf(marker);
  if (idx >= 0) {
    const rest = trimmed.slice(idx + marker.length - 1);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return `/${trimmed.split('/').pop() ?? 'house-package'}`;
}
