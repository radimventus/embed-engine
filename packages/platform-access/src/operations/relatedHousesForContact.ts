import type {
  HouseOperationalCase,
  OperationalLeadRecord,
} from './operationalTypes';

export type RelatedHousePill = {
  readonly houseId: string;
  readonly houseName: string;
};

function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? '';
}

/**
 * Houses where this REAL contact already has a Lead.
 * Authority: durable Lead contact.email within Company + Project.
 * Never display-name. Never Project House catalog membership.
 */
export function relatedHousesForContact(input: {
  readonly current: Pick<
    HouseOperationalCase,
    'companyId' | 'projectId' | 'houseId' | 'houseName' | 'origin' | 'contact'
  >;
  readonly projectLeads: readonly OperationalLeadRecord[];
  readonly houses: readonly {
    readonly houseId: string;
    readonly houseName: string;
  }[];
}): readonly RelatedHousePill[] {
  const current: RelatedHousePill = {
    houseId: input.current.houseId,
    houseName: input.current.houseName,
  };
  const email = normalizeEmail(input.current.contact.email);
  if (input.current.origin !== 'LEAD' || email.length === 0) {
    return [current];
  }

  const names = new Map(
    input.houses.map((house) => [house.houseId, house.houseName]),
  );
  names.set(current.houseId, current.houseName);

  const extra = new Map<string, string>();
  for (const lead of input.projectLeads) {
    if (lead.companyId !== input.current.companyId) {
      continue;
    }
    if (lead.projectId !== input.current.projectId) {
      continue;
    }
    if (normalizeEmail(lead.contact.email) !== email) {
      continue;
    }
    if (lead.houseId === current.houseId) {
      continue;
    }
    const houseName = names.get(lead.houseId);
    if (houseName === undefined) {
      continue;
    }
    extra.set(lead.houseId, houseName);
  }

  return [
    current,
    ...[...extra.entries()]
      .map(([houseId, houseName]) => ({ houseId, houseName }))
      .sort((left, right) => left.houseName.localeCompare(right.houseName, 'cs')),
  ];
}
