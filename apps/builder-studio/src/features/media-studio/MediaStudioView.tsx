import { parseCsv } from '@embed-engine/object-house/builder-package';
import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react';

import {
  AiAuthorSuggestButton,
  proposeGalleryOrder,
  proposeMediaCaptions,
  proposeMediaHero,
  type MediaCaptionsPayload,
  type MediaGalleryOrderPayload,
  type MediaHeroPayload,
} from '../ai-author';
import { ExperienceLivePreview } from '../experience-composer/ExperienceLivePreview';
import type {
  HousePackageEditSession,
  HousePackageEditSnapshot,
} from '../house-package/housePackageEditSession';
import {
  addCsvRow,
  removeCsvRow,
  updateCsvCell,
} from '../house-package/housePackageCsv';
import type { MediaAreaId } from './mediaCatalog';
import {
  BulkUploadDialog,
  appendStagedBulkAssets,
  listStagedBulkAssets,
  type BulkUploadCompletedFile,
  type BulkUploadKind,
} from './bulk-upload';
import { createGalleryDragGhost } from './bulk-upload/createGalleryDragGhost';
import {
  buildMediaStudioModel,
  reorderGalleryCsv,
  reorderGalleryCsvByFiles,
  type GalleryMediaItem,
  type MediaStudioModel,
} from './mediaProjection';
import { setMediaPresentationMeta } from './mediaPresentationStorage';
import { HOUSE_PACKAGE_URL_ROOT } from '../house-package/housePackagePaths';

type MediaStudioViewProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  /** Persist a completed House Package edit through its active House root. */
  readonly onPersist?: (next: HousePackageEditSnapshot) => void;
  /** PR-008 — jedna oblast jako kotva v souvislé ploše. */
  readonly lockedArea?: MediaAreaId;
  readonly embedded?: boolean;
};

/**
 * EPIC-BX-05 — Media Studio over HP-002 media + Shared Runtime preview.
 */
