import type { HousePackageMount } from './mountHousePackage';

type HousePackageMountPanelProps = {
  readonly mount: HousePackageMount | null;
  readonly loadError: string | null;
};

/**
 * CAP-BLD-02 — right rail: mount / validation status (read-only).
 * Publish actions are out of scope until CAP-BLD-05.
 */
export function HousePackageMountPanel({
  mount,
  loadError,
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
        Read-only mount. No Publish in CAP-BLD-02.
      </p>

      {loadError !== null && (
        <p className="mt-4 rounded-lg bg-builder-draftBg px-3 py-2 text-sm text-builder-draft">
          {loadError}
        </p>
      )}

      {mount !== null && (
        <div className="mt-6 space-y-3 text-sm">
          <StatusRow
            label="Mount"
            value={mount.ok ? 'OK' : 'Errors'}
            ok={mount.ok}
          />
          <StatusRow
            label="Rooms"
            value={String(mount.builderImport?.rooms.rooms.length ?? 0)}
            ok={mount.ok}
          />
          <StatusRow
            label="Gallery"
            value={String(mount.builderImport?.gallery.entries.length ?? 0)}
            ok={mount.ok}
          />
          <StatusRow
            label="Videos"
            value={String(mount.builderImport?.videos.entries.length ?? 0)}
            ok={mount.ok}
          />
          <StatusRow
            label="Floors"
            value={String(mount.builderImport?.floors.floors.length ?? 0)}
            ok={mount.ok}
          />
          {mount.errors.length > 0 && (
            <ul className="mt-4 space-y-2 text-[12px] text-builder-draft">
              {mount.errors.map((error) => (
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
