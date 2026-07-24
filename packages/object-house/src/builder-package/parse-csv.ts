/**
 * Minimal CSV parser for HP-002 partner files.
 * Supports UTF-8, comma separator, optional double-quoted fields.
 */

export type CsvTable = {
  readonly headers: readonly string[];
  readonly rows: readonly Readonly<Record<string, string>>[];
};

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      fields.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }

  fields.push(current.trim());
  return fields;
}

export function parseCsv(text: string): CsvTable {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = splitCsvLine(lines[0]!).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]!);
    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c += 1) {
      row[headers[c]!] = (values[c] ?? "").trim();
    }
    rows.push(row);
  }

  return { headers, rows };
}

export function requireHeaders(
  table: CsvTable,
  required: readonly string[],
  path: string,
): string | undefined {
  for (const name of required) {
    if (!table.headers.includes(name)) {
      return `Missing required CSV header "${name}" in ${path}`;
    }
  }
  return undefined;
}

export function parsePositiveInt(raw: string, field: string, path: string): number | string {
  if (!/^-?\d+$/.test(raw)) {
    return `Invalid integer for "${field}" in ${path}: ${raw}`;
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    return `Integer out of range for "${field}" in ${path}: ${raw}`;
  }
  return value;
}

/** Non-negative area in m² — accepts `.` or Czech `,` decimals. */
export function parseNonNegativeNumber(
  raw: string,
  field: string,
  path: string,
): number | string {
  const normalized = raw.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return `Invalid number for "${field}" in ${path}: ${raw}`;
  }
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    return `Number out of range for "${field}" in ${path}: ${raw}`;
  }
  return value;
}
