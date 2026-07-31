import type { WorkspaceProject, WorkspaceRegistryState } from './workspaceRegistry';
import type { DirtySwitchPrompt } from './useWorkspaceController';

type WorkspaceSidebarProps = {
  readonly registry: WorkspaceRegistryState;
  readonly activeProject: WorkspaceProject | null;
  readonly switching: boolean;
  readonly switchError: string | null;
  readonly dirtyPrompt: DirtySwitchPrompt | null;
  readonly onOpenProject: (projectId: string) => void;
  readonly onCloseProject: () => void;
  readonly onDirtySave: () => void;
  readonly onDirtyDiscard: () => void;
  readonly onDirtyCancel: () => void;
};

/**
 * CAP-BLD-08 — workspace project list (metadata only).
 */
export function WorkspaceSidebar({
  registry,
  activeProject,
  switching,
  switchError,
  dirtyPrompt,
  onOpenProject,
  onCloseProject,
  onDirtySave,
  onDirtyDiscard,
  onDirtyCancel,
}: WorkspaceSidebarProps) {
  return (
    <aside className="h-full overflow-y-auto border-r border-builder-line bg-white p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Workspace
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">Projects</h2>
      <p className="mt-2 text-[12px] text-builder-muted">
        Each project → one HP-002 root
      </p>

      {activeProject !== null ? (
        <div className="mt-4 rounded-lg border border-[#E8EEF5] bg-builder-canvas px-3 py-2 text-[12px]">
          <p className="font-semibold text-builder-ink">{activeProject.name}</p>
          <p className="mt-1 break-all font-mono text-[11px] text-builder-muted">
            {activeProject.packageRoot}
          </p>
          <button
            type="button"
            disabled={switching}
            onClick={onCloseProject}
            className="mt-2 text-[12px] font-medium text-builder-navy disabled:opacity-40"
          >
            Close project
          </button>
        </div>
      ) : (
        <p className="mt-4 text-[12px] text-builder-draft">No project open.</p>
      )}

      {switchError !== null && (
        <p className="mt-3 rounded-lg bg-builder-draftBg px-3 py-2 text-[12px] text-builder-draft">
          {switchError}
        </p>
      )}

      {dirtyPrompt !== null && (
        <div className="mt-4 rounded-lg border border-builder-navy/30 bg-builder-panel px-3 py-3 text-[12px]">
          <p className="font-semibold text-builder-ink">
            {dirtyPrompt.kind === 'close'
              ? 'Unsaved changes — close project?'
              : `Unsaved changes — switch to ${dirtyPrompt.target.name}?`}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              disabled={switching}
              onClick={onDirtySave}
              className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={onDirtyDiscard}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={onDirtyCancel}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Open
      </p>
      <ul className="mt-2 space-y-1.5">
        {registry.projects.map((project) => {
          const active = project.id === registry.activeProjectId;
          return (
            <li key={project.id}>
              <button
                type="button"
                disabled={switching || active}
                onClick={() => onOpenProject(project.id)}
                className={`w-full rounded-[10px] border px-3.5 py-2.5 text-left text-sm font-medium disabled:opacity-60 ${
                  active
                    ? 'border-builder-navy bg-builder-navy text-white'
                    : 'border-[#DDE5EF] bg-white text-builder-ink'
                }`}
              >
                <span className="block">{project.name}</span>
                <span
                  className={`mt-0.5 block font-mono text-[10px] ${
                    active ? 'text-white/80' : 'text-builder-muted'
                  }`}
                >
                  {project.packageRoot.replace(
                    'apps/client-studio/public/',
                    '',
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {registry.recentProjectIds.length > 0 && (
        <>
          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Recent
          </p>
          <ul className="mt-2 space-y-1 text-[12px] text-builder-muted">
            {registry.recentProjectIds.map((id) => {
              const project = registry.projects.find((item) => item.id === id);
              if (project === undefined) {
                return null;
              }
              return (
                <li key={`recent-${id}`}>
                  <button
                    type="button"
                    disabled={switching}
                    onClick={() => onOpenProject(id)}
                    className="text-left font-medium text-builder-navy disabled:opacity-40"
                  >
                    {project.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {registry.lastOpenedProjectId !== null && (
        <p className="mt-6 text-[11px] text-builder-muted">
          Last opened ·{' '}
          {registry.projects.find(
            (project) => project.id === registry.lastOpenedProjectId,
          )?.name ?? registry.lastOpenedProjectId}
        </p>
      )}
    </aside>
  );
}
