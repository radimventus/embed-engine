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
      className="grid shrink-0 gap-5 border-b border-[var(--platform-cream-dark)] bg-white px-4 pb-4 pt-5"
      data-testid="sales-workspace-scope"
    >
      <div className="grid gap-2">
        <span
          className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-navy)]"
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
      <div className="grid gap-2" style={{ marginTop: 10 }}>
        <span
          className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--platform-navy)]"
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