export function MediaStudioView({
  projectId,
  projectName,
  snapshot,
  session,
  onChange,
  onPersist,
  lockedArea,
  embedded = false,
}: MediaStudioViewProps) {
  const [areaState, setArea] = useState<MediaAreaId>(lockedArea ?? 'gallery');
  const [metaTick, setMetaTick] = useState(0);
  const [stagingTick, setStagingTick] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [bulkKind, setBulkKind] = useState<BulkUploadKind | null>(null);
  const [bulkInitialFiles, setBulkInitialFiles] = useState<File[] | null>(null);
  const [bulkAutoStart, setBulkAutoStart] = useState(false);
  const area = lockedArea ?? areaState;

  const model = useMemo(
    () => buildMediaStudioModel({ projectId, snapshot }),
    [projectId, snapshot, metaTick, stagingTick],
  );

  const refreshMeta = () => setMetaTick((value) => value + 1);
  const refreshStaging = () => setStagingTick((value) => value + 1);

  const openBulkUpload = (
    kind: BulkUploadKind,
    files?: readonly File[],
    autoStart = false,
  ) => {
    setBulkKind(kind);
    setBulkInitialFiles(files !== undefined ? Array.from(files) : null);
    setBulkAutoStart(autoStart && files !== undefined && files.length > 0);
  };

  const closeBulkUpload = () => {
    setBulkKind(null);
    setBulkInitialFiles(null);
    setBulkAutoStart(false);
  };

  const areaBody = (
    <>
      {area === 'hero' && session !== null && (
        <HeroManager
          model={model}
          session={session}
          projectId={projectId}
          onChange={onChange}
          onPersist={onPersist}
          onMetaSaved={refreshMeta}
        />
      )}
      {area === 'gallery' && snapshot !== null && session !== null && (
        <GalleryManager
          model={model}
          snapshot={snapshot}
          session={session}
          projectId={projectId}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          onChange={onChange}
          onMetaSaved={refreshMeta}
          onOpenBulkUpload={() => openBulkUpload('images')}
          onPickFiles={(files) => openBulkUpload('images', files, false)}
        />
      )}
      {area === 'videos' && snapshot !== null && session !== null && (
        <VideoManager
          model={model}
          snapshot={snapshot}
          session={session}
          projectId={projectId}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          onChange={onChange}
          onMetaSaved={refreshMeta}
        />
      )}
      {(area === 'svg' || area === 'floor-plans') && (
        <FloorPlanStudio
          model={model}
          projectId={projectId}
          title={area === 'svg' ? 'SVG' : 'Půdorys'}
          stagingTick={stagingTick}
          onOpenBulkUpload={() => openBulkUpload('svg')}
          onPickFiles={(files) => openBulkUpload('svg', files, false)}
        />
      )}
      {area === 'documents' && (
        <DocumentLibrary
          model={model}
          projectId={projectId}
          stagingTick={stagingTick}
          onOpenBulkUpload={() => openBulkUpload('documents')}
          onPickFiles={(files) => openBulkUpload('documents', files, false)}
        />
      )}
      {bulkKind !== null && (
        <BulkUploadDialog
          open
          kind={bulkKind}
          initialFiles={bulkInitialFiles ?? undefined}
          autoStart={bulkAutoStart}
          onClose={closeBulkUpload}
          onCompleted={(files) => {
            if (bulkKind === 'images' && snapshot !== null && session !== null) {
              applyGalleryBulkUpload({
                files,
                snapshot,
                session,
                galleryCount: model.gallery.length,
                onChange,
              });
            } else if (bulkKind === 'svg' || bulkKind === 'documents') {
              appendStagedBulkAssets(
                projectId,
                bulkKind,
                files.map((file) => ({
                  id: `${bulkKind}:${file.relativePath}`,
                  kind: bulkKind,
                  fileName: file.fileName,
                  relativePath: file.relativePath,
                  uploadedAt: new Date().toISOString(),
                })),
              );
              refreshStaging();
            }
          }}
        />
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-4" data-testid="media-studio" data-area={area}>
        {areaBody}
      </div>
    );
  }

  return (
    <div
      className="grid min-h-[70vh] gap-4 desktop:grid-cols-[minmax(0,1fr)_360px]"
      data-testid="media-studio"
    >
      <div className="space-y-5">
        <header className="rounded-[16px] border border-[#E3E3E3] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Média
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-builder-ink">
            Studio médií
          </h1>
          <p className="mt-1 text-sm text-builder-muted">
            {projectName} — obsahové stavební prvky Experience (HP-002 SSOT).
          </p>
          <div className="mt-5 grid gap-3 tablet:grid-cols-3 desktop:grid-cols-6">
            {model.areas.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setArea(item.id)}
                className={`rounded-[12px] border px-3 py-3 text-left ${
                  area === item.id
                    ? 'border-builder-blue bg-builder-creamLight text-builder-blue'
                    : 'border-[#E3E3E3] bg-builder-canvas text-builder-ink'
                }`}
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p
                  className={`mt-1 text-[11px] ${
                    area === item.id ? 'text-white/80' : 'text-builder-muted'
                  }`}
                >
                  {item.summary}
                </p>
              </button>
            ))}
          </div>
        </header>

        {areaBody}
      </div>

      <div className="space-y-4">
        <MetadataPanel
          model={model}
          area={area}
          selectedKey={selectedKey}
          projectId={projectId}
          onMetaSaved={refreshMeta}
        />
        <div className="overflow-hidden rounded-[16px] border border-[#E3E3E3] bg-white shadow-sm">
          <ExperienceLivePreview
            objectId={projectId}
            remountKey={model.remountKey}
          />
        </div>
      </div>
    </div>
  );
}

