import { PlatformCard } from '@embed-engine/platform-shell';

/**
 * CAP-OP-01 — Right Workflow Navigator (shell only, no logic).
 */
export function PilotWorkflowNavigator() {
  return (
    <PlatformCard title="Workflow" className="office-pilot-ws__workflow">
      <div
        className="office-pilot-ws__workflow-shell"
        data-testid="pilot-workflow-navigator"
      >
        <p className="office-pilot-ws__shell-note">
          Workflow Navigator — shell připravený pro PT-05. Bez runtime logiky.
        </p>
        <ol className="office-pilot-ws__workflow-steps" aria-hidden="true">
          <li>Nabídka</li>
          <li>Objednávka</li>
          <li>Proforma</li>
          <li>Platba</li>
          <li>Pilot Ready</li>
        </ol>
      </div>
    </PlatformCard>
  );
}
