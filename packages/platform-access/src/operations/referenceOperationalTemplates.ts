import type { OperationalJourneyStep } from './operationalTypes';

export const REFERENCE_CASE_TEMPLATE_IDS = [
  'energy-land',
  'finance-search',
  'layout-family',
] as const;

export type ReferenceCaseTemplateId =
  (typeof REFERENCE_CASE_TEMPLATE_IDS)[number];

export type ReferenceCaseTemplate = {
  readonly templateId: ReferenceCaseTemplateId;
  readonly createdAt: string;
  readonly contact: {
    readonly name: string;
    readonly email: string;
    readonly phone: string | null;
  };
  readonly land: string;
  readonly location: string | null;
  readonly tags: readonly string[];
  readonly score: number;
  readonly insight: (houseName: string) => string;
  readonly journey: readonly OperationalJourneyStep[];
};

/**
 * Production-shaped reference templates. Instantiated per House identity —
 * never keyed by a global DSE House id.
 */
export const REFERENCE_CASE_TEMPLATES: readonly ReferenceCaseTemplate[] = [
  {
    templateId: 'energy-land',
    createdAt: '2026-03-12T09:20:00.000Z',
    contact: {
      name: 'Jana Svobodová',
      email: 'jana.svobodova@example.cz',
      phone: '+420777010101',
    },
    land: 'Mám pozemek',
    location: 'Opava',
    tags: ['Energetická úspora', 'Orientace ke světlu', 'Dispozice 4+kk'],
    score: 88,
    insight: (houseName) =>
      `Klientka strávila nejvíce času vazbou ${houseName} na pozemek a energetickou úsporou. Začněte potvrzením orientace a FVE.`,
    journey: [
      {
        module: 'Úvodní prohlídka',
        title: 'Vstup na prezentaci',
        detail: 'Spuštěno video exteriéru',
        completed: true,
      },
      {
        module: 'Prioritní prohlídka',
        title: 'Nastavení priorit',
        detail: 'Zvýšena váha: Energie & FVE',
        completed: true,
      },
      {
        module: 'Navigátor domu',
        title: 'Prostorové poznání',
        detail: 'Opakovaný návrat k terase a střeše',
        completed: true,
      },
      {
        module: 'Zachycení kontaktu',
        title: 'Kvalifikovaný požadavek',
        detail: 'Odeslána žádost o posouzení osazení na pozemek',
        completed: true,
        active: true,
      },
    ],
  },
  {
    templateId: 'finance-search',
    createdAt: '2026-04-03T14:05:00.000Z',
    contact: {
      name: 'Martin Horák',
      email: 'martin.horak@example.cz',
      phone: '+420777010102',
    },
    land: 'Hledám pozemek',
    location: null,
    tags: ['Měsíční splátka', 'Financování', 'Garáž'],
    score: 72,
    insight: (houseName) =>
      `Klient se u ${houseName} vrací k měsíční splátce a fázování stavby. V hovoru ověřte financování před výběrem pozemku.`,
    journey: [
      {
        module: 'Úvodní prohlídka',
        title: 'Vstup na prezentaci',
        detail: 'Prohlédnuta fotogalerie interiéru',
        completed: true,
      },
      {
        module: 'Navigátor domu',
        title: 'Půdorys 1.NP',
        detail: 'Detailní průchod garáží a technickou místností',
        completed: true,
      },
      {
        module: 'Prioritní prohlídka',
        title: 'Nastavení priorit',
        detail: 'Dominantní priorita: Měsíční splátka',
        completed: true,
      },
      {
        module: 'Zachycení kontaktu',
        title: 'Zanechán kontakt',
        detail: 'Požadavek na konzultaci pozemku',
        completed: true,
        active: true,
      },
    ],
  },
  {
    templateId: 'layout-family',
    createdAt: '2026-05-18T11:40:00.000Z',
    contact: {
      name: 'Eva Králová',
      email: 'eva.kralova@example.cz',
      phone: '+420777010103',
    },
    land: 'Mám pozemek',
    location: 'Olomouc',
    tags: ['Dispozice domu', 'Dětské pokoje', 'Úložné prostory'],
    score: 64,
    insight: (houseName) =>
      `Klientka u ${houseName} řeší velikost dětských pokojů a úložné prostory. Ukažte úpravu dispozice u šatny.`,
    journey: [
      {
        module: 'Úvodní prohlídka',
        title: 'Vstup na prezentaci',
        detail: 'Příchod z mobilního zařízení',
        completed: true,
      },
      {
        module: 'Navigátor domu',
        title: 'Prohlídka dispozice',
        detail: 'Opakovaný návrat do dětských pokojů',
        completed: true,
      },
      {
        module: 'Prioritní prohlídka',
        title: 'Nastavení priorit',
        detail: 'Označena priorita: Úložné prostory',
        active: true,
      },
    ],
  },
];