function HeroManager({
  model,
  session,
  projectId,
  onChange,
  onPersist,
  onMetaSaved,
}: {
  readonly model: MediaStudioModel;
  readonly session: HousePackageEditSession;
  readonly projectId: string;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onPersist?: (next: HousePackageEditSnapshot) => void;
  readonly onMetaSaved: () => void;
}) {
  const [path, setPath] = useState(model.heroPath);
  const [meta, setMeta] = useState(model.heroMeta);

  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-builder-ink">Hero</h2>
      <p className="mt-1 text-sm text-builder-muted">
        Pouze jeden aktivní Hero · Desktop / Mobile náhled
      </p>
      <div className="mt-3">
        <AiAuthorSuggestButton
          projectId={projectId}
          domain="media"
          label="Doporučit Hero"
          buildProposal={() =>
            proposeMediaHero({
              galleryFiles: model.gallery.map((item) => ({
                path: item.path,
                room: item.room,
              })),
              currentHero: model.heroPath,
            })
          }
          onAccept={(payload) => {
            const data = payload as MediaHeroPayload;
            setPath(data.path);
            setMeta({
              ...meta,
              title: data.title,
              alt: data.alt,
            });
          }}
        />
      </div>
      <div className="mt-4 grid gap-4 desktop:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase text-builder-muted">
            Desktop
          </p>
          {model.heroUrl !== null ? (
            <img
              src={model.heroUrl}
              alt={meta.alt || 'Hero'}
              className="mt-2 aspect-[16/9] w-full rounded-[12px] object-cover bg-builder-soft"
              style={{
                objectPosition: `${meta.focalX}% ${meta.focalY}%`,
              }}
            />
          ) : (
            <div className="mt-2 flex aspect-[16/9] items-center justify-center rounded-[12px] bg-builder-soft text-sm text-builder-muted">
              Hero není nastaven
            </div>
          )}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase text-builder-muted">
            Mobile
          </p>
          {model.heroUrl !== null ? (
            <img
              src={model.heroUrl}
              alt={meta.alt || 'Hero'}
              className="mt-2 mx-auto aspect-[9/16] max-w-[220px] rounded-[12px] object-cover bg-builder-soft"
              style={{
                objectPosition: `${meta.focalX}% ${meta.focalY}%`,
              }}
            />
          ) : (
            <div className="mt-2 mx-auto flex aspect-[9/16] max-w-[220px] items-center justify-center rounded-[12px] bg-builder-soft text-sm text-builder-muted">
              —
            </div>
          )}
        </div>
      </div>
      <form
        className="mt-5 grid gap-3 tablet:grid-cols-2"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          const next = session.setHeroRelativePath(path.trim());
          onChange(next);
          onPersist?.(next);
          setMediaPresentationMeta(projectId, 'hero', {
            ...meta,
            updatedAt: new Date().toISOString(),
          });
          onMetaSaved();
        }}
      >
        <Field
          label="Hlavní obrázek (soubor v projektu)"
          value={path}
          onChange={setPath}
        />
        <Field
          label="Titulní označení"
          value={meta.title}
          onChange={(value) => setMeta({ ...meta, title: value })}
        />
        <Field
          label="ALT text"
          value={meta.alt}
          onChange={(value) => setMeta({ ...meta, alt: value })}
        />
        <Field
          label="Focal X %"
          value={String(meta.focalX)}
          onChange={(value) =>
            setMeta({
              ...meta,
              focalX: Number.parseInt(value, 10) || 50,
            })
          }
        />
        <Field
          label="Focal Y %"
          value={String(meta.focalY)}
          onChange={(value) =>
            setMeta({
              ...meta,
              focalY: Number.parseInt(value, 10) || 50,
            })
          }
        />
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2 text-sm font-medium text-white"
          >
            Uložit Hero
          </button>
        </div>
      </form>
      <UsageLine usages={model.areas.find((item) => item.id === 'hero')?.usages ?? []} />
    </section>
  );
}

function applyGalleryBulkUpload(input: {
  readonly files: readonly BulkUploadCompletedFile[];
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly galleryCount: number;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
}): void {
  let csv = input.snapshot.working.galleryCsv;
  let order = input.galleryCount;
  for (const file of input.files) {
    order += 1;
    csv = addCsvRow(csv, {
      order: String(order),
      room: 'exterior',
      file: file.fileName,
    });
  }
  input.onChange(input.session.setGalleryCsv(csv));
}

