/**
 * PT-15 — Minimal PDF pipeline (text pages).
 * Document Runtime owns PDF generation — Automation must not.
 */

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

/**
 * Builds a simple single-page PDF from title + body lines.
 */
export function renderPlainTextPdf(input: {
  readonly title: string;
  readonly lines: readonly string[];
}): Uint8Array {
  const contentLines = [
    'BT',
    '/F1 16 Tf',
    '50 780 Td',
    `(${escapePdfText(input.title)}) Tj`,
    '/F1 11 Tf',
    '0 -28 Td',
  ];

  for (const line of input.lines.slice(0, 40)) {
    contentLines.push(`(${escapePdfText(line.slice(0, 90))}) Tj`);
    contentLines.push('0 -16 Td');
  }
  contentLines.push('ET');

  const stream = contentLines.join('\n');
  const objects: string[] = [
    '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n',
    '2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n',
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n',
    `4 0 obj<< /Length ${utf8Length(stream)} >>stream\n${stream}\nendstream endobj\n`,
    '5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n',
  ];

  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const object of objects) {
    offsets.push(utf8Length(body));
    body += object;
  }
  const xrefStart = utf8Length(body);
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  xref += `startxref\n${xrefStart}\n%%EOF`;

  return new TextEncoder().encode(body + xref);
}

export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
