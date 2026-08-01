import { useMemo } from 'react';
import { PlatformDialog } from '@embed-engine/platform-shell';

import type { DirtySwitchPrompt } from './useWorkspaceController';
import {
  projectsForCompany,
  type WorkspaceProject,
  type WorkspaceRegistryState,
} from './workspaceRegistry';

type WorkspaceSidebarProps = {
  readonly registry: WorkspaceRegistryState;
  readonly activeProject: WorkspaceProject | null;
  readonly switching: boolean;
  readonly switchError: string | null;
  readonly dirtyPrompt: DirtySwitchPrompt | null;
  readonly onOpenProject: (projectId: string) => void;
  readonly onCreateProject: () => void;
  readonly onDirtySave: () => void;
  readonly onDirtyDiscard: () => void;
  readonly onDirtyCancel: () => void;
};

/**
 * PR-006 — Funkční selectbox Projekt + ⊕ pro nový projekt.
 */
export function WorkspaceSidebar({
  registry,
  activeProject,
  switching,
  switchError,
  dirtyPrompt,
  onOpenProject,
  onCreateProject,
  onDirtySave,
  onDirtyDiscard,
  onDirtyCancel,
}: WorkspaceSidebarProps) {
  const activeCompany = useMemo(() => {
    if (activeProject === null) {
      return registry.companies[0] ?? null;
    }
    return (
      registry.companies.find(
        (company) => company.id === activeProject.companyId,
      ) ?? null
    );
  }, [activeProject, registry.companies]);

  const projects = useMemo(() => {
    if (activeCompany === null) {
      return registry.projects;
    }
    return projectsForCompany(registry, activeCompany.id);
  }, [activeCompany, registry]);

  return (
    <aside
      className="flex h-full min-h-0 flex-col overflow-y-auto border-r border-builder-line bg-white p-6"
      data-studio-shell="workspace-sidebar"
    >
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#7D8796]">
          Projekt
        </span>
        <select
          className="mt-3 w-full rounded-xl border border-[#D7E4FF] bg-builder-panel px-3.5 py-3 text-sm font-semibold text-builder-ink"
          aria-label="Vybrat projekt"
          disabled={switching || projects.length === 0}
          value={activeProject?.id ?? ''}
          onChange={(event) => {
            const nextId = event.target.value;
            if (nextId.length === 0) return;
            onOpenProject(nextId);
          }}
        >
          {projects.length === 0 ? (
            <option value="">Žádné projekty</option>
          ) : (
            projects.map((project) => {
              const company =
                registry.companies.find((item) => item.id === project.companyId)
                  ?.name ?? 'Firma';
              return (
                <option key={project.id} value={project.id}>
                  {company} · {project.name}
                </option>
              );
            })
          )}
        </select>
      </label>

      <div className="mt-3 flex w-full justify-center">
        <button
          type="button"
          title="Nový projekt"
          aria-label="Nový projekt"
          disabled={switching}
          onClick={onCreateProject}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D7E4FF] bg-builder-panel text-lg font-semibold text-builder-navy hover:bg-white disabled:opacity-40"
        >
          ⊕
        </button>
      </div>

      <div className="my-5 border-t border-builder-line" />

      {switchError !== null && (
        <p className="mb-3 rounded-[10px] bg-builder-draftBg px-3 py-2 text-[12px] text-builder-draft">
          {switchError}
        </p>
      )}

      {dirtyPrompt !== null && (
        <PlatformDialog
          open
          title={
            dirtyPrompt.kind === 'close'
              ? 'Neuložené změny — zavřít projekt?'
              : `Neuložené změny — přepnout na ${dirtyPrompt.target.name}?`
          }
          description="Uložit změny, zahodit je, nebo zrušit přepnutí."
          primaryLabel="Uložit"
          secondaryLabel="Zahodit"
          busy={switching}
          onPrimary={onDirtySave}
          onSecondary={onDirtyDiscard}
          onClose={onDirtyCancel}
        />
      )}

      <p className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-[#7D8796]">
        Domy
      </p>
      <ul className="space-y-2">
        {projects.map((project) => {
          const active = project.id === registry.activeProjectId;
          return (
            <li key={project.id}>
              <button
                type="button"
                disabled={switching}
                onClick={() => onOpenProject(project.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition disabled:opacity-60 ${
                  active
                    ? 'bg-builder-navy text-white'
                    : 'text-builder-ink hover:bg-builder-hover'
                }`}
              >
                <span aria-hidden>⌂</span>
                <span className="min-w-0 truncate">
                  {project.name}
                  <small
                    className={`mt-0.5 block text-[11px] font-normal ${
                      active ? 'text-white/75' : 'text-builder-muted'
                    }`}
                  >
                    {activeCompany?.name ??
                      registry.companies.find((c) => c.id === project.companyId)
                        ?.name ??
                      'Firma'}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
        {projects.length === 0 && (
          <li className="px-1 text-sm text-builder-muted">
            Zatím žádné projekty.
          </li>
        )}
      </ul>
    </aside>
  );
}
