import type {
  ActiveProjectModel,
  AssetCategoryId,
  AssetCollection,
  AssetFile,
  AssetUiState,
  PartnerCard,
  ProjectPipelineSnapshot,
  ProjectRecord,
} from '../model';
import { ASSET_CATEGORY_ORDER, createEmptyAssetCollections } from '../model';

export const MOCK_PARTNER: PartnerCard = {
  id: 'partner-ac-modular',
  name: 'AC Modular',
};

export const MOCK_PROJECTS: readonly ProjectRecord[] = [
  {
    projectId: 'harmony-124',
    name: 'Harmony 124',
    customer: 'AC Modular',
    status: 'Published',
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-08-17T08:43:00.000Z',
    manifestPath: '/builder/projects/harmony-124/manifest.json',
    lastSyncedAt: '2026-08-17T08:43:00.000Z',
    syncStatus: 'Synced',
  },
  {
    projectId: 'family-98',
    name: 'Family 98',
    customer: 'AC Modular',
    status: 'Draft',
    createdAt: '2026-07-10T10:00:00.000Z',
    updatedAt: '2026-08-12T14:20:00.000Z',
    manifestPath: '/builder/projects/family-98/manifest.json',
    lastSyncedAt: '2026-08-12T14:20:00.000Z',
    syncStatus: 'Synced',
  },
  {
    projectId: 'villa-168',
    name: 'Villa 168',
    customer: 'AC Modular',
    status: 'Draft',
    createdAt: '2026-07-22T11:30:00.000Z',
    updatedAt: '2026-08-15T09:05:00.000Z',
    manifestPath: '/builder/projects/villa-168/manifest.json',
    lastSyncedAt: '2026-08-15T09:05:00.000Z',
    syncStatus: 'Synchronizing',
  },
];

export const MOCK_PIPELINE_BY_PROJECT: Readonly<
  Record<string, ProjectPipelineSnapshot>
> = {
  'harmony-124': {
    projectId: 'harmony-124',
    validationStatus: 'Ready',
    buildStatus: 'Ready',
    publishStatus: 'Ready',
    mediaReadyPercent: 100,
    layoutReadyPercent: 75,
    knowledgeReadyPercent: 40,
    localPreviewUrl: 'http://localhost:3000/harmony-124',
    embedSnippet:
      '<script src="https://embed.conis.ai/harmony124.js"></script>',
  },
  'family-98': {
    projectId: 'family-98',
    validationStatus: 'Pending',
    buildStatus: 'Idle',
    publishStatus: 'Idle',
    mediaReadyPercent: 60,
    layoutReadyPercent: 20,
    knowledgeReadyPercent: 10,
    localPreviewUrl: 'http://localhost:3000/family-98',
    embedSnippet:
      '<script src="https://embed.conis.ai/family98.js"></script>',
  },
  'villa-168': {
    projectId: 'villa-168',
    validationStatus: 'Validation Error',
    buildStatus: 'Failed',
    publishStatus: 'Blocked',
    mediaReadyPercent: 40,
    layoutReadyPercent: 15,
    knowledgeReadyPercent: 5,
    localPreviewUrl: 'http://localhost:3000/villa-168',
    embedSnippet:
      '<script src="https://embed.conis.ai/villa168.js"></script>',
  },
};

function file(
  assetId: string,
  name: string,
  sizeBytes: number,
  uploadedAt: string,
  mimeType: string,
  label: string,
  description = '',
  altText = '',
): AssetFile {
  return {
    assetId,
    name,
    sizeBytes,
    uploadedAt,
    mimeType,
    metadata: { label, description, altText },
  };
}

function withFiles(
  categoryId: AssetCategoryId,
  files: readonly AssetFile[],
  state?: AssetUiState,
): AssetCollection {
  const definition = ASSET_CATEGORY_ORDER.find(
    (item) => item.categoryId === categoryId,
  );
  if (definition === undefined) {
    throw new Error(`Unknown asset category: ${categoryId}`);
  }

  return {
    categoryId,
    sectionId: definition.sectionId,
    title: definition.title,
    description: definition.description,
    acceptHint: definition.acceptHint,
    state: state ?? (files.length === 0 ? 'Empty' : 'Ready'),
    files,
  };
}

function buildActiveProject(
  record: ProjectRecord,
  media: readonly AssetCollection[],
  layout: readonly AssetCollection[],
  knowledge: readonly AssetCollection[],
  notes: string,
  locationLabel: string,
): ActiveProjectModel {
  return {
    projectId: record.projectId,
    record,
    metadata: {
      title: record.name,
      partnerName: record.customer,
      locationLabel,
      notes,
    },
    assets: { media, layout, knowledge },
  };
}

function emptyProjectContent(record: ProjectRecord): ActiveProjectModel {
  const empty = createEmptyAssetCollections();
  return buildActiveProject(
    record,
    empty.media,
    empty.layout,
    empty.knowledge,
    '',
    'Neuvedeno',
  );
}

