import { PilotWorkspaceProvider } from '../../office/PilotWorkspaceContext';
import { PilotCasesPanel } from './PilotCasesPanel';
import { PilotProjectSelector } from './PilotProjectSelector';
import { PilotWorkflowNavigator } from './PilotWorkflowNavigator';
import { PilotWorkingTerminal } from './PilotWorkingTerminal';

/**
 * CAP-OP-01 / PT-04 — Office Pilot Workspace Shell.
 * Layout: Cases | Working Terminal | Workflow. Default terminal view: Inbox.
 */
export function PilotWorkspacePage() {
  return (
    <PilotWorkspaceProvider>
      <div
        className="office-pilot-ws"
        data-testid="pilot-workspace"
        data-office-mode="pilot-workspace"
      >
        <header className="office-dashboard__header">
          <p className="office-dashboard__eyebrow">Office · Pilot Workspace</p>
          <h1 className="office-dashboard__title">Pilot Workspace</h1>
          <p className="office-dashboard__lead">
            Pracovní režim nad obchodními případy. Shell připravený pro Inbox /
            Timeline / Workflow runtime (PT-05+).
          </p>
        </header>

        <PilotProjectSelector />

        <div className="office-pilot-ws__grid" data-testid="pilot-workspace-grid">
          <PilotCasesPanel />
          <PilotWorkingTerminal />
          <PilotWorkflowNavigator />
        </div>
      </div>
    </PilotWorkspaceProvider>
  );
}
