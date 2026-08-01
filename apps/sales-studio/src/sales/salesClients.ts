/**
 * SR-001 / SR-002 — Presentation fixtures for Sales desk.
 * Zájemce → houses of interest; active house = highest interest (or selected).
 */

export type SalesJourneyStep = {
  readonly module: string;
  readonly title: string;
  readonly detail: string;
  readonly completed?: boolean;
  readonly active?: boolean;
};

/** One house the zájemce is considering. */
export type SalesHouseInterest = {
  readonly id: string;
  readonly houseName: string;
  readonly score: number;
  readonly land: string;
  readonly location?: string;
  readonly tags: readonly string[];
  readonly insight: string;
  readonly journey: readonly SalesJourneyStep[];
};

export type SalesClient = {
  readonly id: string;
  readonly name: string;
  readonly houses: readonly SalesHouseInterest[];
};

export const SALES_CLIENTS: readonly SalesClient[] = [
  {
    id: 'novak',
    name: 'Jan Novák',
    houses: [
      {
        id: 'harmony-124',
        houseName: 'Harmony 124',
        score: 88,
        land: 'Mám pozemek',
        location: 'Opava',
        tags: ['Orientace ke světlu', 'Provozní náklady', 'Dispozice 4+kk'],
        insight:
          'Klient strávil nejvíce času sledováním vazby domu na pozemek v navigátoru domu a prosvětlení obývacího pokoje. Doporučujeme začít rozhovor potvrzením správné orientace domu na jeho pozemku.',
        journey: [
          {
            module: 'Úvodní prohlídka',
            title: 'Vstup na prezentaci',
            detail: 'Spuštěno video exteriéru, stráveno 45s',
            completed: true,
          },
          {
            module: 'Sociální důkaz',
            title: 'Sociální validace',
            detail: 'Zobrazeny dotazy ostatních na zastavěnou plochu',
            completed: true,
          },
          {
            module: 'Navigátor domu',
            title: 'Prostorové poznání',
            detail: '4x otevřena obývací část + terasy na JZ',
            completed: true,
          },
          {
            module: 'Prioritní prohlídka',
            title: 'Nastavení priorit',
            detail: 'Zvýšena váha: Prosvětlení & FVE',
            completed: true,
          },
          {
            module: 'AI poradce',
            title: 'Dotaz na vytápění',
            detail: 'Položen dotaz na roční provozní náklady TČ',
            completed: true,
          },
          {
            module: 'Zachycení kontaktu',
            title: 'Kvalifikovaný požadavek',
            detail: 'Odeslána žádost o posouzení osazení na pozemek',
            active: true,
          },
        ],
      },
      {
        id: 'modern-01',
        houseName: 'MODERN 01',
        score: 71,
        land: 'Mám pozemek',
        location: 'Opava',
        tags: ['Orientace ke světlu', 'Dispozice'],
        insight:
          'Druhý zájem — porovnává MODERN 01 s Harmony 124 podle orientace a nákladů.',
        journey: [
          {
            module: 'Úvodní prohlídka',
            title: 'Vstup na prezentaci',
            detail: 'Prohlédnuta galerie',
            completed: true,
          },
          {
            module: 'Prioritní prohlídka',
            title: 'Nastavení priorit',
            detail: 'Sdílené priority s Harmony 124',
            active: true,
          },
        ],
      },
    ],
  },
  {
    id: 'dvorak',
    name: 'Petr Dvořák',
    houses: [
      {
        id: 'villa-168',
        houseName: 'Villa 168',
        score: 72,
        land: 'Hledám pozemek',
        tags: ['Tepelné čerpadlo', 'Financování', 'Garáž'],
        insight:
          'Klient se opakovaně vrací k finanční kalkulaci a garážovému stání. V rozhovoru se zaměřte na možnosti fázování stavby a měsíční splátku.',
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
            active: true,
          },
        ],
      },
      {
        id: 'harmony-124',
        houseName: 'Harmony 124',
        score: 54,
        land: 'Hledám pozemek',
        tags: ['Financování', 'Pozemek'],
        insight: 'Srovnává Harmony 124 jako cenově dostupnější variantu.',
        journey: [
          {
            module: 'Úvodní prohlídka',
            title: 'Vstup na prezentaci',
            detail: 'Krátká návštěva',
            completed: true,
          },
          {
            module: 'Prioritní prohlídka',
            title: 'Nastavení priorit',
            detail: 'Zatím bez potvrzení',
            active: true,
          },
        ],
      },
    ],
  },
  {
    id: 'kucerova',
    name: 'Marie Kučerová',
    houses: [
      {
        id: 'modern-01',
        houseName: 'MODERN 01',
        score: 78,
        land: 'Mám pozemek',
        location: 'Olomouc',
        tags: ['Kompaktní rozměr', 'Dětské pokoje', 'Úložné prostory'],
        insight:
          'Klientka řeší především velikost dětských pokojů a úložné prostory. Doporučujeme ukázat úpravu dispozice u šatny.',
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
      {
        id: 'family-98',
        houseName: 'Family 98',
        score: 65,
        land: 'Mám pozemek',
        location: 'Olomouc',
        tags: ['Kompaktní rozměr', 'Dětské pokoje'],
        insight:
          'Family 98 je záložní varianta — menší stopu, stejný důraz na dětské pokoje.',
        journey: [
          {
            module: 'Úvodní prohlídka',
            title: 'Vstup na prezentaci',
            detail: 'Příchod z mobilního zařízení',
            completed: true,
          },
          {
            module: 'Navigátor domu',
            title: 'Prohlídka 2.NP',
            detail: 'Opakovaný návrat do Dětského pokoje 1 a 2',
            completed: true,
          },
          {
            module: 'Prioritní prohlídka',
            title: 'Nastavení priorit',
            detail: 'Označena priorita: Úložné prostory',
            completed: true,
          },
        ],
      },
    ],
  },
];

export const HIGH_INTENT_THRESHOLD = 65;

/** Active house = highest interest score (current commercial case). */
export function highestInterestHouse(
  client: SalesClient,
): SalesHouseInterest {
  return client.houses.reduce((best, house) =>
    house.score > best.score ? house : best,
  );
}

export function resolveActiveHouse(
  client: SalesClient,
  houseId: string | null,
): SalesHouseInterest {
  if (houseId !== null) {
    const selected = client.houses.find((house) => house.id === houseId);
    if (selected !== undefined) return selected;
  }
  return highestInterestHouse(client);
}

export function houseListLine(house: SalesHouseInterest): string {
  return `${house.houseName} • ${house.land}`;
}

export function houseDetailLine(house: SalesHouseInterest): string {
  if (house.location !== undefined && house.location.length > 0) {
    return `${house.houseName} • ${house.land} (${house.location})`;
  }
  return `${house.houseName} • ${house.land}`;
}

export function clientPrimaryScore(client: SalesClient): number {
  return highestInterestHouse(client).score;
}
