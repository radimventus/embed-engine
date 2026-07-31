/**
 * CAP-BLD-03 — CSV helpers for in-memory HP-002 editing.
 * Uses object-house parseCsv; serializes back to HP CSV text (no new format).
 */

import { parseCsv } from '@embed-engine/object-house/builder-package';

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function serializeCsv(
  headers: readonly string[],
  rows: readonly Readonly<Record<string, string>>[],
): string {
  const headerLine = headers.map(escapeCsvField).join(',');
  const body = rows.map((row) =>
    headers.map((header) => escapeCsvField(row[header] ?? '')).join(','),
  );
  return [headerLine, ...body].join('\n') + (body.length > 0 || headers.length > 0 ? '\n' : '');
}

export function updateCsvCell(
  csvText: string,
  rowIndex: number,
  column: string,
  value: string,
): string {
  const table = parseCsv(csvText);
  if (rowIndex < 0 || rowIndex >= table.rows.length) {
    return csvText;
  }
  if (!table.headers.includes(column)) {
    return csvText;
  }
  const rows = table.rows.map((row, index) =>
    index === rowIndex ? { ...row, [column]: value } : { ...row },
  );
  return serializeCsv(table.headers, rows);
}

export function addCsvRow(
  csvText: string,
  row: Readonly<Record<string, string>>,
): string {
  const table = parseCsv(csvText);
  const headers =
    table.headers.length > 0 ? table.headers : Object.keys(row);
  const nextRow: Record<string, string> = {};
  for (const header of headers) {
    nextRow[header] = row[header] ?? '';
  }
  return serializeCsv(headers, [...table.rows.map((item) => ({ ...item })), nextRow]);
}

export function removeCsvRow(csvText: string, rowIndex: number): string {
  const table = parseCsv(csvText);
  if (rowIndex < 0 || rowIndex >= table.rows.length) {
    return csvText;
  }
  const rows = table.rows
    .filter((_, index) => index !== rowIndex)
    .map((row) => ({ ...row }));
  return serializeCsv(table.headers, rows);
}

export function csvRowCount(csvText: string): number {
  return parseCsv(csvText).rows.length;
}
