/**
 * SR-001 / SR-002 / CAP-PLAT-04j — Presentation fixtures for Sales desk.
 * DUP-08 / PT-PDM-03 — labeled mock leads only; not SSOT.
 * CAP-PLAT-04j — interest `id` = Canonical House id (never Project id).
 * Zájemce → houses of interest; active house = highest interest (or selected).
 */

import {
  listCanonicalHouses,
  listCanonicalProjects,
} from '@embed-engine/platform-access';

export type SalesJourneyStep = {
  readonly module: string;
  readonly title: string;
  readonly detail: string;
  readonly completed?: boolean;
  readonly active?: boolean;
};

/** One house the zájemce is considering — `id` = Canonical House id. */
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

/** CAP-PLAT-04j — shell Project list from true CPL Projects (never House rows). */
export type SalesCanonicalProjectOption = {
  readonly id: string;
  readonly label: string;
  readonly companyLabel: string;
};

/** CAP-PLAT-04j — House options from CPL (concrete product / model). */
export type SalesCanonicalHouseOption = {
  readonly id: string;
  readonly label: string;
  readonly projectId: string;
};

export function listSalesCanonicalProjects(): readonly SalesCanonicalProjectOption[] {
  return listCanonicalProjects().map((projection) => ({
    id: projection.project.projectId,
    label: projection.project.name,
    companyLabel: projection.partner.companyName,
  }));
}

/**
 * CAP-VR33b — Session `projectId` is a Project identity only. Do not resolve
 * House ids here: Sales fixture interests remain presentation-only until VR30.
 */
export function resolveSalesActiveProjectId(
  sharedProjectId: string | null | undefined,
  projects: readonly SalesCanonicalProjectOption[] = listSalesCanonicalProjects(),
): string | null {
  const candidate = sharedProjectId?.trim() ?? '';
  if (projects.some((project) => project.id === candidate)) {
    return candidate;
  }
  return projects[0]?.id ?? null;
}

export function listSalesCanonicalHouses(
  projectId?: string | null,
): readonly SalesCanonicalHouseOption[] {
  return listCanonicalHouses(projectId).flatMap((projection) => {
    if (projection.house === null) return [];
    return [{
      id: projection.house.houseId,
      label: projection.house.name,
      projectId: projection.project.projectId,
    }];
  });
}

/**
 * Presentation-only Sales desk fixtures (not production CRM / Partner Repository).
 * Interest house ids must match Canonical House ids from CPL.
 */
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
        id: 'family-98',
        houseName: 'Family 98',
        score: 71,
        land: 'Mám pozemek',
        location: 'Opava',
        tags: ['Orientace ke světlu', 'Dispozice'],
        insight:
          'Druhý zájem — porovnává Family 98 s Harmony 124 podle orientace a nákladů.',
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
        id: 'family-98',
        houseName: 'Family 98',
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
        id: 'harmony-124',
        houseName: 'Harmony 124',
        score: 65,
        land: 'Mám pozemek',
        location: 'Olomouc',
        tags: ['Kompaktní rozměr', 'Dětské pokoje'],
        insight:
          'Harmony 124 je záložní varianta — větší stopa, stejný důraz na dětské pokoje.',
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

/** CAP-PLAT-04j — fixture House ids must resolve as independent CPL Houses. */
export function assertSalesFixtureHousesAreCanonical(): void {
  const houses = listSalesCanonicalHouses();
  const houseIds = new Set(houses.map((house) => house.id));
  const projectIds = new Set(
    listSalesCanonicalProjects().map((project) => project.id),
  );
  for (const client of SALES_CLIENTS) {
    for (const interest of client.houses) {
      if (!houseIds.has(interest.id)) {
        throw new Error(
          `Sales fixture house "${interest.id}" is not a Canonical House id`,
        );
      }
      if (projectIds.has(interest.id)) {
        throw new Error(
          `Sales fixture "${interest.id}" collides with a Canonical Project id`,
        );
      }
    }
  }
}
