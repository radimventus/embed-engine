/**
 * Sales TOUR labels come from House Package rooms.csv — never a parallel
 * room-name catalogue. Missing metadata falls back to a humanized id, never
 * the raw technical token.
 */

export function parseRoomsCsv(csv: string): Readonly<Record<string, string>> {
  const names: Record<string, string> = {};
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }
    const columns = trimmed.split(',');
    if (columns.length < 3) {
      continue;
    }
    const roomId = columns[1]?.trim() ?? '';
    const name = columns[2]?.trim() ?? '';
    if (
      roomId.length === 0 ||
      name.length === 0 ||
      roomId === 'room' ||
      name === 'name'
    ) {
      continue;
    }
    if (names[roomId] === undefined) {
      names[roomId] = name;
    }
  }
  return names;
}

export function lookupRoomSalesLabel(
  roomId: string,
  roomNames?: Readonly<Record<string, string>>,
): string {
  const canonical = roomNames?.[roomId]?.trim() ?? '';
  if (canonical.length > 0) {
    return canonical;
  }
  return roomId
    .split(/[-_]/g)
    .filter((part) => part.length > 0)
    .map(
      (part) =>
        part.charAt(0).toLocaleUpperCase('cs') + part.slice(1).toLocaleLowerCase('cs'),
    )
    .join(' ');
}

export function formatVisitedRoomsTitle(count: number): string {
  if (count === 1) {
    return 'Prošel 1 část domu:';
  }
  if (count >= 2 && count <= 4) {
    return `Prošel ${count} části domu:`;
  }
  return `Prošel ${count} částí domu:`;
}
