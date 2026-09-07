import {
  createWorkspaceHouseChangeMessage,
  isHouseInProject,
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
  message: ReturnType<typeof createWorkspaceHouseChangeMessage>,
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
  const houses =
    activeProjectId === null ? [] : listWorkspaceHouses(activeProjectId);

  return (
    <section
      className="sales-workspace-scope"
      data-testid="sales-workspace-scope"
    >
      <div className="sales-workspace-scope__field sales-workspace-scope__field--house">
        <span
          className="sales-workspace-scope__label"
          style={{ paddingLeft: SCOPE_TEXT_INSET_PX }}
        >
          Dům
        </span>
        <PlatformScopeSelect
          ariaLabel="Sales dům"
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
