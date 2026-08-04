import { PilotProjectSelector } from '../features/pilot-workspace/PilotProjectSelector';
import { officeHref, type OfficeRouteId, OFFICE_NAV_ITEMS } from '../office/officeRoutes';

type OfficeSidebarProps = {
  readonly activeRouteId: OfficeRouteId;
  readonly onNavigate: (routeId: OfficeRouteId) => void;
};

/**
 * OF-01 / CAP-OP-10A — Left rail: global PROJEKTY block + IA navigation.
 */
export function OfficeSidebar({
  activeRouteId,
  onNavigate,
}: OfficeSidebarProps) {
  return (
    <aside
      className="office-sidebar"
      data-studio-shell="sidebar"
      aria-label="Navigace Office Studia"
    >
      <button
        type="button"
        className="office-sidebar__brand"
        data-testid="office-sidebar-brand"
        onClick={() => onNavigate('work')}
      >
        CONIS Office
      </button>

      <PilotProjectSelector />

      <nav className="office-sidebar__nav" aria-label="Office menu">
        {OFFICE_NAV_ITEMS.map((item) => {
          const isActive = activeRouteId === item.id;
          return (
            <a
              key={item.id}
              href={officeHref(item.id)}
              aria-current={isActive ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.id);
              }}
              className={
                isActive
                  ? 'office-sidebar__link office-sidebar__link--active'
                  : 'office-sidebar__link'
              }
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
