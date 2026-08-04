import { PlatformCard, PlatformEmptyState } from '@embed-engine/platform-shell';

import { usePilotWorkspaceContext } from '../../office/PilotWorkspaceContext';
import {
  PILOT_TERMINAL_VIEWS,
  PILOT_WORKSPACE_CASE_STATUS_LABELS,
  type PilotTerminalViewId,
} from '../../office/pilotWorkspaceModel';

/**
 * CAP-OP-01 — Working Terminal with canonical views.
 * Default open view: Inbox. Tab order stays Výpis → Detail → Inbox → Timeline → Workflow.
 */
export function PilotWorkingTerminal() {
  const { activeCase, terminalView, setTerminalView } =
    usePilotWorkspaceContext();

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
          <TerminalPanel view={terminalView} />
        </div>

        {activeCase !== null ? (
          <p className="office-pilot-ws__context-chip" data-testid="pilot-active-case">
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

function TerminalPanel({ view }: { readonly view: PilotTerminalViewId }) {
  switch (view) {
    case 'listing':
      return (
        <ShellPanel
          title="Výpis"
          body="Kanonický výpis obchodního případu. Runtime přijde v PT-05."
        />
      );
    case 'detail':
      return (
        <ShellPanel
          title="Detail"
          body="Detail obchodního případu. Shell bez business logiky."
        />
      );
    case 'inbox':
      return (
        <ShellPanel
          title="Inbox"
          body="Výchozí pohled Working Terminalu. Inbox Runtime je mimo scope PT-04."
          testId="pilot-inbox-default"
        />
      );
    case 'timeline':
      return (
        <ShellPanel
          title="Timeline"
          body="Timeline shell — bez Timeline Runtime."
        />
      );
    case 'workflow':
      return (
        <ShellPanel
          title="Workflow"
          body="Workflow pohled v terminálu — pravý panel zůstává samostatný navigator."
        />
      );
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

function ShellPanel({
  title,
  body,
  testId,
}: {
  readonly title: string;
  readonly body: string;
  readonly testId?: string;
}) {
  return (
    <div className="office-pilot-ws__panel" data-testid={testId}>
      <h3 className="office-pilot-ws__panel-title">{title}</h3>
      <p className="office-pilot-ws__panel-body">{body}</p>
    </div>
  );
}
