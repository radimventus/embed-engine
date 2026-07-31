import type { ReactNode } from 'react';

import type { HousePackageMount } from './mountHousePackage';
import type { HousePackageNavId } from './HousePackageSidebar';
import {
  HOUSE_PACKAGE_DISK_ROOT,
  HOUSE_PACKAGE_URL_ROOT,
} from './housePackagePaths';

type HousePackageReadonlyViewProps = {
  readonly mount: HousePackageMount;
  readonly activeNav: HousePackageNavId;
};

/**
 * CAP-BLD-02 — read-only rendering of mounted HP-002 content.
 * No editors, no save, no mutations.
 */
export function HousePackageReadonlyView({
  mount,
  activeNav,
}: HousePackageReadonlyViewProps) {
  const pkg = mount.builderImport;

  return (
    <div className="space-y-6" data-testid="house-package-readonly">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Content SSOT
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-builder-ink">
            House Package (HP-002)
          </h2>
          <p className="mt-1 font-mono text-[12px] text-builder-muted">
            {mount.packageRootLabel} → {HOUSE_PACKAGE_DISK_ROOT}
          </p>
        </div>
        <span
          className={`rounded-xl px-3 py-1.5 text-sm font-bold ${
            mount.ok
              ? 'bg-builder-successBg text-builder-success'
              : 'bg-builder-draftBg text-builder-draft'
          }`}
        >
          {mount.ok ? 'Mounted' : 'Mount errors'}
        </span>
      </div>

      {!mount.ok && (
        <ErrorList errors={mount.errors.map((e) => `${e.code}: ${e.message}`)} />
      )}

      {activeNav === 'overview' && (
        <section className="space-y-4">
          <Panel title="Mount">
            <Row label="Mounted at" value={mount.mountedAt} />
            <Row label="Hero" value={mount.heroRelativePath} />
            <Row
              label="Format"
              value={pkg?.manifest.packageFormat ?? '—'}
            />
            <Row
              label="Schema"
              value={pkg?.manifest.schemaVersion ?? '—'}
            />
          </Panel>
          <p className="text-sm text-builder-muted">
            Read-only. Edit &amp; Save is CAP-BLD-03. Publish is CAP-BLD-05.
          </p>
        </section>
      )}

      {activeNav === 'rooms' && (
        <Panel title="rooms.csv">
          {pkg === null ? (
            <Empty />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-builder-divider text-builder-muted">
                  <th className="py-2 pr-3 font-medium">Floor</th>
                  <th className="py-2 pr-3 font-medium">Room</th>
                  <th className="py-2 pr-3 font-medium">Name</th>
                  <th className="py-2 font-medium">Area</th>
                </tr>
              </thead>
              <tbody>
                {pkg.rooms.rooms.map((room) => (
                  <tr
                    key={`${room.floorId}:${room.roomId}`}
                    className="border-b border-builder-divider/60"
                  >
                    <td className="py-2 pr-3 font-mono text-[12px]">
                      {room.floorId}
                    </td>
                    <td className="py-2 pr-3 font-mono text-[12px]">
                      {room.roomId}
                    </td>
                    <td className="py-2 pr-3">{room.name}</td>
                    <td className="py-2">{room.area}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <RawBlock label="Raw CSV" text={mount.texts.roomsCsv} />
        </Panel>
      )}

      {activeNav === 'gallery' && (
        <Panel title="gallery.csv">
          {pkg === null ? (
            <Empty />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-builder-divider text-builder-muted">
                  <th className="py-2 pr-3 font-medium">Order</th>
                  <th className="py-2 pr-3 font-medium">Room</th>
                  <th className="py-2 pr-3 font-medium">File</th>
                  <th className="py-2 font-medium">Path</th>
                </tr>
              </thead>
              <tbody>
                {pkg.gallery.entries.map((entry) => (
                  <tr
                    key={`${entry.order}:${entry.file}`}
                    className="border-b border-builder-divider/60"
                  >
                    <td className="py-2 pr-3">{entry.order}</td>
                    <td className="py-2 pr-3 font-mono text-[12px]">
                      {entry.roomId}
                    </td>
                    <td className="py-2 pr-3 font-mono text-[12px]">
                      {entry.file}
                    </td>
                    <td className="py-2 font-mono text-[11px] text-builder-muted">
                      {entry.path}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <RawBlock label="Raw CSV" text={mount.texts.galleryCsv} />
        </Panel>
      )}

      {activeNav === 'videos' && (
        <Panel title="videos.csv">
          {pkg === null ? (
            <Empty />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-builder-divider text-builder-muted">
                  <th className="py-2 pr-3 font-medium">Order</th>
                  <th className="py-2 pr-3 font-medium">Room</th>
                  <th className="py-2 pr-3 font-medium">Provider</th>
                  <th className="py-2 font-medium">Media ID</th>
                </tr>
              </thead>
              <tbody>
                {pkg.videos.entries.map((entry) => (
                  <tr
                    key={`${entry.order}:${entry.mediaId}`}
                    className="border-b border-builder-divider/60"
                  >
                    <td className="py-2 pr-3">{entry.order}</td>
                    <td className="py-2 pr-3 font-mono text-[12px]">
                      {entry.roomId}
                    </td>
                    <td className="py-2 pr-3">{entry.provider}</td>
                    <td className="py-2 font-mono text-[12px]">
                      {entry.mediaId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <RawBlock label="Raw CSV" text={mount.texts.videosCsv} />
        </Panel>
      )}

      {activeNav === 'plans' && (
        <Panel title="Floor plans / SVG">
          {pkg === null ? (
            <Empty />
          ) : (
            <ul className="space-y-3 text-sm">
              {pkg.floors.floors.map((floor) => {
                const geometry = mount.geometryByFloor[floor.floorId];
                const geometryLabel =
                  geometry === undefined || geometry === 'missing'
                    ? 'geometry missing'
                    : geometry === 'invalid'
                      ? 'geometry invalid'
                      : `geometry ok · ${geometry.rooms.length} rooms`;
                return (
                  <li
                    key={floor.floorId}
                    className="rounded-lg border border-[#E8EEF5] bg-white px-4 py-3"
                  >
                    <p className="font-semibold text-builder-ink">
                      {floor.floorId}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-builder-muted">
                      raster: {floor.planPng}
                    </p>
                    <p className="font-mono text-[11px] text-builder-muted">
                      svg:{' '}
                      {pkg.svg.entries.find((s) => s.floorId === floor.floorId)
                        ?.path ?? floor.planSvg}
                    </p>
                    <p className="mt-1 text-[12px] text-builder-muted">
                      {geometryLabel}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      {activeNav === 'media' && (
        <Panel title="Media paths">
          <Row
            label="Hero URL"
            value={`${HOUSE_PACKAGE_URL_ROOT}/${mount.heroRelativePath}`}
          />
          {pkg !== null && (
            <>
              <p className="mt-4 text-[12px] font-medium text-builder-muted">
                Gallery ({pkg.gallery.entries.length})
              </p>
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto font-mono text-[11px] text-builder-ink">
                {pkg.gallery.entries.map((entry) => (
                  <li key={`${entry.order}-${entry.path}`}>{entry.path}</li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-4">
            <img
              src={`${HOUSE_PACKAGE_URL_ROOT}/${mount.heroRelativePath}`}
              alt="House Package hero"
              className="max-h-48 rounded-lg border border-[#E8EEF5] object-cover"
            />
          </div>
        </Panel>
      )}

      {activeNav === 'manifest' && (
        <Panel title="manifest.json">
          {mount.texts.manifestJson === null ? (
            <p className="text-sm text-builder-muted">
              manifest.json not loaded (optional auxiliary file).
            </p>
          ) : (
            <RawBlock label="Raw JSON" text={mount.texts.manifestJson} />
          )}
          {pkg !== null && (
            <div className="mt-4">
              <p className="text-[12px] font-medium text-builder-muted">
                Runtime Manifest (from object-house import)
              </p>
              <pre className="mt-2 max-h-80 overflow-auto rounded-lg bg-[#0F172A] p-4 text-[11px] text-[#E2E8F0]">
                {JSON.stringify(pkg.manifest, null, 2)}
              </pre>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-builder-ink">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-builder-divider py-2 text-sm">
      <span className="text-builder-muted">{label}</span>
      <span className="font-mono text-[12px] text-builder-ink">{value}</span>
    </div>
  );
}

function RawBlock({
  label,
  text,
}: {
  readonly label: string;
  readonly text: string;
}) {
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-[12px] font-medium text-builder-muted">
        {label}
      </summary>
      <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-[#F8FAFC] p-3 font-mono text-[11px] text-builder-ink">
        {text}
      </pre>
    </details>
  );
}

function Empty() {
  return (
    <p className="text-sm text-builder-muted">
      Registries unavailable — see mount errors.
    </p>
  );
}

function ErrorList({ errors }: { readonly errors: readonly string[] }) {
  return (
    <ul className="rounded-lg border border-builder-draft/30 bg-builder-draftBg px-4 py-3 text-sm text-builder-draft">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}
