/**
 * EPIC-BX-04 — project Knowledge view-model from HP-002 + Runtime defaults.
 * Does not invent persistence — only projects existing sources.
 */

import { parseCsv } from '@embed-engine/object-house/builder-package';
import { BUILDER_RUNTIME_HOUSE_DEFAULTS } from '../../../../client-studio/src/features/client-studio/runtime/builderRuntimeHouseDefaults';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import { loadExperienceComposition } from '../experience-composer/experienceComposerStorage';
import {
  getKnowledgeCategory,
  KNOWLEDGE_CATEGORY_CATALOG,
  type KnowledgeCategoryId,
  type KnowledgeRuntimeDependency,
} from './knowledgeCatalog';

export type KnowledgeHealth = 'complete' | 'partial' | 'missing';

export type KnowledgeFieldValue = {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly editable: boolean;
};

export type KnowledgeCategoryView = {
  readonly id: KnowledgeCategoryId;
  readonly label: string;
  readonly description: string;
  readonly summary: string;
  readonly health: KnowledgeHealth;
  readonly itemCount: number;
  readonly updatedAt: string;
  readonly dependencies: readonly KnowledgeRuntimeDependency[];
  readonly fields: readonly KnowledgeFieldValue[];
  /** Navigate into HP / Experience editors when structured edit is delegated. */
  readonly editTarget:
    | { readonly kind: 'hp'; readonly nav: 'rooms' | 'gallery' | 'videos' | 'media' | 'plans' }
    | { readonly kind: 'experience-faq' }
    | { readonly kind: 'inline-readonly' }
    | { readonly kind: 'inline-rooms' }
    | { readonly kind: 'inline-faq' };
};

export type KnowledgeDashboardModel = {
  readonly categories: readonly KnowledgeCategoryView[];
  readonly missingCount: number;
  readonly partialCount: number;
  readonly completeCount: number;
  readonly lastChangedLabel: string;
};

export function buildKnowledgeDashboardModel(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
}): KnowledgeDashboardModel {
  const categories = KNOWLEDGE_CATEGORY_CATALOG.map((def) =>
    buildCategoryView(def.id, input.projectId, input.snapshot),
  );
  const missingCount = categories.filter((item) => item.health === 'missing').length;
  const partialCount = categories.filter((item) => item.health === 'partial').length;
  const completeCount = categories.filter((item) => item.health === 'complete').length;
  const latest = categories.reduce(
    (max, item) => (item.updatedAt > max ? item.updatedAt : max),
    input.snapshot?.mountedAt ?? new Date(0).toISOString(),
  );

  return {
    categories,
    missingCount,
    partialCount,
    completeCount,
    lastChangedLabel: formatCzechDateTime(latest),
  };
}

