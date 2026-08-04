import { useMemo, useState } from 'react';

import {
  buildCanveloIndicators,
  filterCasesByWorkflowPhase,
  PILOT_CANVELO_STEPS,
  type PilotCanveloStepId,
  type PilotWorkspaceCase,
  type PilotWorkspaceCaseId,
} from '../../../office/pilotWorkspaceModel';

type PilotTerminalListingProps = {
  readonly cases: readonly PilotWorkspaceCase[];
  readonly activeCaseId: PilotWorkspaceCaseId | null;
  readonly onSelectCase: (caseId: PilotWorkspaceCaseId) => void;
};

/**
 * CAP-OP-10B — Výpis as Office working map.
 * Top Workflow phases filter the map; row click only sets active project.
 */
export function PilotTerminalListing({
  cases,
  activeCaseId,
  onSelectCase,
}: PilotTerminalListingProps) {
  const [phaseFilter, setPhaseFilter] = useState<PilotCanveloStepId | null>(
    null,
  );

  const visibleCases = useMemo(
    () => filterCasesByWorkflowPhase(cases, phaseFilter),
    [cases, phaseFilter],
  );

  return (
    <div
      className="office-pilot-terminal__view"
      data-testid="pilot-terminal-listing"
      data-canvelo="true"
      data-working-map="true"
      data-phase-filter={phaseFilter ?? 'all'}
    >
      <header className="office-pilot-terminal__view-head">
        <h3 className="office-pilot-ws__panel-title">Výpis</h3>
      </header>

      <div
        className="office-pilot-canvelo__phase-filter"
        role="toolbar"
        aria-label="Filtrovat podle Workflow fáze"
        data-testid="pilot-working-map-filter"
      >
        <button
          type="button"
          className={
            phaseFilter === null
              ? 'office-pilot-canvelo__phase office-pilot-canvelo__phase--active'
              : 'office-pilot-canvelo__phase'
          }
          data-testid="pilot-canvelo-phase-all"
          aria-pressed={phaseFilter === null}
          onClick={() => setPhaseFilter(null)}
        >
          Vše
        </button>
        {PILOT_CANVELO_STEPS.map((phase) => {
          const active = phaseFilter === phase.id;
          return (
            <button
              key={phase.id}
              type="button"
              className={
                active
                  ? 'office-pilot-canvelo__phase office-pilot-canvelo__phase--active'
                  : 'office-pilot-canvelo__phase'
              }
              data-testid={`pilot-canvelo-phase-${phase.id}`}
              data-phase={phase.id}
              aria-pressed={active}
              title={phase.label}
              onClick={() =>
                setPhaseFilter((current) =>
                  current === phase.id ? null : phase.id,
                )
              }
            >
              {phase.label}
            </button>
          );
        })}
      </div>

      {visibleCases.length === 0 ? (
        <p
          className="office-pilot-ws__panel-body"
          data-testid="pilot-canvelo-empty"
        >
          Žádné případy.
        </p>
      ) : (
        <ul className="office-pilot-canvelo" data-testid="pilot-canvelo-list">
          {visibleCases.map((item) => {
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
                  <span className="office-pilot-canvelo__label">
                    {item.label}
                  </span>

                  <ol
                    className="office-pilot-canvelo__steps"
                    aria-label={`Workflow · ${item.label}`}
                  >
                    {indicators.map((step) => (
                      <li
                        key={step.id}
                        className={`office-pilot-canvelo__step office-pilot-canvelo__step--${step.state}`}
                        data-step={step.id}
                        data-state={step.state}
                        title={step.label}
                      >
                        <span
                          className="office-pilot-canvelo__marker"
                          title={step.label}
                          aria-label={step.label}
                        />
                      </li>
                    ))}
                  </ol>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
