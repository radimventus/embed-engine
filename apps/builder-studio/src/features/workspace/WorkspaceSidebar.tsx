import { useMemo } from 'react';
import { PlatformDialog } from '@embed-engine/platform-shell';

import type { DirtySwitchPrompt } from './useWorkspaceController';
import {
  getActiveWorkspaceFolder,
  housesForFolder,
  type WorkspaceProject,
  type WorkspaceRegistryState,
} from './workspaceRegistry';

type WorkspaceSidebarProps = {
  readonly registry: WorkspaceRegistryState;
  readonly activeProject: WorkspaceProject | null;
  readonly switching: boolean;
  readonly switchError: string | null;
  readonly dirtyPrompt: DirtySwitchPrompt | null;
  readonly onOpenFolder: (folderId: string) => void;
  readonly onOpenHouse: (houseId: string) => void;
  readonly onCreateProject: () => void;
  readonly onDirtySave: () => void;
  readonly onDirtyDiscard: () => void;
  readonly onDirtyCancel: () => void;
};

/**
 * PR-006 — Selectbox Projekt · ⊕ nový projekt · levý seznam pouze Domy.
 */
export function WorkspaceSidebar({
  registry,
  activeProject: _activeProject,
  switching,
  switchError,
  dirtyPrompt,
  onOpenFolder,
  onOpenHouse,
  onCreateProject,
  onDirtySave,
  onDirtyDiscard,
  onDirtyCancel,
}: WorkspaceSidebarProps) {
  void _activeProject;

  const activeFolder = useMemo(
    () => getActiveWorkspaceFolder(registry),
    [registry],
  );

  const houses = useMemo(() => {
    if (activeFolder === null) return [];
    return housesForFolder(registry, activeFolder.id);
  }, [activeFolder, registry]);

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
          className="mt-3 w-full rounded-xl border border-builder-panelBorder bg-builder-panel px-3.5 py-3 text-sm font-semibold text-builder-ink"
          aria-label="Vybrat projekt"
          disabled={registry.folders.length === 0}
          value={registry.activeFolderId ?? ''}
          onChange={(event) => {
            const nextId = event.target.value;
            if (nextId.length === 0) return;
            onOpenFolder(nextId);
          }}
        >
          {registry.folders.length === 0 ? (
            <option value="">Žádné projekty</option>
          ) : (
            registry.folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))
          )}
        </select>
      </label>

      <div className="mt-3 flex w-full justify-center">
        <button
          type="button"
          title="Nový projekt"
          aria-label="Nový projekt"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onCreateProject();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-builder-panelBorder bg-builder-panel text-lg font-semibold text-builder-navy hover:bg-white"
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
              ? 'Neuložené změny — zavřít dům?'
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
        {houses.map((house) => {
          const active = house.id === registry.activeProjectId;
          return (
            <li key={house.id}>
              <button
                type="button"
                onClick={() => onOpenHouse(house.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                  active
                    ? 'bg-builder-navy text-white'
                    : 'text-builder-ink hover:bg-builder-hover'
                } ${switching ? 'opacity-70' : ''}`}
              >
                <span aria-hidden>⌂</span>
                <span className="min-w-0 truncate">
                  {house.name}
                  <small
                    className={`mt-0.5 block text-[11px] font-normal ${
                      active ? 'text-white/75' : 'text-builder-muted'
                    }`}
                  >
                    {activeFolder?.name ?? 'Projekt'}
                  </small>
                </span>
              </button>
            </li>
          );
        })}
        {houses.length === 0 && (
          <li className="px-1 text-sm text-builder-muted">
            V tomto projektu zatím nejsou domy.
          </li>
        )}
      </ul>
    </aside>
  );
}