export function buildCategoryView(
  categoryId: KnowledgeCategoryId,
  projectId: string,
  snapshot: HousePackageEditSnapshot | null,
): KnowledgeCategoryView {
  const def = getKnowledgeCategory(categoryId);
  const defaults = BUILDER_RUNTIME_HOUSE_DEFAULTS;
  const pkg = snapshot?.validation.builderImport ?? null;
  const rooms = pkg?.rooms.rooms ?? [];
  const gallery = pkg?.gallery.entries ?? [];
  const videos = pkg?.videos.entries ?? [];
  const floors = pkg?.floors.floors ?? [];
  const experience = loadExperienceComposition(
    projectId,
    snapshot?.working.heroRelativePath,
  );
  const faqItems = experience.configs.faq.items;
  const updatedAt = snapshot?.mountedAt ?? experience.updatedAt;

  switch (categoryId) {
    case 'object': {
      const fields: KnowledgeFieldValue[] = [
        field('title', 'Název', defaults.identity.title, false),
        field('reference', 'Reference', defaults.identity.reference, false),
        field('price', 'Cena', formatPrice(defaults.overview.price), false),
        field(
          'usableArea',
          'Užitná plocha',
          `${defaults.overview.usableArea} m²`,
          false,
        ),
        field('roomCount', 'Počet místností', String(rooms.length), false),
      ];
      return card(def, fields, rooms.length > 0 ? 'complete' : 'partial', rooms.length, updatedAt, {
        kind: 'inline-readonly',
      });
    }
    case 'land': {
      const fields = [
        field('landArea', 'Plocha pozemku', `${defaults.overview.landArea} m²`, false),
        field('hasGarden', 'Zahrada', defaults.overview.hasGarden ? 'Ano' : 'Ne', false),
      ];
      return card(def, fields, 'complete', 2, updatedAt, { kind: 'inline-readonly' });
    }
    case 'layout': {
      const fields = rooms.map((room) =>
        field(
          room.roomId,
          room.name,
          `${room.area} m² · ${room.floorId}`,
          true,
        ),
      );
      const health: KnowledgeHealth =
        rooms.length === 0 ? 'missing' : rooms.length < 3 ? 'partial' : 'complete';
      return card(def, fields, health, rooms.length, updatedAt, {
        kind: 'inline-rooms',
      });
    }
    case 'construction': {
      const fields = [
        field('construction', 'Typ konstrukce', defaults.metadata.construction, false),
        field('reference', 'Reference', defaults.identity.reference, false),
      ];
      const health: KnowledgeHealth =
        defaults.metadata.construction.trim().length === 0 ? 'missing' : 'complete';
      return card(def, fields, health, fields.length, updatedAt, {
        kind: 'inline-readonly',
      });
    }
    case 'materials': {
      const value = defaults.metadata.construction;
      const fields = [field('construction', 'Materiál / konstrukce', value, false)];
      return card(
        def,
        fields,
        value.trim().length === 0 ? 'missing' : 'partial',
        1,
        updatedAt,
        { kind: 'inline-readonly' },
      );
    }
    case 'technology': {
      const docs = defaults.documents ?? [];
      const fields = docs.map((doc) =>
        field(doc.id, doc.title, doc.url, false),
      );
      return card(
        def,
        fields,
        docs.length === 0 ? 'missing' : 'complete',
        docs.length,
        updatedAt,
        { kind: 'inline-readonly' },
      );
    }
    case 'energy': {
      const value = defaults.metadata.energyClass;
      const fields = [field('energyClass', 'Energetická třída', value || 'Neuvedeno', false)];
      return card(
        def,
        fields,
        value.trim().length === 0 ? 'missing' : 'complete',
        1,
        updatedAt,
        { kind: 'inline-readonly' },
      );
    }
    case 'location': {
      const fields = [
        field('city', 'Město', defaults.location.city, false),
        field('district', 'Lokalita', defaults.location.district, false),
      ];
      return card(def, fields, 'complete', 2, updatedAt, { kind: 'inline-readonly' });
    }
    case 'financing': {
      const fields = [field('price', 'Cena', formatPrice(defaults.overview.price), false)];
      return card(def, fields, 'complete', 1, updatedAt, { kind: 'inline-readonly' });
    }
    case 'service': {
      const docs = defaults.documents ?? [];
      const fields = docs.map((doc) => field(doc.id, doc.title, doc.url, false));
      return card(
        def,
        fields,
        docs.length === 0 ? 'missing' : 'partial',
        docs.length,
        updatedAt,
        { kind: 'inline-readonly' },
      );
    }
    case 'faq': {
      const fields = faqItems.map((item, index) =>
        field(`faq-${index}`, item.question, item.answer, true),
      );
      const health: KnowledgeHealth =
        faqItems.length === 0 ? 'missing' : faqItems.length < 2 ? 'partial' : 'complete';
      return card(def, fields, health, faqItems.length, experience.updatedAt, {
        kind: 'inline-faq',
      });
    }
    case 'ai-context': {
      const fields = [
        field('objectId', 'Object ID', defaults.identity.id, false),
        field('title', 'Název', defaults.identity.title, false),
        field('reference', 'Reference', defaults.identity.reference, false),
        field('city', 'Město', defaults.location.city, false),
        field('construction', 'Konstrukce', defaults.metadata.construction, false),
        field('energyClass', 'Energetická třída', defaults.metadata.energyClass, false),
        field(
          'usableArea',
          'Užitná plocha',
          `${defaults.overview.usableArea} m²`,
          false,
        ),
        field('roomCount', 'Místnosti (HP)', String(rooms.length), false),
        field('galleryCount', 'Galerie (HP)', String(gallery.length), false),
        field('videoCount', 'Videa (HP)', String(videos.length), false),
        field('floorCount', 'Podlaží (HP)', String(floors.length), false),
      ];
      return card(
        def,
        fields,
        rooms.length > 0 ? 'complete' : 'partial',
        fields.length,
        updatedAt,
        { kind: 'inline-readonly' },
      );
    }
  }
}

export function searchKnowledgeCategories(
  categories: readonly KnowledgeCategoryView[],
  query: string,
): readonly KnowledgeCategoryView[] {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return categories;
  }
  return categories.filter((category) => {
    if (category.label.toLowerCase().includes(normalized)) return true;
    if (category.description.toLowerCase().includes(normalized)) return true;
    if (category.summary.toLowerCase().includes(normalized)) return true;
    return category.fields.some(
      (item) =>
        item.label.toLowerCase().includes(normalized) ||
        item.value.toLowerCase().includes(normalized) ||
        item.key.toLowerCase().includes(normalized),
    );
  });
}

export function healthGlyph(health: KnowledgeHealth): string {
  if (health === 'complete') return '✔';
  if (health === 'partial') return '⚠';
  return '✖';
}

export function healthLabel(health: KnowledgeHealth): string {
  if (health === 'complete') return 'Kompletní';
  if (health === 'partial') return 'Doplnit';
  return 'Chybí';
}

function card(
  def: ReturnType<typeof getKnowledgeCategory>,
  fields: readonly KnowledgeFieldValue[],
  health: KnowledgeHealth,
  itemCount: number,
  updatedAt: string,
  editTarget: KnowledgeCategoryView['editTarget'],
): KnowledgeCategoryView {
  return {
    id: def.id,
    label: def.label,
    description: def.description,
    summary: fields
      .slice(0, 2)
      .map((item) => `${item.label}: ${item.value}`)
      .join(' · '),
    health,
    itemCount,
    updatedAt,
    dependencies: def.dependencies,
    fields,
    editTarget,
  };
}

function field(
  key: string,
  label: string,
  value: string,
  editable: boolean,
): KnowledgeFieldValue {
  return { key, label, value, editable };
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCzechDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Helpers for structured room editing over existing rooms.csv */
export function listRoomRows(snapshot: HousePackageEditSnapshot): readonly {
  readonly floor: string;
  readonly room: string;
  readonly name: string;
  readonly area: string;
}[] {
  const table = parseCsv(snapshot.working.roomsCsv);
  return table.rows.map((row) => ({
    floor: row.floor ?? '',
    room: row.room ?? '',
    name: row.name ?? '',
    area: row.area ?? '',
  }));
}
