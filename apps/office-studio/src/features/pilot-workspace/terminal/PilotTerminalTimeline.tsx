import { usePilotWorkspaceContext } from '../../../office/PilotWorkspaceContext';
import {
  formatTimelineDateTime,
  formatTimelineTime,
  PILOT_TIMELINE_EVENT_ICONS,
  PILOT_TIMELINE_EVENT_KIND_LABELS,
  type PilotTimelineEvent,
} from '../../../office/pilotTimelineModel';

/**
 * CAP-OP-04 — Timeline Runtime renderer + event detail.
 * Reacts to PilotWorkspaceProvider active commercial case.
 */
export function PilotTerminalTimeline() {
  const {
    activeCase,
    timeline,
    selectTimelineEvent,
    clearTimelineSelection,
  } = usePilotWorkspaceContext();

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-timeline"
      data-timeline-runtime="true"
      data-timeline-case={timeline.caseId ?? ''}
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Timeline</h3>
        <p className="office-pilot-ws__panel-body">
          {activeCase === null
            ? 'Vyberte obchodní případ — Timeline je projekcí Event Catalog.'
            : `Události · ${activeCase.label}`}
        </p>
      </header>

      {activeCase === null ? (
        <p className="office-pilot-ws__panel-body" data-testid="pilot-timeline-empty-case">
          Žádný aktivní obchodní případ ve Shared Context.
        </p>
      ) : timeline.groups.length === 0 ? (
        <p className="office-pilot-ws__panel-body" data-testid="pilot-timeline-empty">
          Pro tento obchodní případ zatím nejsou žádné události.
        </p>
      ) : (
        <div className="office-pilot-timeline" data-testid="pilot-timeline-list">
          {timeline.groups.map((group) => (
            <section
              key={group.dayKey}
              className="office-pilot-timeline__day"
              data-testid={`pilot-timeline-day-${group.dayKey}`}
            >
              <h4 className="office-pilot-timeline__day-label">{group.dayLabel}</h4>
              <ol className="office-pilot-timeline__day-list">
                {group.events.map((event) => (
                  <TimelineEventRow
                    key={event.id}
                    event={event}
                    active={event.id === timeline.selectedEventId}
                    onSelect={() => selectTimelineEvent(event.id)}
                  />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {timeline.selectedEvent !== null ? (
        <EventDetail
          event={timeline.selectedEvent}
          onClose={clearTimelineSelection}
        />
      ) : null}

      <p
        className="office-pilot-inbox__timeline-slot"
        data-testid="pilot-timeline-catalog-slot"
        data-event-catalog="ready"
      >
        Event Catalog interface připraven (`PilotEventCatalog`) — napojení v
        PT-08.
      </p>
    </div>
  );
}

function TimelineEventRow({
  event,
  active,
  onSelect,
}: {
  readonly event: PilotTimelineEvent;
  readonly active: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={
          active
            ? 'office-pilot-timeline__item office-pilot-timeline__item--active'
            : 'office-pilot-timeline__item'
        }
        data-testid={`pilot-timeline-item-${event.id}`}
        data-event-kind={event.kind}
        aria-current={active ? 'true' : undefined}
        onClick={onSelect}
      >
        <span
          className="office-pilot-timeline__icon"
          aria-hidden="true"
          data-kind={event.kind}
        >
          {PILOT_TIMELINE_EVENT_ICONS[event.kind]}
        </span>
        <span className="office-pilot-timeline__body">
          <span className="office-pilot-timeline__label">
            {PILOT_TIMELINE_EVENT_KIND_LABELS[event.kind]}
          </span>
          <span className="office-pilot-timeline__detail">{event.summary}</span>
          <time
            className="office-pilot-timeline__time"
            dateTime={event.occurredAt}
          >
            {formatTimelineTime(event.occurredAt)}
          </time>
        </span>
      </button>
    </li>
  );
}

function EventDetail({
  event,
  onClose,
}: {
  readonly event: PilotTimelineEvent;
  readonly onClose: () => void;
}) {
  return (
    <aside
      className="office-pilot-timeline__detail-panel"
      data-testid="pilot-timeline-event-detail"
      data-event-id={event.id}
    >
      <div className="office-pilot-timeline__detail-head">
        <h4>{PILOT_TIMELINE_EVENT_KIND_LABELS[event.kind]}</h4>
        <button
          type="button"
          className="platform-btn platform-btn--secondary"
          data-testid="pilot-timeline-detail-close"
          onClick={onClose}
        >
          Zavřít
        </button>
      </div>
      <dl className="office-pilot-timeline__detail-rows">
        <div>
          <dt>Čas</dt>
          <dd>{formatTimelineDateTime(event.occurredAt)}</dd>
        </div>
        <div>
          <dt>Typ</dt>
          <dd>
            <code>{event.kind}</code>
          </dd>
        </div>
        <div>
          <dt>Souhrn</dt>
          <dd>{event.summary}</dd>
        </div>
        <div>
          <dt>Detail</dt>
          <dd>{event.detail}</dd>
        </div>
      </dl>
      <p className="office-pilot-timeline__detail-note">
        Pouze čtení — bez editace události.
      </p>
    </aside>
  );
}
