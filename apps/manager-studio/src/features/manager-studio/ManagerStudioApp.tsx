import { AppShell } from '../../components/layout/AppShell';
import { ManagerNavProvider } from './foundation/ManagerNavProvider';
import { ManagerStudioPage } from './ManagerStudioPage';
import { ManagerStudioSidebar } from './ManagerStudioSidebar';

/**
 * Composition root for Manager Studio (MSCB-01 + EPIC-BX-11 / BX-17).
 */
export function ManagerStudioApp() {
  return (
    <ManagerNavProvider>
      <AppShell sidebar={<ManagerStudioSidebar />}>
        <ManagerStudioPage />
      </AppShell>
    </ManagerNavProvider>
  );
}
