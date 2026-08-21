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
  readonly onRecoverDefaultHouses: () => void;
  readonly recoveryMessage: string | null;
  readonly onEditProject: () => void;
  readonly onDirtySave: () => void;
  readonly onDirtyDiscard: () => void;
  readonly onDirtyCancel: () => void;
};

/** PR-024/026 — large + · white fill · Interaction Blue border · hover invert. */
const PLUS_BTN_CLASS = 'platform-plus-btn';

/** The exact DOMY collection rendered by the workspace sidebar. */
export function getWorkspaceSidebarHouses(
  registry: WorkspaceRegistryState,
): readonly WorkspaceProject[] {
  const activeFolder = getActiveWorkspaceFolder(registry);
  return activeFolder === null ? [] : housesForFolder(registry, activeFolder.id);
}

/**
 * PR-024 — Cream Light rail · object cards · unified ⊕.
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
  onRecoverDefaultHouses,
  recoveryMessage,
  onEditProject,
  onDirtySave,
  onDirtyDiscard,
  onDirtyCancel,
}: WorkspaceSidebarProps) {
  void _activeProject;

  const activeFolder = useMemo(
    () => getActiveWorkspaceFolder(registry),
    [registry],
  );

  const houses = useMemo(() => getWorkspaceSidebarHouses(registry), [registry]);

  return (
    <aside
      className="flex h-full min-h-0 flex-col overflow-y-auto border-r-2 border-builder-creamDark bg-builder-creamLight p-6"
      data-studio-shell="workspace-sidebar"
    >
      <label className="block">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[#7D8796]">
          Projekt
        </span>
        <select
          className="mt-3 w-full rounded-xl border border-[#E3E3E3] bg-white px-3.5 py-3 text-sm font-semibold text-builder-ink"
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
          className={PLUS_BTN_CLASS}
        >
          +
        </button>
      </div>

      <button
        type="button"
        className="platform-btn mt-3 w-full"
        disabled={activeFolder === null || switching}
        data-testid="workspace-edit-project"
        onClick={onEditProject}
      >
        Upravit projekt
      </button>

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
                className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition ${
                  active
                    ? 'border-builder-blue bg-builder-creamLight text-builder-ink'
                    : 'border-[#E3E3E3] bg-white text-builder-ink hover:border-builder-blue hover:bg-builder-blue hover:text-white'
                } ${switching ? 'opacity-70' : ''}`}
              >
                <span aria-hidden>⌂</span>
                <span className="min-w-0 truncate">
                  {house.name}
                  <small
                    className={`mt-0.5 block text-[11px] font-normal ${
                      active
                        ? 'text-builder-ink/80'
                        : 'text-builder-ink/70 group-hover:text-white/80'
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
          <li className="px-1 text-sm text-builder-ink">
            V tomto projektu zatím nejsou domy.
          </li>
        )}
      </ul>

      <div className="mt-3 flex w-full flex-col items-center gap-2">
        <button
          type="button"
          title="Doplnit výchozí domy"
          aria-label="Doplnit výchozí domy"
          disabled={activeFolder === null || switching}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRecoverDefaultHouses();
          }}
          className="w-full rounded-md border border-builder-ink/20 px-3 py-2 text-sm text-builder-ink hover:bg-builder-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Doplnit výchozí domy
        </button>
        {recoveryMessage !== null && (
          <p className="px-1 text-center text-xs text-builder-ink/80">
            {recoveryMessage}
          </p>
        )}
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
          className={PLUS_BTN_CLASS}
        >
          +
        </button>
      </div>
    </aside>
  );
}
