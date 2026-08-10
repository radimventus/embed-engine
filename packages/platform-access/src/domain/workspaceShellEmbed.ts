/**
 * VR-04 / PT-OS-02 — Studio views embedded inside the CONIS Workspace Shell.
 * Query flag suppresses duplicate chrome (PlatformShell header).
 * Sticky session flag survives SPA navigations that drop the query (VR01).
 */

export const WORKSPACE_SHELL_EMBED_QUERY = 'workspaceEmbed' as const;
export const WORKSPACE_SHELL_EMBED_VALUE = '1' as const;
const WORKSPACE_SHELL_EMBED_STORAGE_KEY = 'conis.workspaceShellEmbed.v1';

function readStickyEmbed(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(WORKSPACE_SHELL_EMBED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeStickyEmbed(active: boolean): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (active) {
      sessionStorage.setItem(WORKSPACE_SHELL_EMBED_STORAGE_KEY, '1');
    } else {
      sessionStorage.removeItem(WORKSPACE_SHELL_EMBED_STORAGE_KEY);
    }
  } catch {
    // private mode / quota
  }
}

export function isWorkspaceShellEmbed(): boolean {
  if (typeof window === 'undefined') return false;
  const fromQuery =
    new URLSearchParams(window.location.search).get(
      WORKSPACE_SHELL_EMBED_QUERY,
    ) === WORKSPACE_SHELL_EMBED_VALUE;
  if (fromQuery) {
    writeStickyEmbed(true);
    return true;
  }
  // Top-level standalone visit clears sticky embed so Office/:4181 is not stuck content-only.
  if (window.self === window.top) {
    writeStickyEmbed(false);
    return false;
  }
  return readStickyEmbed();
}

export function isOnWorkspaceHost(): boolean {
  if (typeof window === 'undefined') return false;
  const { port, pathname } = window.location;
  if (port === '4183') return true;
  if (pathname.includes('/studio/workspace')) return true;
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

/** Preserve workspaceEmbed (and other) search params across Office SPA navigations. */
export function withCurrentSearchParams(href: string): string {
  if (typeof window === 'undefined') return href;
  const current = window.location.search;
  if (current.length <= 1) return href;
  try {
    const next = new URL(href, window.location.origin);
    const params = new URLSearchParams(current);
    for (const [key, value] of params.entries()) {
      if (!next.searchParams.has(key)) {
        next.searchParams.set(key, value);
      }
    }
    return `${next.pathname}${next.search}${next.hash}`;
  } catch {
    if (href.includes('?')) return href;
    return `${href}${current}`;
  }
}