function GalleryManager({
  model,
  snapshot,
  session,
  projectId,
  selectedKey,
  onSelect,
  onChange,
  onMetaSaved,
  onOpenBulkUpload,
  onPickFiles,
}: {
  readonly model: MediaStudioModel;
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly projectId: string;
  readonly selectedKey: string | null;
  readonly onSelect: (key: string) => void;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onMetaSaved: () => void;
  readonly onOpenBulkUpload: () => void;
  readonly onPickFiles: (files: File[]) => void;
}) {
  const [filter, setFilter] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const dragGhostCleanupRef = useRef<(() => void) | null>(null);

  const filtered = model.gallery.filter((item) => {
    const q = filter.trim().toLowerCase();
    if (q.length === 0) return true;
    return (
      item.room.toLowerCase().includes(q) ||
      item.file.toLowerCase().includes(q) ||
      item.meta.title.toLowerCase().includes(q)
    );
  });

  const setAsHero = (item: GalleryMediaItem) => {
    onChange(session.setHeroRelativePath(item.path));
  };

  const clearDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
    dragGhostCleanupRef.current?.();
    dragGhostCleanupRef.current = null;
  };

  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-builder-ink">
            Galerie
          </h2>
          <p className="mt-1 text-sm text-builder-muted">
            Přetáhněte miniatury pro změnu pořadí · HP gallery.csv
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filtrovat…"
            className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          />
          <input
            ref={addInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const list = event.target.files;
              if (list !== null && list.length > 0) {
                onPickFiles(Array.from(list));
              }
              event.target.value = '';
            }}
          />
          <button
            type="button"
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-3 py-2 text-sm font-medium text-white"
            onClick={() => addInputRef.current?.click()}
          >
            ＋ Přidat
          </button>
          <button
            type="button"
            className="platform-btn"
            onClick={onOpenBulkUpload}
          >
            Nahrát více souborů
          </button>
          <AiAuthorSuggestButton
            projectId={projectId}
            domain="media"
            label="Doporučit pořadí galerie"
            buildProposal={() =>
              proposeGalleryOrder({
                files: model.gallery.map((item) => ({
                  file: item.file,
                  room: item.room,
                })),
              })
            }
            onAccept={(payload) => {
              const data = payload as MediaGalleryOrderPayload;
              onChange(
                session.setGalleryCsv(
                  reorderGalleryCsvByFiles(
                    snapshot.working.galleryCsv,
                    data.orderedFiles,
                  ),
                ),
              );
            }}
          />
          <AiAuthorSuggestButton
            projectId={projectId}
            domain="media"
            label="Doporučit titulky"
            buildProposal={() =>
              proposeMediaCaptions({
                items: model.gallery.map((item) => ({
                  key: item.key,
                  file: item.file,
                  room: item.room,
                })),
              })
            }
            onAccept={(payload) => {
              const data = payload as MediaCaptionsPayload;
              for (const caption of data.captions) {
                const current = model.gallery.find(
                  (item) => item.key === caption.key,
                );
                setMediaPresentationMeta(projectId, caption.key, {
                  ...(current?.meta ?? {
                    title: '',
                    alt: '',
                    description: '',
                    author: 'uživatel',
                    focalX: 50,
                    focalY: 50,
                    active: true,
                    updatedAt: new Date().toISOString(),
                  }),
                  title: caption.title,
                  alt: caption.alt,
                  updatedAt: new Date().toISOString(),
                });
              }
              onMetaSaved();
            }}
          />
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 tablet:grid-cols-4">
        {filtered.map((item) => {
          const index = model.gallery.findIndex((row) => row.key === item.key);
          const isSource = dragIndex === index;
          const isTarget =
            overIndex === index && dragIndex !== null && dragIndex !== index;
          return (
            <li key={item.key}>
              <article
                draggable
                onDragStart={(event: DragEvent) => {
                  setDragIndex(index);
                  setOverIndex(index);
                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('text/plain', String(index));
                  const img = event.currentTarget.querySelector('img');
                  if (img instanceof HTMLImageElement) {
                    const ghost = createGalleryDragGhost(img);
                    dragGhostCleanupRef.current = ghost.cleanup;
                    event.dataTransfer.setDragImage(ghost.element, 60, 45);
                  }
                }}
                onDragEnd={clearDrag}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  if (overIndex !== index) {
                    setOverIndex(index);
                  }
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setOverIndex(index);
                }}
                onDrop={(event: DragEvent) => {
                  event.preventDefault();
                  const from = Number.parseInt(
                    event.dataTransfer.getData('text/plain'),
                    10,
                  );
                  if (Number.isFinite(from) && index >= 0 && from !== index) {
                    onChange(
                      session.setGalleryCsv(
                        reorderGalleryCsv(
                          snapshot.working.galleryCsv,
                          from,
                          index,
                        ),
                      ),
                    );
                  }
                  clearDrag();
                }}
                onClick={() => onSelect(item.key)}
                className={`overflow-hidden rounded-[12px] border bg-builder-canvas transition-[box-shadow,border-color,opacity] ${
                  selectedKey === item.key
                    ? 'border-builder-navy ring-2 ring-builder-navy/15'
                    : 'border-[#E3E3E3]'
                } ${isSource ? 'opacity-40' : ''} ${
                  isTarget
                    ? 'border-[var(--platform-blue)] ring-2 ring-[var(--platform-blue)]/25'
                    : ''
                }`}
              >
                <img
                  src={item.url}
                  alt={item.meta.alt || item.file}
                  className="aspect-[4/3] w-full object-cover"
                  draggable={false}
                />
                <div className="space-y-1 p-2.5">
                  <p className="truncate text-sm font-medium text-builder-ink">
                    {item.meta.title || item.file}
                  </p>
                  <p className="text-[11px] text-builder-muted">
                    {item.room} · #{item.order}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <button
                      type="button"
                      className="platform-btn platform-btn--sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        setAsHero(item);
                      }}
                    >
                      Nastavit Hero
                    </button>
                    <button
                      type="button"
                      className="platform-icon-btn--danger"
                      aria-label="Odstranit"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (index >= 0) {
                          onChange(
                            session.setGalleryCsv(
                              removeCsvRow(snapshot.working.galleryCsv, index),
                            ),
                          );
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      <UsageLine
        usages={
          model.areas.find((item) => item.id === 'gallery')?.usages ?? []
        }
      />
      <SelectedGalleryEditor
        item={model.gallery.find((row) => row.key === selectedKey) ?? null}
        projectId={projectId}
        snapshot={snapshot}
        session={session}
        onChange={onChange}
        onMetaSaved={onMetaSaved}
      />
    </section>
  );
}

