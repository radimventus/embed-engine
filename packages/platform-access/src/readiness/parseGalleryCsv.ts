/**
 * Canonical image identities from House Package gallery.csv.
 * Identity is `room/file` so reused files in different rooms stay distinct.
 */
export function parseGalleryCsv(csv: string): readonly string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
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
    const room = columns[1]?.trim() ?? '';
    const file = columns[2]?.trim() ?? '';
    if (
      room.length === 0 ||
      file.length === 0 ||
      room === 'room' ||
      file === 'file'
    ) {
      continue;
    }
    const id = `${room}/${file}`;
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
  }
  return ids;
}
