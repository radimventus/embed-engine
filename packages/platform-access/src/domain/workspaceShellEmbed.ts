/**
 * VR-04 — Studio views embedded inside the CONIS Workspace Shell.
 * Query flag suppresses duplicate chrome (PlatformShell header / PE bar).
 */

export const WORKSPACE_SHELL_EMBED_QUERY = 'workspaceEmbed' as const;
export const WORKSPACE_SHELL_EMBED_VALUE = '1' as const;

export function isWorkspaceShellEmbed(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    new URLSearchParams(window.location.search).get(
      WORKSPACE_SHELL_EMBED_QUERY,
    ) === WORKSPACE_SHELL_EMBED_VALUE
  );
}

export function isOnWorkspaceHost(): boolean {
  if (typeof window === 'undefined') return false;
  const { port, pathname, hostname } = window.location;
  if (port === '4183') return true;
  if (pathname.includes('/studio/workspace')) return true;
  // Local hostname checks for cloud path hosts
  void hostname;
  return false;
}

/** Append embed flag so nested studio apps render content-only. */
export function withWorkspaceShellEmbed(href: string): string {
  try {
    const url = new URL(href, 'http://127.0.0.1');
    url.searchParams.set(
      WORKSPACE_SHELL_EMBED_QUERY,
      WORKSPACE_SHELL_EMBED_VALUE,
    );
    if (/^https?:/i.test(href)) {
      return url.toString();
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const join = href.includes('?') ? '&' : '?';
    return `${href}${join}${WORKSPACE_SHELL_EMBED_QUERY}=${WORKSPACE_SHELL_EMBED_VALUE}`;
  }
}
