/**
 * EPIC-BX-05 — Media presentation metadata (ALT, title, description, focal).
 * Overlay only — binary/media paths remain HP-002 SSOT (ADR-023).
 */

export const MEDIA_PRESENTATION_STORAGE_KEY =
  'conis.builder.media-presentation.v1' as const;

export type MediaPresentationMeta = {
  readonly title: string;
  readonly alt: string;
  readonly description: string;
  readonly author: string;
  readonly focalX: number;
  readonly focalY: number;
  readonly active: boolean;
  readonly updatedAt: string;
};

export type MediaPresentationStore = {
  readonly byProjectId: Readonly<
    Record<string, Readonly<Record<string, MediaPresentationMeta>>>
  >;
};

export function emptyMediaPresentationStore(): MediaPresentationStore {
  return { byProjectId: {} };
}

export function defaultMediaPresentationMeta(
  title = '',
): MediaPresentationMeta {
  return {
    title,
    alt: title,
    description: '',
    author: 'uživatel',
    focalX: 50,
    focalY: 50,
    active: true,
    updatedAt: new Date().toISOString(),
  };
}

export function loadMediaPresentationStore(): MediaPresentationStore {
  if (typeof localStorage === 'undefined') {
    return emptyMediaPresentationStore();
  }
  try {
    const raw = localStorage.getItem(MEDIA_PRESENTATION_STORAGE_KEY);
    if (raw === null || raw.length === 0) {
      return emptyMediaPresentationStore();
    }
    const parsed = JSON.parse(raw) as MediaPresentationStore;
    if (parsed?.byProjectId == null) {
      return emptyMediaPresentationStore();
    }
    return parsed;
  } catch {
    return emptyMediaPresentationStore();
  }
}

export function saveMediaPresentationStore(store: MediaPresentationStore): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(MEDIA_PRESENTATION_STORAGE_KEY, JSON.stringify(store));
}

export function getMediaPresentationMeta(
  projectId: string,
  assetKey: string,
  fallbackTitle = '',
): MediaPresentationMeta {
  const store = loadMediaPresentationStore();
  return (
    store.byProjectId[projectId]?.[assetKey] ??
    defaultMediaPresentationMeta(fallbackTitle)
  );
}

export function setMediaPresentationMeta(
  projectId: string,
  assetKey: string,
  meta: MediaPresentationMeta,
): void {
  const store = loadMediaPresentationStore();
  const project = store.byProjectId[projectId] ?? {};
  saveMediaPresentationStore({
    byProjectId: {
      ...store.byProjectId,
      [projectId]: {
        ...project,
        [assetKey]: {
          ...meta,
          updatedAt: new Date().toISOString(),
        },
      },
    },
  });
}
