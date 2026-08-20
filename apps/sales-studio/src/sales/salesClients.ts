/**
 * SR-001 / SR-002 / CAP-PLAT-04j — Sales desk projection.
 * CAP-PLAT-04j — interest `id` = Canonical House id (never Project id).
 * Desk cases come from the shared House operational path — not Studio fixtures.
 */

import {
  HIGH_INTENT_THRESHOLD,
  listCanonicalHouses,
  listCanonicalProjects,
  type HouseOperationalCase,
} from '@embed-engine/platform-access';

export { HIGH_INTENT_THRESHOLD };

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
  readonly score: number | null;
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
 * House ids here: operational cases are selected separately by House scope.
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

export function toSalesClients(
  cases: readonly HouseOperationalCase[],
): readonly SalesClient[] {
  return cases.map((item) => ({
    id: item.caseId,
    name: item.contact.name,
    houses: [
      {
        id: item.houseId,
        houseName: item.houseName,
        score: item.profilZajemce.score,
        land: item.profilZajemce.land,
        location: item.profilZajemce.location ?? undefined,
        tags: item.profilZajemce.tags,
        insight: item.profilZajemce.insight,
        journey: item.profilZajemce.journey,
      },
    ],
  }));
}

export function hasMeasuredDecisionCertainty(
  score: number | null,
): score is number {
  return typeof score === 'number' && Number.isFinite(score);
}

export function formatDecisionCertainty(score: number | null): string {
  return hasMeasuredDecisionCertainty(score) ? `${score} %` : 'Zatím neměřeno';
}

function comparableScore(score: number | null): number {
  return hasMeasuredDecisionCertainty(score) ? score : Number.NEGATIVE_INFINITY;
}

/** Active house = highest interest score (current commercial case). */
export function highestInterestHouse(
  client: SalesClient,
): SalesHouseInterest {
  return client.houses.reduce((best, house) =>
    comparableScore(house.score) > comparableScore(best.score) ? house : best,
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

export function clientPrimaryScore(client: SalesClient): number | null {
  return highestInterestHouse(client).score;
}
