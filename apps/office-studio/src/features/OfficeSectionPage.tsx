import { PlatformCard } from '@embed-engine/platform-shell';

import {
  formatOfficeEventTime,
  listRecentOfficeEvents,
} from '../office/officeEventCatalog';
import type { OfficeRouteId } from '../office/officeRoutes';
import { officeRouteLabel } from '../office/officeRoutes';

type OfficeSectionPageProps = {
  readonly routeId: Extract<OfficeRouteId, 'activity'>;
};

/**
 * OF-01 — Functional section shells for prepared routes.
 * Dedicated workspaces cover Partner / Sales / Documents / Implementation / Pilot Runtime.
 */
export function OfficeSectionPage({ routeId }: OfficeSectionPageProps) {
  const label = officeRouteLabel(routeId);
  const events = listRecentOfficeEvents(12);

  return (
    <div className="office-section" data-testid={`office-section-${routeId}`}>
      <header className="office-dashboard__header">
        <p className="office-dashboard__eyebrow">{label}</p>
        <h1 className="office-dashboard__title">{label}</h1>
        <p className="office-dashboard__lead">
          Kompletní provozní aktivita z Event Catalog.
        </p>
      </header>
      <PlatformCard title="Poslední události">
        <ul className="office-list">
          {events.map((event) => (
            <li key={event.id} className="office-list__item">
              <div>
                <p className="office-list__title">{event.label}</p>
                <p className="office-list__meta">{event.detail}</p>
              </div>
              <span className="office-list__meta">
                {formatOfficeEventTime(event.occurredAt)}
              </span>
            </li>
          ))}
        </ul>
      </PlatformCard>
    </div>
  );
}
