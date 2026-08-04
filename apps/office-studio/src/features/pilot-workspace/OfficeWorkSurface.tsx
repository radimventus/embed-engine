import { PilotWorkflowNavigator } from './PilotWorkflowNavigator';
import { PilotWorkingTerminal } from './PilotWorkingTerminal';

/**
 * CAP-OP-10A — Office work surface: Working Terminal + Workflow.
 * Global project context lives in the left rail (Select Project).
 */
export function OfficeWorkSurface() {
  return (
    <div
      className="office-work-surface"
      data-testid="office-work-surface"
      data-office-mode="work"
      data-mail-session="active"
      data-communication-platform="true"
    >
      <PilotWorkingTerminal />
      <PilotWorkflowNavigator />
    </div>
  );
}
