import { CommercialJourneySurface } from './features/pilot-workspace/CommercialJourneySurface';
import { PilotWorkspaceProvider } from './office/PilotWorkspaceContext';

/**
 * TASK-82 — partner-facing reuse of the existing Commercial Journey runtime.
 *
 * Deliberately excludes:
 * - Office Studio PlatformShell
 * - Office Sidebar
 * - Office navigation
 * - Office operator surfaces
 *
 * Business/runtime authority remains PilotWorkspaceProvider + existing
 * Commercial Journey screens. This is reuse, not a second journey.
 */
export function PartnerCommercialJourneyApp() {
  return (
    <PilotWorkspaceProvider>
      <div
        className="office-workspace office-workspace--partner-commercial-journey"
        data-testid="partner-commercial-journey-app"
      >
        <main
          className="platform-studio-pad office-workspace__main office-workspace__main--work"
          style={{ width: '100%', maxWidth: 'none' }}
        >
          <CommercialJourneySurface />
        </main>
      </div>
    </PilotWorkspaceProvider>
  );
}
