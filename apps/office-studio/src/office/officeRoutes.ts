/**
 * OF-01 / OF-02 / OF-03 / CAP-OP-10A — Office Studio routes.
 * Global Project Context drives work surface; Pilot Workspace is not a route.
 */

export type OfficeRouteId =
  | 'work'
  | 'dashboard'
  | 'partners'
  | 'sales'
  | 'documents'
  | 'implementation'
  | 'activity'
  | 'settings'
  | 'commercial-journey';

export type OfficeNavItem = {
  readonly id: Exclude<OfficeRouteId, 'work'>;
  readonly label: string;
  readonly path: string;
};

export type OfficeLocation = {
  readonly routeId: OfficeRouteId;
  readonly partnerId: string | null;
};

/**
 * Left-rail IA — Project block is separate (sidebar).
 * Work surface (`/`) is default; not listed as a nav item.
 * Partner Commercial Journey is last (PT-VR-01).
 */
export const OFFICE_NAV_ITEMS: readonly OfficeNavItem[] = Object.freeze([
  { id: 'dashboard', label: 'Dashboard', path: 'dashboard' },
  { id: 'partners', label: 'Partneři', path: 'partners' },
  { id: 'sales', label: 'Obchod', path: 'sales' },
  { id: 'documents', label: 'Dokumenty', path: 'documents' },
  { id: 'implementation', label: 'Implementace', path: 'implementation' },
  { id: 'activity', label: 'Aktivita', path: 'activity' },
  { id: 'settings', label: 'Nastavení', path: 'settings' },
  {
    id: 'commercial-journey',
    label: 'Partner Commercial Journey',
    path: 'commercial-journey',
  },
]);

const ROUTE_BY_PATH = new Map<string, OfficeRouteId>([
  ...OFFICE_NAV_ITEMS.map((item) => [item.path, item.id] as const),
  /** Legacy CAP-OP-01 URL — maps to global work surface. */
  ['pilot-workspace', 'work'],
]);

const PARTNER_SCOPED_ROUTES: ReadonlySet<OfficeRouteId> = new Set([
  'partners',
  'sales',
  'documents',
  'implementation',
]);

export function officeRouteLabel(routeId: OfficeRouteId): string {
  if (routeId === 'work') return 'Working Terminal';
  if (routeId === 'commercial-journey') return 'Partner Commercial Journey';
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
    return { routeId: 'work', partnerId: null };
  }
  const segments = rest.split('/').filter((part) => part.length > 0);
  const segment = segments[0] ?? '';
  const routeId = ROUTE_BY_PATH.get(segment) ?? 'work';
  if (PARTNER_SCOPED_ROUTES.has(routeId) && segments.length > 1) {
    return { routeId, partnerId: segments[1] ?? null };
  }
  return { routeId, partnerId: null };
}

export function officeHref(
  routeId: OfficeRouteId,
  partnerId?: string | null,
): string {
  const raw = viteBaseUrl();
  const base = raw.endsWith('/') ? raw : `${raw}/`;
  if (routeId === 'work') return base;
  const item = OFFICE_NAV_ITEMS.find((entry) => entry.id === routeId);
  const path = item?.path ?? 'dashboard';
  if (
    PARTNER_SCOPED_ROUTES.has(routeId) &&
    partnerId != null &&
    partnerId.length > 0
  ) {
    return `${base}${path}/${partnerId}`;
  }
  return `${base}${path}`;
}
