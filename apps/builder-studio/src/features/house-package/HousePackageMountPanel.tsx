import type {
  HousePackageEditSession,
  HousePackageEditSnapshot,
} from './housePackageEditSession';

type HousePackageMountPanelProps = {
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly loadError: string | null;
  readonly saving: boolean;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onSave: () => void;
};

/**
 * CAP-BLD-04 — validation + dirty/undo/reset/save controls.
 */
export function HousePackageMountPanel({
  snapshot,
  session,
  loadError,
  saving,
  onChange,
  onSave,
}: HousePackageMountPanelProps) {
  return (
    <aside className="h-full overflow-y-auto border-l border-builder-line bg-white p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Validation
      </p>
      <h2 className="mt-1 text-lg font-semibold text-builder-ink">
        object-house
      </h2>
      <p className="mt-2 text-[12px] text-builder-muted">
        Persist via Node host → HP-002 disk root.
      </p>

      {loadError !== null && (
        <p className="mt-4 rounded-lg bg-builder-draftBg px-3 py-2 text-sm text-builder-draft">
          {loadError}
        </p>
      )}

      {snapshot !== null && session !== null && (
        <div className="mt-6 space-y-3 text-sm">
          <StatusRow
            label="State"
            value={
              snapshot.dirtyState === 'save-failed'
                ? 'Save failed'
                : !snapshot.validation.ok
                  ? 'Invalid'
                  : snapshot.dirtyState === 'modified'
                    ? 'Modified'
                    : 'Clean'
            }
            ok={
              snapshot.validation.ok && snapshot.dirtyState === 'clean'
            }
          />
          <StatusRow
            label="Rooms CSV"
            value={snapshot.dirty.includes('rooms') ? 'dirty' : 'clean'}
            ok={!snapshot.dirty.includes('rooms')}
          />
          <StatusRow
            label="Gallery CSV"
            value={snapshot.dirty.includes('gallery') ? 'dirty' : 'clean'}
            ok={!snapshot.dirty.includes('gallery')}
          />
          <StatusRow
            label="Videos CSV"
            value={snapshot.dirty.includes('videos') ? 'dirty' : 'clean'}
            ok={!snapshot.dirty.includes('videos')}
          />
          <StatusRow
            label="Registries"
            value={
              snapshot.validation.builderImport
                ? String(snapshot.validation.builderImport.rooms.rooms.length)
                : '—'
            }
            ok={snapshot.validation.ok}
          />

          {snapshot.saveError !== null && (
            <p className="rounded-lg bg-builder-draftBg px-3 py-2 text-[12px] text-builder-draft">
              {snapshot.saveError}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              disabled={
                saving ||
                snapshot.dirtyState === 'clean' ||
                !snapshot.validation.ok
              }
              onClick={onSave}
              className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save to House Package'}
            </button>
            <button
              type="button"
              disabled={!snapshot.canUndo || saving}
              onClick={() => onChange(session.undo())}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              Undo last change
            </button>
            <button
              type="button"
              disabled={snapshot.dirtyState === 'clean' || saving}
              onClick={() => onChange(session.discard())}
              className="rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm font-medium disabled:opacity-40"
            >
              Discard / Reset to mount
            </button>
          </div>

          {snapshot.sectionErrors.length > 0 && (
            <ul className="mt-4 space-y-2 text-[12px] text-builder-draft">
              {snapshot.sectionErrors.map((error) => (
                <li key={`${error.code}:${error.message}`}>
                  <span className="font-mono">{error.code}</span> —{' '}
                  {error.message}
                </li>
              ))}
            </ul>
          )}
          {snapshot.validation.errors.length > 0 &&
            snapshot.sectionErrors.length === 0 && (
              <ul className="mt-4 space-y-2 text-[12px] text-builder-draft">
                {snapshot.validation.errors.map((error) => (
                  <li key={`${error.code}:${error.message}`}>
                    <span className="font-mono">{error.code}</span> —{' '}
                    {error.message}
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
    </aside>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  readonly label: string;
  readonly value: string;
  readonly ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-builder-divider py-3">
      <span className="font-medium text-builder-ink">{label}</span>
      <span
        className={`rounded-xl px-2.5 py-1 text-sm font-bold ${
          ok
            ? 'bg-builder-successBg text-builder-success'
            : 'bg-builder-draftBg text-builder-draft'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
