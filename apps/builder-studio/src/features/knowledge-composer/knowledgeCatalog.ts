/**
 * EPIC-BX-04 — Knowledge category catalog (presentation over existing data).
 * No parallel Knowledge model — categories map to HP-002 + Runtime projection defaults.
 */

export type KnowledgeCategoryId =
  | 'object'
  | 'land'
  | 'layout'
  | 'construction'
  | 'materials'
  | 'technology'
  | 'energy'
  | 'location'
  | 'financing'
  | 'service'
  | 'faq'
  | 'ai-context';

export type KnowledgeRuntimeDependency =
  | 'Priority'
  | 'FAQ'
  | 'AI'
  | 'Runtime'
  | 'Lead'
  | 'House Navigator'
  | 'Experience';

export type KnowledgeFieldKind = 'text' | 'number' | 'boolean' | 'list';

export type KnowledgeFieldDef = {
  readonly key: string;
  readonly label: string;
  readonly kind: KnowledgeFieldKind;
  /** Where the value comes from — never a new Knowledge store. */
  readonly source: 'hp-rooms' | 'hp-gallery' | 'hp-videos' | 'hp-hero' | 'hp-plans' | 'runtime-defaults' | 'experience-faq' | 'runtime-ai';
  readonly editable: boolean;
};

export type KnowledgeCategoryDef = {
  readonly id: KnowledgeCategoryId;
  readonly label: string;
  readonly description: string;
  readonly dependencies: readonly KnowledgeRuntimeDependency[];
  readonly fields: readonly KnowledgeFieldDef[];
};

export const KNOWLEDGE_CATEGORY_CATALOG: readonly KnowledgeCategoryDef[] = [
  {
    id: 'object',
    label: 'Objekt',
    description: 'Identita a základní parametry objektu.',
    dependencies: ['Runtime', 'Experience', 'Priority'],
    fields: [
      { key: 'title', label: 'Název', kind: 'text', source: 'runtime-defaults', editable: false },
      { key: 'reference', label: 'Reference', kind: 'text', source: 'runtime-defaults', editable: false },
      { key: 'price', label: 'Cena', kind: 'number', source: 'runtime-defaults', editable: false },
      { key: 'usableArea', label: 'Užitná plocha', kind: 'number', source: 'runtime-defaults', editable: false },
      { key: 'roomCount', label: 'Počet místností', kind: 'number', source: 'hp-rooms', editable: false },
    ],
  },
  {
    id: 'land',
    label: 'Pozemek',
    description: 'Pozemek a zahrada.',
    dependencies: ['Runtime', 'Experience'],
    fields: [
      { key: 'landArea', label: 'Plocha pozemku', kind: 'number', source: 'runtime-defaults', editable: false },
      { key: 'hasGarden', label: 'Zahrada', kind: 'boolean', source: 'runtime-defaults', editable: false },
    ],
  },
  {
    id: 'layout',
    label: 'Dispozice',
    description: 'Místnosti a plochy z House Package.',
    dependencies: ['Runtime', 'House Navigator', 'Priority', 'Experience'],
    fields: [
      { key: 'rooms', label: 'Místnosti', kind: 'list', source: 'hp-rooms', editable: true },
    ],
  },
  {
    id: 'construction',
    label: 'Konstrukce',
    description: 'Nosný systém a konstrukční typ.',
    dependencies: ['Runtime', 'Experience', 'AI'],
    fields: [
      { key: 'construction', label: 'Typ konstrukce', kind: 'text', source: 'runtime-defaults', editable: false },
      { key: 'reference', label: 'Reference', kind: 'text', source: 'runtime-defaults', editable: false },
    ],
  },
  {
    id: 'materials',
    label: 'Materiály',
    description: 'Materiály odvozené z konstrukčních údajů Runtime.',
    dependencies: ['Runtime', 'AI'],
    fields: [
      { key: 'construction', label: 'Materiál / konstrukce', kind: 'text', source: 'runtime-defaults', editable: false },
    ],
  },
  {
    id: 'technology',
    label: 'Technologie',
    description: 'Technologické dokumenty a vazby projektu.',
    dependencies: ['Runtime', 'Lead'],
    fields: [
      { key: 'documents', label: 'Dokumenty', kind: 'list', source: 'runtime-defaults', editable: false },
    ],
  },
  {
    id: 'energy',
    label: 'Energetická řešení',
    description: 'Energetická třída a související fakta.',
    dependencies: ['Runtime', 'Experience', 'AI'],
    fields: [
      { key: 'energyClass', label: 'Energetická třída', kind: 'text', source: 'runtime-defaults', editable: false },
    ],
  },
  {
    id: 'location',
    label: 'Lokalita',
    description: 'Město a lokalita objektu.',
    dependencies: ['Runtime', 'Experience', 'Lead'],
    fields: [
      { key: 'city', label: 'Město', kind: 'text', source: 'runtime-defaults', editable: false },
      { key: 'district', label: 'Lokalita', kind: 'text', source: 'runtime-defaults', editable: false },
    ],
  },
  {
    id: 'financing',
    label: 'Financování',
    description: 'Cenové a komerční údaje Runtime.',
    dependencies: ['Runtime', 'Lead', 'AI'],
    fields: [
      { key: 'price', label: 'Cena', kind: 'number', source: 'runtime-defaults', editable: false },
    ],
  },
  {
    id: 'service',
    label: 'Servis',
    description: 'Servisní dokumenty projektu.',
    dependencies: ['Lead', 'Runtime'],
    fields: [
      { key: 'documents', label: 'Dokumenty', kind: 'list', source: 'runtime-defaults', editable: false },
    ],
  },
  {
    id: 'faq',
    label: 'FAQ',
    description: 'FAQ Experience Composeru (prezentace Decision Experience).',
    dependencies: ['FAQ', 'AI', 'Experience'],
    fields: [
      { key: 'items', label: 'Otázky a odpovědi', kind: 'list', source: 'experience-faq', editable: true },
    ],
  },
  {
    id: 'ai-context',
    label: 'AI Knowledge',
    description: 'Objektový kontext, který Runtime vystavuje AI Advisoru.',
    dependencies: ['AI', 'Runtime', 'Priority'],
    fields: [
      { key: 'objectId', label: 'Object ID', kind: 'text', source: 'runtime-ai', editable: false },
      { key: 'title', label: 'Název', kind: 'text', source: 'runtime-ai', editable: false },
      { key: 'reference', label: 'Reference', kind: 'text', source: 'runtime-ai', editable: false },
      { key: 'city', label: 'Město', kind: 'text', source: 'runtime-ai', editable: false },
      { key: 'construction', label: 'Konstrukce', kind: 'text', source: 'runtime-ai', editable: false },
      { key: 'energyClass', label: 'Energetická třída', kind: 'text', source: 'runtime-ai', editable: false },
      { key: 'usableArea', label: 'Užitná plocha', kind: 'number', source: 'runtime-ai', editable: false },
    ],
  },
] as const;

export function getKnowledgeCategory(
  id: KnowledgeCategoryId,
): KnowledgeCategoryDef {
  return (
    KNOWLEDGE_CATEGORY_CATALOG.find((item) => item.id === id) ??
    KNOWLEDGE_CATEGORY_CATALOG[0]
  );
}
