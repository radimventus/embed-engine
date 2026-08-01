import { useMemo, useState } from 'react';

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
 * VR-FIX-01 — Project-first Workspace (click-model visual grammar).
 * Firma is context; create only via circular ⊕; edit from Dashboard.
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
  const [pickerOpen, setPickerOpen] = useState(false);

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
    if (activeCompany === null) return [];
    return projectsForCompany(registry, activeCompany.id);
  }, [activeCompany, registry]);

  const contextLabel =
    activeCompany === null
      ? 'Vyberte projekt'
      : activeProject === null
        ? activeCompany.name
        : `${activeCompany.name} · ${activeProject.name}`;

  return (
    <aside
      className="sticky top-0 flex h-full flex-col overflow-y-auto border-r border-builder-line bg-white p-6"
      data-studio-shell="workspace-sidebar"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        aria-expanded={pickerOpen}
        onClick={() => setPickerOpen((open) => !open)}
      >
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#7D8796]">
          Projekt {pickerOpen ? '▲' : '▼'}
        </span>
      </button>

      <div className="mt-3 flex items-start gap-2">
        <div className="min-w-0 flex-1 rounded-xl border border-[#D7E4FF] bg-builder-panel px-3.5 py-3 text-sm font-semibold text-builder-ink">
          {contextLabel}
        </div>
        <button
          type="button"
          title="Nový projekt"
          aria-label="Nový projekt"
          disabled={switching}
          onClick={onCreateProject}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D7E4FF] bg-builder-panel text-lg font-semibold text-builder-navy hover:bg-white disabled:opacity-40"
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
        <div className="mb-4 rounded-[14px] border border-builder-navy/30 bg-builder-panel px-3 py-3 text-[12px]">
          <p className="font-semibold text-builder-ink">
            {dirtyPrompt.kind === 'close'
              ? 'Neuložené změny — zavřít projekt?'
              : `Neuložené změny — přepnout na ${dirtyPrompt.target.name}?`}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              disabled={switching}
              onClick={onDirtySave}
              className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Uložit
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={onDirtyDiscard}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              Zahodit
            </button>
            <button
              type="button"
              disabled={switching}
              onClick={onDirtyCancel}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

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
                    {activeCompany?.name ?? 'Firma'}
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
