import {
  createWorkspaceHouseChangeMessage,
  createWorkspaceProjectChangeMessage,
  listCanonicalProjects,
  listWorkspaceHouses,
  resolveWorkspaceHostHref,
  usePlatformSession,
} from '@embed-engine/platform-access';
import { PlatformScopeSelect } from '@embed-engine/platform-shell';

function publishWorkspaceScope(
  message:
    | ReturnType<typeof createWorkspaceProjectChangeMessage>
    | ReturnType<typeof createWorkspaceHouseChangeMessage>,
): void {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage(
    message,
    new URL(resolveWorkspaceHostHref()).origin,
  );
}

/** Shared Partner Environment Project and House scope controls for Manager. */
export function ManagerWorkspaceScopeControls() {
  const { session, updateWorkspaceScope } = usePlatformSession();
  const projectId = session?.projectId ?? null;
  const activeHouseId = session?.activeHouseId ?? null;
  const projects = listCanonicalProjects();
  const houses = projectId === null ? [] : listWorkspaceHouses(projectId);

  return (
    <section
      className="grid shrink-0 gap-5 border-b border-[var(--platform-cream-dark)] bg-[var(--platform-cream-light)] px-4 pb-6 pt-5"
      data-testid="manager-workspace-scope"
    >
      <label className="grid gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-section)]">
          Projekt
        </span>
        <PlatformScopeSelect
          ariaLabel="Manager projekt"
          value={projectId ?? ''}
          options={projects.map((project) => ({
            value: project.project.projectId,
            label: project.project.name,
          }))}
          onChange={(nextProjectId) => {
            updateWorkspaceScope({
              projectId: nextProjectId,
              activeHouseId: null,
            });
            publishWorkspaceScope(
              createWorkspaceProjectChangeMessage(nextProjectId),
            );
          }}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-section)]">
          Objekt
        </span>
        <PlatformScopeSelect
          ariaLabel="Manager objekt"
          value={activeHouseId ?? ''}
          options={[
            { value: '', label: 'Celý projekt' },
            ...houses.map((house) => ({
              value: house.houseId,
              label: house.name,
            })),
          ]}
          onChange={(nextHouseId) => {
            if (
              nextHouseId.length > 0 &&
              !houses.some((house) => house.houseId === nextHouseId)
            ) {
              return;
            }
            updateWorkspaceScope({
              activeHouseId: nextHouseId.length > 0 ? nextHouseId : null,
            });
            publishWorkspaceScope(
              createWorkspaceHouseChangeMessage(
                nextHouseId.length > 0 ? nextHouseId : null,
              ),
            );
          }}
        />
      </label>
    </section>
  );
}
