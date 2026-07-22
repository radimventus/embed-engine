import { AppShell } from '../../components/layout/AppShell';
import { ManagerStudioHeader } from './ManagerStudioHeader';
import { ManagerStudioPage } from './ManagerStudioPage';
import { ManagerStudioSidebar } from './ManagerStudioSidebar';

/**
 * Composition root for Manager Studio (MSCB-01).
 * Single AppShell entry for the Operations Terminal path.
 */
export function ManagerStudioApp() {
  return (
    <AppShell
      sidebar={<ManagerStudioSidebar />}
      header={<ManagerStudioHeader />}
    >
      <ManagerStudioPage />
    </AppShell>
  );
}
