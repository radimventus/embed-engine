import { AppShell } from '../../components/layout/AppShell';
import { ManagerStudioPage } from './ManagerStudioPage';
import { ManagerStudioSidebar } from './ManagerStudioSidebar';

/**
 * Composition root for Manager Studio (MSCB-01 + EPIC-BX-11).
 * Platform Header comes from `@embed-engine/platform-shell` via AppShell.
 */
export function ManagerStudioApp() {
  return (
    <AppShell sidebar={<ManagerStudioSidebar />}>
      <ManagerStudioPage />
    </AppShell>
  );
}
