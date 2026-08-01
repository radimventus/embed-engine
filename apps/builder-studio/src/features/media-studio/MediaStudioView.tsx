import { parseCsv } from '@embed-engine/object-house/builder-package';
import { useMemo, useState, type DragEvent, type FormEvent } from 'react';

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
  buildMediaStudioModel,
  reorderGalleryCsv,
  reorderGalleryCsvByFiles,
  type GalleryMediaItem,
  type MediaStudioModel,
} from './mediaProjection';
import { setMediaPresentationMeta } from './mediaPresentationStorage';

type MediaStudioViewProps = {
  readonly projectId: string;
  readonly projectName: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly session: HousePackageEditSession | null;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
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
}: MediaStudioViewProps) {
  const [area, setArea] = useState<MediaAreaId>('gallery');
  const [metaTick, setMetaTick] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const model = useMemo(
    () => buildMediaStudioModel({ projectId, snapshot }),
    [projectId, snapshot, metaTick],
  );

  const refreshMeta = () => setMetaTick((value) => value + 1);

  return (
    <div
      className="grid min-h-[70vh] gap-4 desktop:grid-cols-[minmax(0,1fr)_360px]"
      data-testid="media-studio"
    >
      <div className="space-y-5">
        <header className="rounded-[16px] border border-[#E8EEF5] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
            Media
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-builder-ink">
            Media Studio
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
                    ? 'border-builder-navy bg-builder-navy text-white'
                    : 'border-[#E8EEF5] bg-builder-canvas text-builder-ink'
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

        {area === 'hero' && session !== null && (
          <HeroManager
            model={model}
            session={session}
            projectId={projectId}
            onChange={onChange}
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
          <FloorPlanStudio model={model} />
        )}
        {area === 'documents' && <DocumentLibrary model={model} />}
      </div>

      <div className="space-y-4">
        <MetadataPanel
          model={model}
          area={area}
          selectedKey={selectedKey}
          projectId={projectId}
          onMetaSaved={refreshMeta}
        />
        <div className="overflow-hidden rounded-[16px] border border-[#E8EEF5] bg-white shadow-sm">
          <ExperienceLivePreview remountKey={model.remountKey} />
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
  onMetaSaved,
}: {
  readonly model: MediaStudioModel;
  readonly session: HousePackageEditSession;
  readonly projectId: string;
  readonly onChange: (next: HousePackageEditSnapshot) => void;
  readonly onMetaSaved: () => void;
}) {
  const [path, setPath] = useState(model.heroPath);
  const [meta, setMeta] = useState(model.heroMeta);

  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-builder-ink">Hero Manager</h2>
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
          onChange(session.setHeroRelativePath(path.trim()));
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
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
          >
            Uložit Hero
          </button>
        </div>
      </form>
      <UsageLine usages={model.areas.find((item) => item.id === 'hero')?.usages ?? []} />
    </section>
  );
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
  const [filter, setFilter] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

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

  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-builder-ink">
            Gallery Manager
          </h2>
          <p className="mt-1 text-sm text-builder-muted">
            Miniatury · drag & drop pořadí · HP gallery.csv
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filtrovat…"
            className="rounded-[10px] border border-[#DDE5EF] px-3 py-2 text-sm"
          />
          <button
            type="button"
            className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white"
            onClick={() =>
              onChange(
                session.setGalleryCsv(
                  addCsvRow(snapshot.working.galleryCsv, {
                    order: String(model.gallery.length + 1),
                    room: 'exterior',
                    file: '00.webp',
                  }),
                ),
              )
            }
          >
            ＋ Přidat
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
          return (
            <li key={item.key}>
              <article
                draggable
                onDragStart={(event: DragEvent) => {
                  setDragIndex(index);
                  event.dataTransfer.setData('text/plain', String(index));
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event: DragEvent) => {
                  event.preventDefault();
                  const from = Number.parseInt(
                    event.dataTransfer.getData('text/plain'),
                    10,
                  );
                  if (Number.isFinite(from) && index >= 0) {
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
                  setDragIndex(null);
                }}
                onClick={() => onSelect(item.key)}
                className={`overflow-hidden rounded-[12px] border bg-builder-canvas ${
                  selectedKey === item.key
                    ? 'border-builder-navy ring-2 ring-builder-navy/15'
                    : 'border-[#E8EEF5]'
                } ${dragIndex === index ? 'opacity-60' : ''}`}
              >
                <img
                  src={item.url}
                  alt={item.meta.alt || item.file}
                  className="aspect-[4/3] w-full object-cover"
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
                      className="rounded-md border border-[#DDE5EF] bg-white px-2 py-1 text-[11px]"
                      onClick={(event) => {
                        event.stopPropagation();
                        setAsHero(item);
                      }}
                    >
                      Nastavit Hero
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-[#DDE5EF] bg-white px-2 py-1 text-[11px] text-builder-draft"
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
                      Odstranit
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
      className="mt-5 grid gap-3 rounded-[12px] border border-[#E8EEF5] bg-builder-canvas p-4 tablet:grid-cols-2"
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
        className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
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
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-builder-ink">Video Manager</h2>
          <p className="mt-1 text-sm text-builder-muted">
            Náhled · titul · typ · pořadí · aktivní
          </p>
        </div>
        <button
          type="button"
          className="rounded-[10px] border border-builder-navy bg-builder-navy px-3 py-2 text-sm font-medium text-white"
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
                  : 'border-[#E8EEF5] bg-builder-canvas'
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
                className="text-[12px] text-builder-draft"
                onClick={(event) => {
                  event.stopPropagation();
                  const index = model.videos.findIndex((row) => row.key === item.key);
                  if (index >= 0) {
                    onChange(
                      session.setVideosCsv(
                        removeCsvRow(snapshot.working.videosCsv, index),
                      ),
                    );
                  }
                }}
              >
                Odstranit
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
      className="mt-4 grid gap-3 rounded-[12px] border border-[#E8EEF5] bg-builder-canvas p-4 tablet:grid-cols-2"
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
        className="rounded-[10px] border border-builder-navy bg-builder-navy px-4 py-2 text-sm font-medium text-white"
      >
        Uložit video
      </button>
    </form>
  );
}

function FloorPlanStudio({ model }: { readonly model: MediaStudioModel }) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-builder-ink">
        Floor Plan Studio
      </h2>
      <p className="mt-1 text-sm text-builder-muted">
        SVG · validace · vazby na místnosti
      </p>
      <ul className="mt-5 space-y-4">
        {model.floors.map((floor) => (
          <li
            key={floor.floorId}
            className="overflow-hidden rounded-[14px] border border-[#E8EEF5]"
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
      </ul>
      {model.floors.length === 0 && (
        <p className="mt-4 text-sm text-builder-muted">
          Žádná podlaží — doplňte Dispozici (rooms.csv).
        </p>
      )}
    </section>
  );
}

function DocumentLibrary({ model }: { readonly model: MediaStudioModel }) {
  return (
    <section className="rounded-[16px] border border-[#E8EEF5] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-builder-ink">
        Document Library
      </h2>
      <p className="mt-1 text-sm text-builder-muted">
        PDF / DOCX / XLSX — metadata a náhled (Runtime documents)
      </p>
      <ul className="mt-5 space-y-2">
        {model.documents.map((doc) => (
          <li
            key={doc.id}
            className="flex items-center justify-between rounded-[12px] border border-[#E8EEF5] bg-builder-canvas px-4 py-3"
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
      </ul>
      {model.documents.length === 0 && (
        <p className="mt-4 text-sm text-builder-muted">
          Žádné dokumenty v Runtime projection.
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
      <aside className="rounded-[16px] border border-[#E8EEF5] bg-white p-4 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
          Metadata
        </p>
        <p className="mt-2 text-sm text-builder-muted">
          Vyberte médium pro detail.
        </p>
        <UsageLine usages={usages} />
      </aside>
    );
  }

  return (
    <aside className="rounded-[16px] border border-[#E8EEF5] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-builder-muted">
        Metadata
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <MetaRow label="Název" value={meta.title || '—'} />
        <MetaRow label="ALT" value={meta.alt || '—'} />
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
