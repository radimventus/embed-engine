import type {
  AssetCategoryId,
  AssetCollection,
  AssetSectionId,
  AssetUiState,
} from './types';

type CategoryDefinition = {
  readonly categoryId: AssetCategoryId;
  readonly sectionId: AssetSectionId;
  readonly title: string;
  readonly description: string;
  readonly acceptHint: string;
};

export const ASSET_CATEGORY_ORDER: readonly CategoryDefinition[] = [
  {
    categoryId: 'photographs',
    sectionId: 'media',
    title: 'Fotografie',
    description: 'Galerie fotografií objektu.',
    acceptHint: 'image/*',
  },
  {
    categoryId: 'video',
    sectionId: 'media',
    title: 'Video',
    description: 'Video odkaz nebo soubor.',
    acceptHint: 'video/*,url',
  },
  {
    categoryId: 'hero',
    sectionId: 'media',
    title: 'Hero',
    description: 'Hlavní vizuál Experience.',
    acceptHint: 'image/*',
  },
  {
    categoryId: 'svg',
    sectionId: 'layout',
    title: 'SVG',
    description: 'Vektorový podklad House Navigatoru.',
    acceptHint: '.svg',
  },
  {
    categoryId: 'csv-rooms',
    sectionId: 'layout',
    title: 'CSV Rooms',
    description: 'CSV místností.',
    acceptHint: '.csv',
  },
  {
    categoryId: 'csv-images',
    sectionId: 'layout',
    title: 'CSV Images',
    description: 'CSV mapování obrázků.',
    acceptHint: '.csv',
  },
  {
    categoryId: 'floorplan',
    sectionId: 'layout',
    title: 'Floorplan',
    description: 'Půdorys objektu.',
    acceptHint: 'image/*,.pdf',
  },
  {
    categoryId: 'pdf',
    sectionId: 'knowledge',
    title: 'PDF',
    description: 'Dokumentace pro AI.',
    acceptHint: '.pdf',
  },
  {
    categoryId: 'docx',
    sectionId: 'knowledge',
    title: 'DOCX',
    description: 'Textové znalosti.',
    acceptHint: '.docx,.doc',
  },
  {
    categoryId: 'xlsx',
    sectionId: 'knowledge',
    title: 'XLSX',
    description: 'Tabulkové znalosti.',
    acceptHint: '.xlsx,.xls',
  },
] as const;

function deriveState(fileCount: number, forced?: AssetUiState): AssetUiState {
  if (forced !== undefined) {
    return forced;
  }
  return fileCount === 0 ? 'Empty' : 'Ready';
}

export function createEmptyAssetCollections(
  forcedStates: Partial<Record<AssetCategoryId, AssetUiState>> = {},
): {
  readonly media: AssetCollection[];
  readonly layout: AssetCollection[];
  readonly knowledge: AssetCollection[];
} {
  const media: AssetCollection[] = [];
  const layout: AssetCollection[] = [];
  const knowledge: AssetCollection[] = [];

  for (const definition of ASSET_CATEGORY_ORDER) {
    const collection: AssetCollection = {
      categoryId: definition.categoryId,
      sectionId: definition.sectionId,
      title: definition.title,
      description: definition.description,
      acceptHint: definition.acceptHint,
      state: deriveState(0, forcedStates[definition.categoryId]),
      files: [],
    };

    if (definition.sectionId === 'media') {
      media.push(collection);
    } else if (definition.sectionId === 'layout') {
      layout.push(collection);
    } else {
      knowledge.push(collection);
    }
  }

  return { media, layout, knowledge };
}

export function findAssetCollection(
  collections: {
    readonly media: readonly AssetCollection[];
    readonly layout: readonly AssetCollection[];
    readonly knowledge: readonly AssetCollection[];
  },
  categoryId: AssetCategoryId,
): AssetCollection | null {
  const all = [
    ...collections.media,
    ...collections.layout,
    ...collections.knowledge,
  ];
  return all.find((item) => item.categoryId === categoryId) ?? null;
}
