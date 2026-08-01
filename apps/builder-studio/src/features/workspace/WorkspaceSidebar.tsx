import { useEffect, useMemo, useState } from 'react';

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
  readonly onEditProject: () => void;
  readonly onDirtySave: () => void;
  readonly onDirtyDiscard: () => void;
  readonly onDirtyCancel: () => void;
};

/**
 * EPIC-BX-01 — Workspace: firma → projekty (bez technických pojmů).
 */
export function WorkspaceSidebar({
  registry,
  activeProject,
  switching,
  switchError,
  dirtyPrompt,
  onOpenProject,
  onCreateProject,
  onEditProject,
  onDirtySave,
  onDirtyDiscard,
  onDirtyCancel,
}: WorkspaceSidebarProps) {
  const activeCompanyId = activeProject?.companyId ?? registry.companies[0]?.id;
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<
    ReadonlySet<string>
  >(() => new Set(activeCompanyId !== undefined ? [activeCompanyId] : []));

  useEffect(() => {
    if (activeProject === null) {
      return;
    }
    setExpandedCompanyIds((prev) => {
      if (prev.has(activeProject.companyId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(activeProject.companyId);
      return next;
    });
  }, [activeProject]);

  const companies = useMemo(() => registry.companies, [registry.companies]);

  const toggleCompany = (companyId: string) => {
    setExpandedCompanyIds((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });
  };

  return (
    <aside className="h-full overflow-y-auto border-r border-builder-line bg-white p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Workspace
      </p>

      {switchError !== null && (
        <p className="mt-3 rounded-lg bg-builder-draftBg px-3 py-2 text-[12px] text-builder-draft">
          {switchError}
        </p>
      )}

      {dirtyPrompt !== null && (
        <div className="mt-4 rounded-lg border border-builder-navy/30 bg-builder-panel px-3 py-3 text-[12px]">
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

      <ul className="mt-5 space-y-3">
        {companies.map((company) => {
          const expanded = expandedCompanyIds.has(company.id);
          const projects = projectsForCompany(registry, company.id);
          return (
            <li key={company.id}>
              <button
                type="button"
                onClick={() => toggleCompany(company.id)}
                className="flex w-full items-center gap-2 rounded-[10px] px-2 py-1.5 text-left text-sm font-semibold text-builder-ink hover:bg-builder-hover"
                aria-expanded={expanded}
              >
                <span className="w-3 text-builder-muted" aria-hidden>
                  {expanded ? '▼' : '▶'}
                </span>
                <span>{company.name}</span>
              </button>

              {expanded && (
                <ul className="mt-1 space-y-1 border-l border-builder-lineSoft ml-3 pl-3">
                  {projects.map((project) => {
                    const active = project.id === registry.activeProjectId;
                    return (
                      <li key={project.id}>
                        <div
                          className={`group flex items-center gap-1 rounded-[10px] ${
                            active ? 'bg-builder-navy text-white' : ''
                          }`}
                        >
                          <button
                            type="button"
                            disabled={switching}
                            onClick={() => onOpenProject(project.id)}
                            className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm font-medium disabled:opacity-60 ${
                              active
                                ? 'text-white'
                                : 'text-builder-ink hover:bg-builder-hover rounded-[10px]'
                            }`}
                          >
                            {project.name}
                          </button>
                          {active && (
                            <button
                              type="button"
                              title="Upravit projekt"
                              aria-label="Upravit projekt"
                              disabled={switching}
                              onClick={onEditProject}
                              className="mr-1.5 rounded-md px-2 py-1 text-[13px] text-white/90 hover:bg-white/15 disabled:opacity-40"
                            >
                              ✎
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      disabled={switching}
                      onClick={onCreateProject}
                      className="w-full rounded-[10px] px-3 py-2 text-left text-sm font-medium text-builder-navy hover:bg-builder-panel disabled:opacity-40"
                    >
                      ＋ Nový projekt
                    </button>
                  </li>
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
