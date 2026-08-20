import { packageRootToPublicUrl } from '../project/packagePublicUrl';
import { parseRoomsCsv } from '../operations/lookupRoomSalesLabel';

export async function fetchHouseRoomNames(input: {
  readonly packageRoot?: string | null;
  readonly fetchImpl?: typeof fetch;
}): Promise<Readonly<Record<string, string>>> {
  const packageRoot = input.packageRoot?.trim() ?? '';
  if (packageRoot.length === 0) {
    return {};
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `${packageRootToPublicUrl(packageRoot)}/rooms.csv`,
    );
    if (!response.ok) {
      return {};
    }
    return parseRoomsCsv(await response.text());
  } catch {
    return {};
  }
}

export async function fetchRoomNamesByHouseId(input: {
  readonly houses: readonly {
    readonly houseId: string;
    readonly packageRoot?: string;
  }[];
  readonly fetchImpl?: typeof fetch;
}): Promise<Readonly<Record<string, Readonly<Record<string, string>>>>> {
  const uniqueRoots = new Map<string, string>();
  for (const house of input.houses) {
    const packageRoot = house.packageRoot?.trim() ?? '';
    if (packageRoot.length === 0 || uniqueRoots.has(packageRoot)) {
      continue;
    }
    uniqueRoots.set(packageRoot, house.houseId);
  }

  const namesByRoot = new Map<string, Readonly<Record<string, string>>>();
  await Promise.all(
    [...uniqueRoots.keys()].map(async (packageRoot) => {
      namesByRoot.set(
        packageRoot,
        await fetchHouseRoomNames({
          packageRoot,
          fetchImpl: input.fetchImpl,
        }),
      );
    }),
  );

  const byHouseId: Record<string, Readonly<Record<string, string>>> = {};
  for (const house of input.houses) {
    const packageRoot = house.packageRoot?.trim() ?? '';
    byHouseId[house.houseId] = namesByRoot.get(packageRoot) ?? {};
  }
  return byHouseId;
}