function SelectedGalleryEditor({
  item,
  projectId,
  snapshot,
  session,
  onChange,
  onMetaSaved,
}: {
  readonly item: GalleryMediaItem | null;
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onMetaSaved: () => void;
}) {
  if (item === null) {
    return (
      <p className="mt-4 text-sm text-builder-muted">
        Vyberte miniaturu pro metadata a úpravu položky.
      </p>
    );
  }
  const index = parseCsvIndex(snapshot.working.galleryCsv, item);
  const [meta, setMeta] = useState(item.meta);
  const [room, setRoom] = useState(item.room);
  const [file, setFile] = useState(item.file);

  return (
    <form
      className="mt-5 grid gap-3 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas p-4 tablet:grid-cols-2"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        if (index >= 0) {
          let csv = updateCsvCell(
            snapshot.working.galleryCsv,
            index,
            'room',
            room,
          );
          csv = updateCsvCell(csv, index, 'file', file);
          onChange(session.setGalleryCsv(csv));
        }
        setMediaPresentationMeta(projectId, item.key, meta);
        onMetaSaved();
      }}
    >
      <Field label="Název" value={meta.title} onChange={(v) => setMeta({ ...meta, title: v })} />
      <Field label="ALT" value={meta.alt} onChange={(v) => setMeta({ ...meta, alt: v })} />
      <Field label="Místnost" value={room} onChange={setRoom} />
      <Field label="Soubor" value={file} onChange={setFile} />
      <label className="block text-sm tablet:col-span-2">
        <span className="mb-1.5 block font-medium text-builder-ink">Popis</span>
        <textarea
          className="min-h-20 w-full rounded-[10px] border border-[#DDE5EF] bg-white px-3 py-2 text-sm"
          value={meta.description}
          onChange={(event) =>
            setMeta({ ...meta, description: event.target.value })
          }
        />
      </label>
      <button
        type="submit"
        className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2 text-sm font-medium text-white"
      >
        Uložit položku
      </button>
    </form>
  );
}

