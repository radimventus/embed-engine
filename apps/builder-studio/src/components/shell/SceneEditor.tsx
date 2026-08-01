import type { Scene } from '../../model';

type SceneEditorProps = {
  readonly scenes: readonly Scene[];
  readonly selectedSceneId: string | null;
  readonly onSelectScene: (sceneId: string) => void;
  readonly onAddScene: () => void;
  readonly onRenameScene: (sceneId: string, title: string) => void;
  readonly onMoveScene: (sceneId: string, direction: 'up' | 'down') => void;
  readonly onRemoveScene: (sceneId: string) => void;
};

/**
 * Scene Editor (EPIC-BLD-09).
 * Add / rename / reorder / remove — structure only.
 */
export function SceneEditor({
  scenes,
  selectedSceneId,
  onSelectScene,
  onAddScene,
  onRenameScene,
  onMoveScene,
  onRemoveScene,
}: SceneEditorProps) {
  const ordered = [...scenes].sort((a, b) => a.order - b.order);

  return (
    <section aria-labelledby="scene-editor-heading">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3
            id="scene-editor-heading"
            className="text-base font-semibold text-builder-ink"
          >
            Scény
          </h3>
          <p className="mt-1 text-[13px] text-builder-muted">
            Logické části Experience — bez Runtime interpretace.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddScene}
          className="rounded-[10px] border border-builder-blue bg-builder-blue px-3.5 py-2 text-sm font-medium text-white"
        >
          + Scéna
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {ordered.map((scene, index) => {
          const isSelected = scene.sceneId === selectedSceneId;
          return (
            <li
              key={scene.sceneId}
              className={`rounded-[12px] border px-3 py-2.5 ${
                isSelected
                  ? 'border-builder-navy bg-[#F3F6FB]'
                  : 'border-[#DDE5EF] bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectScene(scene.sceneId)}
                  className="w-7 shrink-0 text-[12px] font-semibold text-builder-muted"
                  aria-label={`Vybrat scénu ${scene.title}`}
                >
                  {index + 1}
                </button>
                <input
                  type="text"
                  value={scene.title}
                  onFocus={() => onSelectScene(scene.sceneId)}
                  onChange={(event) =>
                    onRenameScene(scene.sceneId, event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-[8px] border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-builder-ink outline-none focus:border-[#DDE5EF] focus:bg-white"
                />
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => onMoveScene(scene.sceneId, 'up')}
                    className="rounded-md border border-[#DDE5EF] px-2 py-1 text-[11px] disabled:opacity-40"
                    aria-label="Posunout nahoru"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === ordered.length - 1}
                    onClick={() => onMoveScene(scene.sceneId, 'down')}
                    className="rounded-md border border-[#DDE5EF] px-2 py-1 text-[11px] disabled:opacity-40"
                    aria-label="Posunout dolů"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={ordered.length <= 1}
                    onClick={() => onRemoveScene(scene.sceneId)}
                    className="rounded-md border border-[#DDE5EF] px-2 py-1 text-[11px] text-builder-muted disabled:opacity-40"
                    aria-label="Odstranit scénu"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p className="mt-1 pl-9 text-[12px] text-builder-muted">
                {scene.modules.length === 0
                  ? 'Bez modulů'
                  : scene.modules.join(' · ')}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
