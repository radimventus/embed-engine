import {
  buildCanveloIndicators,
  PILOT_WORKSPACE_CASE_STATUS_LABELS,
  type PilotWorkspaceCase,
  type PilotWorkspaceCaseId,
} from '../../../office/pilotWorkspaceModel';

type PilotTerminalListingProps = {
  readonly cases: readonly PilotWorkspaceCase[];
  readonly activeCaseId: PilotWorkspaceCaseId | null;
  readonly onSelectCase: (caseId: PilotWorkspaceCaseId) => void;
};

/**
 * CAP-OP-02 — Canvelo Výpis.
 * Each commercial case shown via discrete workflow indicators.
 * No progress bars · no dashboard metrics.
 */
export function PilotTerminalListing({
  cases,
  activeCaseId,
  onSelectCase,
}: PilotTerminalListingProps) {
  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-listing"
      data-canvelo="true"
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Výpis</h3>
        <p className="office-pilot-ws__panel-body">
          Canvelo přehled obchodních případů — workflow indikátory bez ukazatelů
          průběhu a bez metrických karet.
        </p>
      </header>

      <ul className="office-pilot-canvelo" data-testid="pilot-canvelo-list">
        {cases.map((item) => {
          const indicators = buildCanveloIndicators(item.status);
          const active = item.id === activeCaseId;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={
                  active
                    ? 'office-pilot-canvelo__row office-pilot-canvelo__row--active'
                    : 'office-pilot-canvelo__row'
                }
                data-testid={`pilot-canvelo-row-${item.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelectCase(item.id)}
              >
                <div className="office-pilot-canvelo__identity">
                  <span className="office-pilot-canvelo__label">
                    {item.label}
                  </span>
                  <span className="office-pilot-canvelo__status">
                    {PILOT_WORKSPACE_CASE_STATUS_LABELS[item.status]}
                  </span>
                </div>

                <ol
                  className="office-pilot-canvelo__steps"
                  aria-label={`Canvelo workflow · ${item.label}`}
                >
                  {indicators.map((step) => (
                    <li
                      key={step.id}
                      className={`office-pilot-canvelo__step office-pilot-canvelo__step--${step.state}`}
                      data-step={step.id}
                      data-state={step.state}
                      title={step.label}
                    >
                      <span className="office-pilot-canvelo__marker" />
                      <span className="office-pilot-canvelo__step-label">
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