function VideoManager({
  model,
  snapshot,
  session,
  projectId,
  selectedKey,
  onSelect,
  onChange,
  onMetaSaved,
}: {
  readonly model: MediaStudioModel;
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly projectId: string;
  readonly selectedKey: string | null;
  readonly onSelect: (key: string) => void;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onMetaSaved: () => void;
}) {
  const selected =
    model.videos.find((item) => item.key === selectedKey) ?? model.videos[0] ?? null;

  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-builder-ink">Videa</h2>
          <p className="mt-1 text-sm text-builder-muted">
            Náhled · titul · typ · pořadí · aktivní
          </p>
        </div>
        <button
          type="button"
          className="rounded-[10px] border border-builder-blue bg-builder-blue px-3 py-2 text-sm font-medium text-white"
          onClick={() =>
            onChange(
              session.setVideosCsv(
                addCsvRow(snapshot.working.videosCsv, {
                  order: String(model.videos.length + 1),
                  room: 'exterior',
                  provider: 'wistia',
                  mediaId: '',
                }),
              ),
            )
          }
        >
          ＋ Přidat video
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {model.videos.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-3 text-left ${
                selected?.key === item.key
                  ? 'border-builder-navy bg-builder-panel'
                  : 'border-[#E3E3E3] bg-builder-canvas'
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-builder-ink">
                  {item.meta.title || item.mediaId || 'Video'}
                </span>
                <span className="text-[12px] text-builder-muted">
                  {item.provider} · {item.room} · #{item.order}
                  {item.meta.active ? '' : ' · neaktivní'}
                </span>
              </span>
              <button
                type="button"
                className="platform-icon-btn--danger"
                aria-label="Odstranit"
                onClick={(event) => {
                  event.stopPropagation();
                  const index = model.videos.findIndex(
                    (row) => row.key === item.key,
                  );
                  if (index >= 0) {
                    onChange(
                      session.setVideosCsv(
                        removeCsvRow(snapshot.working.videosCsv, index),
                      ),
                    );
                  }
                }}
              >
                ✕
              </button>
            </button>
          </li>
        ))}
      </ul>
      {selected !== null && (
        <VideoEditor
          item={selected}
          projectId={projectId}
          snapshot={snapshot}
          session={session}
          model={model}
          onChange={onChange}
          onMetaSaved={onMetaSaved}
        />
      )}
      <UsageLine
        usages={model.areas.find((item) => item.id === 'videos')?.usages ?? []}
      />
    </section>
  );
}

function VideoEditor({
  item,
  projectId,
  snapshot,
  session,
  model,
  onChange,
  onMetaSaved,
}: {
  readonly item: MediaStudioModel['videos'][number];
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot;
  readonly session: HousePackageEditSession;
  readonly model: MediaStudioModel;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onMetaSaved: () => void;
}) {
  const index = model.videos.findIndex((row) => row.key === item.key);
  const [meta, setMeta] = useState(item.meta);
  const [room, setRoom] = useState(item.room);
  const [provider, setProvider] = useState(item.provider);
  const [mediaId, setMediaId] = useState(item.mediaId);
  const [order, setOrder] = useState(item.order);

  return (
    <form
      className="mt-4 grid gap-3 rounded-[12px] border border-[#E3E3E3] bg-builder-canvas p-4 tablet:grid-cols-2"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        if (index >= 0) {
          let csv = snapshot.working.videosCsv;
          csv = updateCsvCell(csv, index, 'room', room);
          csv = updateCsvCell(csv, index, 'provider', provider);
          csv = updateCsvCell(csv, index, 'mediaId', mediaId);
          csv = updateCsvCell(csv, index, 'order', order);
          onChange(session.setVideosCsv(csv));
        }
        setMediaPresentationMeta(projectId, item.key, meta);
        onMetaSaved();
      }}
    >
      <Field label="Titul" value={meta.title} onChange={(v) => setMeta({ ...meta, title: v })} />
      <Field label="Pořadí" value={order} onChange={setOrder} />
      <Field label="Typ / provider" value={provider} onChange={setProvider} />
      <Field label="Media ID" value={mediaId} onChange={setMediaId} />
      <Field label="Místnost" value={room} onChange={setRoom} />
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={meta.active}
          onChange={(event) =>
            setMeta({ ...meta, active: event.target.checked })
          }
        />
        Aktivní
      </label>
      <button
        type="submit"
        className="rounded-[10px] border border-builder-blue bg-builder-blue px-4 py-2 text-sm font-medium text-white"
      >
        Uložit video
      </button>
    </form>
  );
}

