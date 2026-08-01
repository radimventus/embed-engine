/**
 * SR-001 — Presentation fixtures aligned to docs/platform/click model.html clientData.
 * Meaning stays illustrative until Decision Guidance Projection is wired.
 */

export type SalesJourneyStep = {
  readonly module: string;
  readonly title: string;
  readonly detail: string;
  readonly completed?: boolean;
  readonly active?: boolean;
};

export type SalesClient = {
  readonly id: string;
  readonly name: string;
  readonly score: number;
  /** Left-column secondary line (click-model client-card). */
  readonly listProject: string;
  /** Center detail project line. */
  readonly project: string;
  readonly tags: readonly string[];
  readonly insight: string;
  readonly journey: readonly SalesJourneyStep[];
};

export const SALES_CLIENTS: readonly SalesClient[] = [
  {
    id: 'novak',
    name: 'Jan Novák',
    score: 88,
    listProject: 'RD Harmony 124 • Mám pozemek',
    project: 'RD Harmony 124 • Mám pozemek (Opava)',
    tags: ['Orientace ke světlu', 'Provozní náklady', 'Dispozice 4+kk'],
    insight:
      'Klient strávil nejvíce času sledováním vazby domu na pozemek v House Navigatoru a prosvětlení obývacího pokoje. Doporučujeme začít rozhovor potvrzením správné orientace domu na jeho pozemku.',
    journey: [
      {
        module: 'Hero Experience',
        title: 'Vstup na prezentaci',
        detail: 'Spuštěno video exteriéru, stráveno 45s',
        completed: true,
      },
      {
        module: 'Social Proof',
        title: 'Sociální validace',
        detail: 'Zobrazeny dotazy ostatních na zastavěnou plochu',
        completed: true,
      },
      {
        module: 'House Navigator',
        title: 'Prostorové poznání',
        detail: '4x otevřena obývací část + terasy na JZ',
        completed: true,
      },
      {
        module: 'Priority Experience',
        title: 'Nastavení priorit',
        detail: 'Zvýšena váha: Prosvětlení & FVE',
        completed: true,
      },
      {
        module: 'AI Advisor',
        title: 'Dotaz na vytápění',
        detail: 'Položen dotaz na roční provozní náklady TČ',
        completed: true,
      },
      {
        module: 'Lead Capture',
        title: 'Kvalifikovaný požadavek',
        detail: 'Odeslána žádost o posouzení osazení na pozemek',
        active: true,
      },
    ],
  },
  {
    id: 'dvorak',
    name: 'Petr Dvořák',
    score: 72,
    listProject: 'Villa 168 • Hledám pozemek',
    project: 'Villa 168 • Hledám pozemek',
    tags: ['Tepelné čerpadlo', 'Financování', 'Garáž'],
    insight:
      'Klient se opakovaně vrací k finanční kalkulaci a garážovému stání. V rozhovoru se zaměřte na možnosti fázování stavby a měsíční splátku.',
    journey: [
      {
        module: 'Hero Experience',
        title: 'Vstup na prezentaci',
        detail: 'Prohlédnuta fotogalerie interiéru',
        completed: true,
      },
      {
        module: 'House Navigator',
        title: 'Půdorys 1.NP',
        detail: 'Detailní průchod garáží a technickou místností',
        completed: true,
      },
      {
        module: 'Priority Experience',
        title: 'Nastavení priorit',
        detail: 'Dominantní priorita: Měsíční splátka',
        completed: true,
      },
      {
        module: 'Lead Capture',
        title: 'Zanechán kontakt',
        detail: 'Požadavek na konzultaci pozemku',
        active: true,
      },
    ],
  },
  {
    id: 'kucerova',
    name: 'Marie Kučerová',
    score: 65,
    listProject: 'Family 98 • Mám pozemek',
    project: 'Family 98 • Mám pozemek',
    tags: ['Kompaktní rozměr', 'Dětské pokoje'],
    insight:
      'Klientka řeší především velikost dětských pokojů a úložné prostory. Doporučujeme ukázat úpravu dispozice u šatny.',
    journey: [
      {
        module: 'Hero Experience',
        title: 'Vstup na prezentaci',
        detail: 'Příchod z mobilního zařízení',
        completed: true,
      },
      {
        module: 'House Navigator',
        title: 'Prohlídka 2.NP',
        detail: 'Opakovaný návrat do Dětského pokoje 1 a 2',
        completed: true,
      },
      {
        module: 'Priority Experience',
        title: 'Nastavení priorit',
        detail: 'Označena priorita: Úložné prostory',
        completed: true,
      },
    ],
  },
];

export const HIGH_INTENT_THRESHOLD = 65;
