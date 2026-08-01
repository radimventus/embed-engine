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
  readonly onCreateObject: () => void;
  readonly onDirtySave: () => void;
  readonly onDirtyDiscard: () => void;
  readonly onDirtyCancel: () => void;
};

/**
 * PR-006 / PR-023 / PR-022C — Cream Light rail + Cream Dark border.
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
  onCreateObject,
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
      className="flex h-full min-h-0 flex-col overflow-y-auto border-r-2 border-builder-creamDark bg-builder-creamLight p-6"
      style={{ backgroundColor: '#F7F6F4', borderRightColor: '#D9D4CC' }}
      data-studio-shell="workspace-sidebar"
    >
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#7D8796]">
          Projekt
        </span>
        <select
          className="mt-3 w-full rounded-xl border border-builder-creamDark bg-white px-3.5 py-3 text-sm font-semibold text-builder-ink"
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-builder-blue bg-builder-blue text-lg font-semibold text-white hover:bg-builder-blueHover"
        >
          ⊕
        </button>
      </div>

      <div className="my-5 border-t border-builder-creamDark" />

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
                className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition ${
                  active
                    ? 'border-builder-blue bg-builder-creamLight text-builder-blue'
                    : 'border-transparent text-builder-ink hover:bg-builder-creamMid'
                } ${switching ? 'opacity-70' : ''}`}
                style={
                  active
                    ? {
                        backgroundColor: '#F7F6F4',
                        borderColor: '#18428F',
                        color: '#18428F',
                      }
                    : undefined
                }
              >
                <span aria-hidden>⌂</span>
                <span className="min-w-0 truncate">
                  {house.name}
                  <small
                    className={`mt-0.5 block text-[11px] font-normal ${
                      active ? 'text-builder-blue/80' : 'text-builder-muted'
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

      <div className="mt-3 flex w-full justify-center">
        <button
          type="button"
          title="Nový objekt"
          aria-label="Nový objekt"
          disabled={activeFolder === null || switching}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onCreateObject();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-builder-blue bg-white text-lg font-semibold text-builder-blue hover:bg-builder-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white disabled:hover:text-builder-blue"
        >
          ⊕
        </button>
      </div>
    </aside>
  );
}