function FloorPlanStudio({
  model,
  projectId,
  title,
  stagingTick,
  onOpenBulkUpload,
  onPickFiles,
}: {
  readonly model: MediaStudioModel;
  readonly projectId: string;
  readonly title: string;
  readonly stagingTick: number;
  readonly onOpenBulkUpload: () => void;
  readonly onPickFiles: (files: File[]) => void;
}) {
  void stagingTick;
  const staged = listStagedBulkAssets(projectId, 'svg');
  const addInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-builder-ink">{title}</h2>
          <p className="mt-1 text-sm text-builder-muted">
            SVG · validace · vazby na místnosti
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={addInputRef}
            type="file"
            multiple
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={(event) => {
              const list = event.target.files;
              if (list !== null && list.length > 0) {
                onPickFiles(Array.from(list));
              }
              event.target.value = '';
            }}
          />
          <button
            type="button"
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-3 py-2 text-sm font-medium text-white"
            onClick={() => addInputRef.current?.click()}
          >
            ＋ Přidat
          </button>
          <button
            type="button"
            className="platform-btn"
            onClick={onOpenBulkUpload}
          >
            Nahrát více souborů
          </button>
        </div>
      </div>
      <ul className="mt-5 space-y-4">
        {model.floors.map((floor) => (
          <li
            key={floor.floorId}
            className="overflow-hidden rounded-[14px] border border-[#E3E3E3]"
          >
            <div className="grid gap-0 tablet:grid-cols-[240px_1fr]">
              <div className="flex items-center justify-center bg-builder-soft p-4">
                <img
                  src={floor.svgUrl}
                  alt={`Půdorys ${floor.floorId}`}
                  className="max-h-48 w-full object-contain"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-builder-ink">{floor.floorId}</p>
                <p className="mt-1 text-sm text-builder-muted">
                  {floor.geometryLabel}
                </p>
                <p className="mt-2 text-sm text-builder-ink">
                  {floor.roomCount} místností
                </p>
                <UsageLine
                  usages={
                    model.areas.find((item) => item.id === 'floor-plans')
                      ?.usages ?? []
                  }
                />
              </div>
            </div>
          </li>
        ))}
        {staged.map((asset) => (
          <li
            key={asset.id}
            className="overflow-hidden rounded-[14px] border border-[#E3E3E3]"
          >
            <div className="grid gap-0 tablet:grid-cols-[240px_1fr]">
              <div className="flex items-center justify-center bg-builder-soft p-4">
                <img
                  src={`${HOUSE_PACKAGE_URL_ROOT}/${asset.relativePath}`}
                  alt={asset.fileName}
                  className="max-h-48 w-full object-contain"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-builder-ink">{asset.fileName}</p>
                <p className="mt-1 text-sm text-builder-muted">
                  Nahráno · {asset.relativePath}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {model.floors.length === 0 && staged.length === 0 && (
        <p className="mt-4 text-sm text-builder-muted">
          Žádná podlaží — doplňte Dispozici (rooms.csv) nebo nahrajte SVG.
        </p>
      )}
    </section>
  );
}

function DocumentLibrary({
  model,
  projectId,
  stagingTick,
  onOpenBulkUpload,
  onPickFiles,
}: {
  readonly model: MediaStudioModel;
  readonly projectId: string;
  readonly stagingTick: number;
  readonly onOpenBulkUpload: () => void;
  readonly onPickFiles: (files: File[]) => void;
}) {
  void stagingTick;
  const staged = listStagedBulkAssets(projectId, 'documents');
  const addInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-[16px] border border-[#E3E3E3] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-builder-ink">
            Dokumenty
          </h2>
          <p className="mt-1 text-sm text-builder-muted">
            PDF / DOC / DOCX — standardní upload
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={addInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              const list = event.target.files;
              if (list !== null && list.length > 0) {
                onPickFiles(Array.from(list));
              }
              event.target.value = '';
            }}
          />
          <button
            type="button"
            className="rounded-[10px] border border-builder-blue bg-builder-blue px-3 py-2 text-sm font-medium text-white"
            onClick={() => addInputRef.current?.click()}
          >
            ＋ Přidat
          </button>
          <button
            type="button"
            className="platform-btn"
            onClick={onOpenBulkUpload}
          >
            Nahrát více souborů
          </button>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {model.documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-builder-ink">{doc.title}</p>
              <p className="text-[12px] text-builder-muted">{doc.kind}</p>
            </div>
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-builder-navy"
            >
              Náhled
            </a>
          </li>
        ))}
        {staged.map((asset) => {
          const lower = asset.fileName.toLowerCase();
          const kind = lower.endsWith('.pdf')
            ? 'PDF'
            : lower.endsWith('.docx')
              ? 'DOCX'
              : lower.endsWith('.doc')
                ? 'DOC'
                : 'Dokument';
          return (
            <li
              key={asset.id}
              className="flex items-center justify-between rounded-[12px] border border-[#E3E3E3] bg-builder-canvas px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-builder-ink">
                  {asset.fileName}
                </p>
                <p className="text-[12px] text-builder-muted">{kind}</p>
              </div>
              <a
                href={`${HOUSE_PACKAGE_URL_ROOT}/${asset.relativePath}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-builder-navy"
              >
                Náhled
              </a>
            </li>
          );
        })}
      </ul>
      {model.documents.length === 0 && staged.length === 0 && (
        <p className="mt-4 text-sm text-builder-muted">
          Žádné dokumenty — nahrajte PDF, DOC nebo DOCX.
        </p>
      )}
      <UsageLine
        usages={
          model.areas.find((item) => item.id === 'documents')?.usages ?? []
        }
      />
    </section>
  );
}

function MetadataPanel({
  model,
  area,
  selectedKey,
  projectId,
  onMetaSaved,
}: {
  readonly model: MediaStudioModel;
  readonly area: MediaAreaId;
  readonly selectedKey: string | null;
  readonly projectId: string;
  readonly onMetaSaved: () => void;
}) {
  const selectedGallery = model.gallery.find((item) => item.key === selectedKey);
  const selectedVideo = model.videos.find((item) => item.key === selectedKey);
  const meta =
    area === 'hero'
      ? model.heroMeta
      : selectedGallery?.meta ??
        selectedVideo?.meta ??
        null;
  const usages =
    model.areas.find((item) => item.id === area)?.usages ?? [];

  if (meta === null) {
    return (
      <aside className="rounded-[16px] border border-[#E3E3E3] bg-white p-4 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Údaje
        </p>
        <p className="mt-2 text-sm text-builder-muted">
          Vyberte médium pro detail.
        </p>
        <UsageLine usages={usages} />
      </aside>
    );
  }

  return (
    <aside className="rounded-[16px] border border-[#E3E3E3] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Údaje
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <MetaRow label="Název" value={meta.title || '—'} />
        <MetaRow label="Alt text" value={meta.alt || '—'} />
        <MetaRow label="Popis" value={meta.description || '—'} />
        <MetaRow label="Autor" value={meta.author || '—'} />
        <MetaRow
          label="Datum"
          value={new Date(meta.updatedAt).toLocaleString('cs-CZ')}
        />
        <MetaRow label="Použití" value={usages.join(' · ')} />
      </dl>
      {area === 'hero' && (
        <button
          type="button"
          className="mt-3 text-sm font-medium text-builder-navy"
          onClick={() => {
            setMediaPresentationMeta(projectId, 'hero', {
              ...meta,
              updatedAt: new Date().toISOString(),
            });
            onMetaSaved();
          }}
        >
          Obnovit panel
        </button>
      )}
    </aside>
  );
}

function MetaRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="border-b border-builder-divider pb-2">
      <dt className="text-[11px] text-builder-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-builder-ink">{value}</dd>
    </div>
  );
}

function UsageLine({
  usages,
}: {
  readonly usages: readonly string[];
}) {
  return (
    <p className="mt-4 text-[12px] text-builder-muted">
      Používá: {usages.join(' · ')}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-builder-ink">{label}</span>
      <input
        className="w-full rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function parseCsvIndex(
  galleryCsv: string,
  item: GalleryMediaItem,
): number {
  const table = parseCsv(galleryCsv);
  return table.rows.findIndex(
    (row) => row.file === item.file && row.order === item.order,
  );
}
