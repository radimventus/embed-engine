import { parseGalleryCsv } from '../readiness/parseGalleryCsv';
import type { ReadinessCatalog } from '../readiness/readinessTypes';
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

export async function fetchHouseGalleryIds(input: {
  readonly packageRoot?: string | null;
  readonly fetchImpl?: typeof fetch;
}): Promise<readonly string[]> {
  const packageRoot = input.packageRoot?.trim() ?? '';
  if (packageRoot.length === 0) {
    return [];
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `${packageRootToPublicUrl(packageRoot)}/gallery.csv`,
    );
    if (!response.ok) {
      return [];
    }
    return parseGalleryCsv(await response.text());
  } catch {
    return [];
  }
}

export async function fetchReadinessCatalogsByHouseId(input: {
  readonly houses: readonly {
    readonly houseId: string;
    readonly packageRoot?: string;
  }[];
  readonly fetchImpl?: typeof fetch;
}): Promise<
  Readonly<
    Record<
      string,
      {
        readonly roomNames: Readonly<Record<string, string>>;
        readonly catalog: ReadinessCatalog;
      }
    >
  >
> {
  const uniqueRoots = [...new Set(
    input.houses
      .map((house) => house.packageRoot?.trim() ?? '')
      .filter((root) => root.length > 0),
  )];
  const byRoot = new Map<
    string,
    {
      readonly roomNames: Readonly<Record<string, string>>;
      readonly catalog: ReadinessCatalog;
    }
  >();
  await Promise.all(
    uniqueRoots.map(async (packageRoot) => {
      const [roomNames, imageIds] = await Promise.all([
        fetchHouseRoomNames({
          packageRoot,
          fetchImpl: input.fetchImpl,
        }),
        fetchHouseGalleryIds({
          packageRoot,
          fetchImpl: input.fetchImpl,
        }),
      ]);
      byRoot.set(packageRoot, {
        roomNames,
        catalog: {
          roomIds: Object.keys(roomNames),
          imageIds,
        },
      });
    }),
  );
  const byHouseId: Record<
    string,
    {
      readonly roomNames: Readonly<Record<string, string>>;
      readonly catalog: ReadinessCatalog;
    }
  > = {};
  for (const house of input.houses) {
    const packageRoot = house.packageRoot?.trim() ?? '';
    byHouseId[house.houseId] = byRoot.get(packageRoot) ?? {
      roomNames: {},
      catalog: { roomIds: [], imageIds: [] },
    };
  }
  return byHouseId;
}

export async function fetchRoomNamesByHouseId(input: {
  readonly houses: readonly {
    readonly houseId: string;
    readonly packageRoot?: string;
  }[];
  readonly fetchImpl?: typeof fetch;
}): Promise<Readonly<Record<string, Readonly<Record<string, string>>>>> {
  const catalogs = await fetchReadinessCatalogsByHouseId(input);
  const byHouseId: Record<string, Readonly<Record<string, string>>> = {};
  for (const [houseId, value] of Object.entries(catalogs)) {
    byHouseId[houseId] = value.roomNames;
  }
  return byHouseId;
}
