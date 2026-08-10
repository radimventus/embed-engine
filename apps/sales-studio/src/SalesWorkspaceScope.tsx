import {
  createWorkspaceHouseChangeMessage,
  createWorkspaceProjectChangeMessage,
  isHouseInProject,
  listCanonicalProjects,
  listWorkspaceHouses,
  resolveWorkspaceHostHref,
  usePlatformSession,
} from '@embed-engine/platform-access';
import { PlatformScopeSelect } from '@embed-engine/platform-shell';

/** Mirrors PlatformScopeSelect's trigger text padding. */
const SCOPE_TEXT_INSET_PX = 14;

type SalesWorkspaceScopeProps = {
  readonly activeProjectId: string | null;
  readonly activeHouseId: string | null;
};

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

/** Shared Partner Environment Project and House scope controls for Sales. */
export function SalesWorkspaceScope({
  activeProjectId,
  activeHouseId,
}: SalesWorkspaceScopeProps) {
  const { updateWorkspaceScope } = usePlatformSession();
  const projects = listCanonicalProjects();
  const houses =
    activeProjectId === null ? [] : listWorkspaceHouses(activeProjectId);

  return (
    <section
      className="sales-workspace-scope"
      data-testid="sales-workspace-scope"
    >
      <div className="sales-workspace-scope__field">
        <span
          className="sales-workspace-scope__label"
          style={{ paddingLeft: SCOPE_TEXT_INSET_PX }}
        >
          Projekt
        </span>
        <PlatformScopeSelect
          ariaLabel="Sales projekt"
          value={activeProjectId ?? ''}
          options={projects.map((project) => ({
            value: project.project.projectId,
            label: project.project.name,
          }))}
          onChange={(nextProjectId) => {
            updateWorkspaceScope({ projectId: nextProjectId });
            publishWorkspaceScope(
              createWorkspaceProjectChangeMessage(nextProjectId),
            );
          }}
        />
      </div>
      <div className="sales-workspace-scope__field sales-workspace-scope__field--house">
        <span
          className="sales-workspace-scope__label"
          style={{ paddingLeft: SCOPE_TEXT_INSET_PX }}
        >
          Objekt
        </span>
        <PlatformScopeSelect
          ariaLabel="Sales objekt"
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
              (activeProjectId === null ||
                !isHouseInProject(nextHouseId, activeProjectId))
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
      </div>
    </section>
  );
}
