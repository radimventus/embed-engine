import { openHousePackageRuntimePreviewWindow } from '../house-package/mountHousePackageRuntimePreview';

type ExperienceLivePreviewProps = {
  readonly objectId: string;
  readonly remountKey: string;
};

/**
 * PR-024 — Náhled opens Shared Runtime in a new browser window.
 */
export function ExperienceLivePreview({
  objectId,
  remountKey,
}: ExperienceLivePreviewProps) {
  void remountKey;

  return (
    <aside className="flex h-full min-h-[70vh] flex-col overflow-hidden border-l border-builder-line bg-white">
      <div className="shrink-0 border-b border-builder-lineSoft px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Náhled
        </p>
        <h2 className="mt-1 text-sm font-semibold text-builder-ink">
          Shared Runtime
        </h2>
        <p className="mt-1 text-[11px] text-builder-muted">
          Otevře se v novém okně
        </p>
        <button
          type="button"
          onClick={() => {
            openHousePackageRuntimePreviewWindow(objectId);
          }}
          className="mt-3 w-full rounded-[10px] border border-builder-blue bg-builder-blue px-3 py-2.5 text-sm font-semibold text-white hover:bg-builder-blueHover"
          style={{ backgroundColor: '#18428F', borderColor: '#18428F' }}
        >
          Náhled
        </button>
      </div>
      <div
        className="flex min-h-0 flex-1 items-center justify-center bg-builder-canvas px-4 text-center text-sm text-builder-muted"
        data-testid="experience-preview-idle"
      >
        Náhled se otevírá v novém okně.
      </div>
    </aside>
  );
}
