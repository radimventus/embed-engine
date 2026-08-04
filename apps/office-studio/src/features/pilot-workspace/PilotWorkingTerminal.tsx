import { PlatformCard, PlatformEmptyState } from '@embed-engine/platform-shell';

import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import {
  PILOT_TERMINAL_VIEWS,
  PILOT_WORKSPACE_CASE_STATUS_LABELS,
  type PilotTerminalViewId,
} from '../../office/pilotWorkspaceModel';
import { PilotTerminalDetail } from './terminal/PilotTerminalDetail';
import { PilotTerminalInbox } from './terminal/PilotTerminalInbox';
import { PilotTerminalListing } from './terminal/PilotTerminalListing';
import { PilotTerminalTimeline } from './terminal/PilotTerminalTimeline';
import { PilotTerminalWorkflow } from './terminal/PilotTerminalWorkflow';

/**
 * CAP-OP-02 — Working Terminal navigation + five working views.
 * Default open view: Inbox. Canonical tab order unchanged.
 */
export function PilotWorkingTerminal() {
  const {
    cases,
    activeCase,
    activeCaseId,
    terminalView,
    setTerminalView,
    selectCase,
  } = usePilotWorkspaceContext();

  return (
    <PlatformCard title="Working Terminal" className="office-pilot-ws__terminal">
      <div
        className="office-pilot-ws__terminal-shell"
        data-testid="pilot-working-terminal"
        data-terminal-view={terminalView}
      >
        <div
          className="office-pilot-ws__tabs"
          role="tablist"
          aria-label="Working Terminal"
          data-testid="pilot-terminal-tabs"
        >
          {PILOT_TERMINAL_VIEWS.map((view) => {
            const selected = view.id === terminalView;
            return (
              <button
                key={view.id}
                type="button"
                role="tab"
                id={`pilot-tab-${view.id}`}
                aria-selected={selected}
                data-testid={`pilot-terminal-tab-${view.id}`}
                className={
                  selected
                    ? 'office-pilot-ws__tab office-pilot-ws__tab--active'
                    : 'office-pilot-ws__tab'
                }
                onClick={() => setTerminalView(view.id)}
              >
                {view.label}
              </button>
            );
          })}
        </div>

        <div
          className="office-pilot-ws__terminal-body"
          role="tabpanel"
          aria-labelledby={`pilot-tab-${terminalView}`}
          data-testid={`pilot-terminal-panel-${terminalView}`}
        >
          <TerminalPanel
            view={terminalView}
            cases={cases}
            activeCase={activeCase}
            activeCaseId={activeCaseId}
            onSelectCase={selectCase}
          />
        </div>

        {activeCase !== null ? (
          <p
            className="office-pilot-ws__context-chip"
            data-testid="pilot-active-case"
          >
            Kontext · {activeCase.label} ·{' '}
            {PILOT_WORKSPACE_CASE_STATUS_LABELS[activeCase.status]}
          </p>
        ) : (
          <PlatformEmptyState
            title="Vyberte obchodní případ"
            description="Project Selector nebo Cases panel přepíná celý Workspace."
          />
        )}
      </div>
    </PlatformCard>
  );
}

function TerminalPanel({
  view,
  cases,
  activeCase,
  activeCaseId,
  onSelectCase,
}: {
  readonly view: PilotTerminalViewId;
  readonly cases: ReturnType<
    typeof usePilotWorkspaceContext
  >['cases'];
  readonly activeCase: ReturnType<
    typeof usePilotWorkspaceContext
  >['activeCase'];
  readonly activeCaseId: ReturnType<
    typeof usePilotWorkspaceContext
  >['activeCaseId'];
  readonly onSelectCase: ReturnType<
    typeof usePilotWorkspaceContext
  >['selectCase'];
}) {
  switch (view) {
    case 'listing':
      return (
        <PilotTerminalListing
          cases={cases}
          activeCaseId={activeCaseId}
          onSelectCase={(caseId) => onSelectCase(caseId)}
        />
      );
    case 'detail':
      return <PilotTerminalDetail activeCase={activeCase} />;
    case 'inbox':
      return <PilotTerminalInbox />;
    case 'timeline':
      return <PilotTerminalTimeline />;
    case 'workflow':
      return <PilotTerminalWorkflow activeCase={activeCase} />;
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}
