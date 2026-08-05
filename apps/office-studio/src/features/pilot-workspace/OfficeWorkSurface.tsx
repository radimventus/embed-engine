import { PilotWorkflowNavigator } from './PilotWorkflowNavigator';
import { PilotWorkingTerminal } from './PilotWorkingTerminal';

/**
 * CAP-OP-10A / PT-VR-01 — Office work surface: Working Terminal + Workflow.
 * Global project context lives in the left rail (Select Project).
 * Partner Commercial Journey is a separate left-nav route — not this surface.
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