export function createMockActiveProjects(
  projects: readonly ProjectRecord[] = MOCK_PROJECTS,
): Map<string, ActiveProjectModel> {
  const byId = new Map(projects.map((project) => [project.projectId, project]));
  const content = new Map<string, ActiveProjectModel>();

  const harmony = byId.get('harmony-124');
  if (harmony !== undefined) {
    content.set(
      harmony.projectId,
      buildActiveProject(
        harmony,
        [
          withFiles('photographs', [
            file(
              'h124-photo-1',
              'IMG_001.jpg',
              2_450_000,
              '2026-08-10T09:00:00.000Z',
              'image/jpeg',
              'Exteriér jih',
              'Hlavní fasáda',
              'Dům Harmony z jihu',
            ),
            file(
              'h124-photo-2',
              'IMG_002.jpg',
              1_980_000,
              '2026-08-10T09:05:00.000Z',
              'image/jpeg',
              'Obývací pokoj',
            ),
            file(
              'h124-photo-3',
              'IMG_003.jpg',
              2_120_000,
              '2026-08-10T09:10:00.000Z',
              'image/jpeg',
              'Kuchyň',
            ),
            file(
              'h124-photo-4',
              'IMG_004.jpg',
              1_760_000,
              '2026-08-11T11:20:00.000Z',
              'image/jpeg',
              'Ložnice',
            ),
            file(
              'h124-photo-5',
              'IMG_005.jpg',
              2_010_000,
              '2026-08-11T11:25:00.000Z',
              'image/jpeg',
              'Zahrada',
            ),
            file(
              'h124-photo-6',
              'IMG_006.jpg',
              1_540_000,
              '2026-08-12T08:40:00.000Z',
              'image/jpeg',
              'Detail terasy',
            ),
          ]),
          withFiles('video', [
            file(
              'h124-video-1',
              'https://youtu.be/dQw4w9WgXcQ',
              0,
              '2026-08-12T10:00:00.000Z',
              'text/uri-list',
              'Prohlídka Harmony',
              'YouTube odkaz',
            ),
          ]),
          withFiles('hero', [
            file(
              'h124-hero-1',
              'hero-harmony.jpg',
              3_200_000,
              '2026-08-13T07:30:00.000Z',
              'image/jpeg',
              'Hero Harmony',
              'Landing hero',
              'Harmony 124 hero',
            ),
          ]),
        ],
        [
          withFiles('svg', [
            file(
              'h124-svg-1',
              'harmony-navigator.svg',
              184_000,
              '2026-08-14T12:00:00.000Z',
              'image/svg+xml',
              'Navigator SVG',
            ),
          ]),
          withFiles('csv-rooms', [
            file(
              'h124-rooms-1',
              'rooms.csv',
              12_400,
              '2026-08-14T12:10:00.000Z',
              'text/csv',
              'Rooms CSV',
            ),
          ]),
          withFiles('csv-images', [
            file(
              'h124-images-1',
              'images.csv',
              9_800,
              '2026-08-14T12:15:00.000Z',
              'text/csv',
              'Images CSV',
            ),
          ]),
          withFiles('floorplan', [], 'Empty'),
        ],
        [
          withFiles('pdf', [
            file(
              'h124-pdf-1',
              'technicky-list.pdf',
              890_000,
              '2026-08-15T09:00:00.000Z',
              'application/pdf',
              'Technický list',
            ),
          ]),
          withFiles('docx', [
            file(
              'h124-docx-1',
              'faq-harmony.docx',
              240_000,
              '2026-08-15T09:20:00.000Z',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'FAQ',
            ),
          ]),
          withFiles('xlsx', [], 'Empty'),
        ],
        'Kompletní mock obsah pro Foundation Workspace.',
        'Praha-východ',
      ),
    );
  }

  const family = byId.get('family-98');
  if (family !== undefined) {
    content.set(
      family.projectId,
      buildActiveProject(
        family,
        [
          withFiles('photographs', [
            file(
              'f98-photo-1',
              'family-front.jpg',
              1_800_000,
              '2026-08-08T10:00:00.000Z',
              'image/jpeg',
              'Čelní pohled',
            ),
            file(
              'f98-photo-2',
              'family-side.jpg',
              1_650_000,
              '2026-08-08T10:05:00.000Z',
              'image/jpeg',
              'Bok',
            ),
          ]),
          withFiles('video', [], 'Empty'),
          withFiles('hero', [], 'Empty'),
        ],
        [
          withFiles('svg', [], 'Empty'),
          withFiles('csv-rooms', [], 'Empty'),
          withFiles('csv-images', [], 'Empty'),
          withFiles('floorplan', [], 'Empty'),
        ],
        [
          withFiles('pdf', [], 'Empty'),
          withFiles('docx', [], 'Empty'),
          withFiles('xlsx', [], 'Empty'),
        ],
        'Rozpracovaný draft.',
        'Brno',
      ),
    );
  }

  const villa = byId.get('villa-168');
  if (villa !== undefined) {
    content.set(
      villa.projectId,
      buildActiveProject(
        villa,
        [
          withFiles(
            'photographs',
            [
              file(
                'v168-photo-1',
                'villa-broken.jpg',
                420_000,
                '2026-08-09T08:00:00.000Z',
                'image/jpeg',
                'Poškozený soubor',
              ),
            ],
            'Error',
          ),
          withFiles('video', [], 'Loading'),
          withFiles('hero', [], 'Empty'),
        ],
        [
          withFiles('svg', [], 'Error'),
          withFiles('csv-rooms', [], 'Empty'),
          withFiles('csv-images', [], 'Empty'),
          withFiles('floorplan', [], 'Loading'),
        ],
        [
          withFiles('pdf', [], 'Empty'),
          withFiles('docx', [], 'Empty'),
          withFiles('xlsx', [], 'Empty'),
        ],
        'Mock Error/Loading stavy pro UI.',
        'Ostrava',
      ),
    );
  }

  for (const project of projects) {
    if (!content.has(project.projectId)) {
      content.set(project.projectId, emptyProjectContent(project));
    }
  }

  return content;
}
