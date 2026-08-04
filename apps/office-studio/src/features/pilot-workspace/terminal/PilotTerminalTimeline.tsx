import {
  buildTimelinePlaceholders,
  type PilotWorkspaceCase,
} from '../../../office/pilotWorkspaceModel';

type PilotTerminalTimelineProps = {
  readonly activeCase: PilotWorkspaceCase | null;
};

/**
 * CAP-OP-02 — Timeline UI with Event Catalog placeholders (no runtime).
 */
export function PilotTerminalTimeline({
  activeCase,
}: PilotTerminalTimelineProps) {
  const events = buildTimelinePlaceholders(activeCase);

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-timeline"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Timeline</h3>
        <p className="office-pilot-ws__panel-body">
          Časová osa obchodního případu. Placeholder pro Event Catalog — bez
          Timeline Runtime.
        </p>
      </header>

      <ol
        className="office-pilot-timeline"
        data-testid="pilot-timeline-list"
      >
        {events.map((event) => (
          <li
            key={event.id}
            className="office-pilot-timeline__item"
            data-testid={`pilot-timeline-item-${event.id}`}
          >
            <span className="office-pilot-timeline__dot" aria-hidden="true" />
            <div>
              <p className="office-pilot-timeline__label">{event.label}</p>
              <p className="office-pilot-timeline__detail">{event.detail}</p>
              <p className="office-pilot-timeline__time">
                {event.occurredAtLabel}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
