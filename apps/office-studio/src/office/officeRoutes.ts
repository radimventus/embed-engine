/**
 * OF-01 / OF-02 / OF-03 — Office Studio routes under /studio/office/
 * Partners + Sales support detail deep-link: /:section/:partnerId
 */

export type OfficeRouteId =
  | 'dashboard'
  | 'partners'
  | 'sales'
  | 'documents'
  | 'implementation'
  | 'activity'
  | 'settings';

export type OfficeNavItem = {
  readonly id: OfficeRouteId;
  readonly label: string;
  readonly path: string;
};

export type OfficeLocation = {
  readonly routeId: OfficeRouteId;
  readonly partnerId: string | null;
};

/** Left-rail IA (approved terminology). */
export const OFFICE_NAV_ITEMS: readonly OfficeNavItem[] = Object.freeze([
  { id: 'dashboard', label: 'Dashboard', path: 'dashboard' },
  { id: 'partners', label: 'Partneři', path: 'partners' },
  { id: 'sales', label: 'Obchod', path: 'sales' },
  { id: 'documents', label: 'Dokumenty', path: 'documents' },
  { id: 'implementation', label: 'Implementace', path: 'implementation' },
  { id: 'activity', label: 'Aktivita', path: 'activity' },
  { id: 'settings', label: 'Nastavení', path: 'settings' },
]);

const ROUTE_BY_PATH = new Map(
  OFFICE_NAV_ITEMS.map((item) => [item.path, item.id] as const),
);

const PARTNER_SCOPED_ROUTES: ReadonlySet<OfficeRouteId> = new Set([
  'partners',
  'sales',
  'documents',
  'implementation',
]);

export function officeRouteLabel(routeId: OfficeRouteId): string {
  return (
    OFFICE_NAV_ITEMS.find((item) => item.id === routeId)?.label ?? 'Office'
  );
}

function viteBaseUrl(): string {
  try {
    const base = import.meta.env?.BASE_URL;
    if (typeof base === 'string' && base.length > 0) return base;
  } catch {
    // Node / non-Vite host
  }
  return '/';
}

function stripBase(pathname: string, baseUrl: string): string {
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  let rest = pathname;
  if (base.length > 0 && rest.startsWith(base)) {
    rest = rest.slice(base.length);
  }
  return rest.replace(/^\/+/, '').replace(/\/+$/, '');
}

/** Strip Vite base so `/studio/office/partners` → `partners`. */
export function parseOfficeRoute(
  pathname: string,
  baseUrl = viteBaseUrl(),
): OfficeRouteId {
  return parseOfficeLocation(pathname, baseUrl).routeId;
}

export function parseOfficeLocation(
  pathname: string,
  baseUrl = viteBaseUrl(),
): OfficeLocation {
  const rest = stripBase(pathname, baseUrl);
  if (rest.length === 0) {
    return { routeId: 'dashboard', partnerId: null };
  }
  const segments = rest.split('/').filter((part) => part.length > 0);
  const segment = segments[0] ?? '';
  const routeId = ROUTE_BY_PATH.get(segment) ?? 'dashboard';
  if (PARTNER_SCOPED_ROUTES.has(routeId) && segments.length > 1) {
    return { routeId, partnerId: segments[1] ?? null };
  }
  return { routeId, partnerId: null };
}

export function officeHref(
  routeId: OfficeRouteId,
  partnerId?: string | null,
): string {
  const item = OFFICE_NAV_ITEMS.find((entry) => entry.id === routeId);
  const path = item?.path ?? 'dashboard';
  const raw = viteBaseUrl();
  const base = raw.endsWith('/') ? raw : `${raw}/`;
  if (path === 'dashboard') return base;
  if (
    PARTNER_SCOPED_ROUTES.has(routeId) &&
    partnerId != null &&
    partnerId.length > 0
  ) {
    return `${base}${path}/${partnerId}`;
  }
  return `${base}${path}`;
}
