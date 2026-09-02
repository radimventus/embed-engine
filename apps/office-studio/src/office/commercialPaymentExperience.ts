/**
 * PT-CJ-04 — Payment Experience (proforma + SPD QR).
 * Local generation for Commercial Journey — no bank verification · no BA · no SMTP.
 */

import {
  bytesToBase64,
  createQrModules,
} from '@embed-engine/document-runtime';

import {
  COMMERCIAL_PILOT_PROGRAM_PACKAGES,
  formatCommercialPilotPriceCzk,
  resolveCommercialPilotProgramId,
  type CommercialPilotProgramId,
  type CommercialPilotProgramPackage,
} from './commercialPilotProgramCatalog';
import { getCommercialJourneySelectedProgramId } from './commercialJourneySelection';
import {
  buildCommercialOrderPartnerDetails,
  type CommercialOrderPartnerDetails,
} from './commercialOrderPartnerDetails';
import type { PilotWorkspaceCase } from './pilotWorkspaceModel';

export const COMMERCIAL_PAYMENT_ACCOUNT = Object.freeze({
  accountNumber: '3452548011/3030',
  iban: 'CZ3530300000003452548011',
  bankName: 'Air Bank',
});

export type CommercialProforma = {
  readonly number: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly ico: string;
  readonly dic: string;
  readonly address: string;
  readonly packageName: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly issuedAt: string;
  readonly dueDate: string;
  readonly variableSymbol: string;
  readonly accountNumber: string;
  readonly iban: string;
  readonly bankName: string;
  readonly message: string;
  readonly qrPayload: string;
};

export function resolveCommercialJourneyProgram(
  activeCase: PilotWorkspaceCase,
  selectedId: CommercialPilotProgramId | null = getCommercialJourneySelectedProgramId(),
): CommercialPilotProgramPackage | null {
  const id =
    selectedId ?? resolveCommercialPilotProgramId(activeCase.packageName);
  if (id === null) return null;
  return COMMERCIAL_PILOT_PROGRAM_PACKAGES.find((pkg) => pkg.id === id) ?? null;
}

export function buildCommercialProforma(input: {
  readonly activeCase: PilotWorkspaceCase;
  readonly program: CommercialPilotProgramPackage;
  readonly details: CommercialOrderPartnerDetails;
  readonly issuedAt?: string;
}): CommercialProforma {
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const variableSymbol = variableSymbolFromCaseId(input.activeCase.id);
  const number = `PF-2026-${variableSymbol.slice(-8).padStart(8, '0')}`;
  const message =
    `CONIS ${input.program.name} · ${input.activeCase.partnerName}`.slice(
      0,
      60,
    );
  const qrPayload = buildSpdQrPayload({
    iban: COMMERCIAL_PAYMENT_ACCOUNT.iban,
    amountCzk: input.program.priceCzk,
    variableSymbol,
    message,
  });

  return {
    number,
    partnerName: input.activeCase.partnerName,
    companyName: input.details.companyName,
    ico: input.details.ico,
    dic: input.details.dic,
    address: input.details.address,
    packageName: input.program.name,
    amountCzk: input.program.priceCzk,
    currency: 'CZK',
    issuedAt,
    dueDate: dueDateFromIssuedAt(issuedAt),
    variableSymbol,
    accountNumber: COMMERCIAL_PAYMENT_ACCOUNT.accountNumber,
    iban: COMMERCIAL_PAYMENT_ACCOUNT.iban,
    bankName: COMMERCIAL_PAYMENT_ACCOUNT.bankName,
    message,
    qrPayload,
  };
}

export function buildCommercialProformaForCase(
  activeCase: PilotWorkspaceCase,
): CommercialProforma | null {
  const program = resolveCommercialJourneyProgram(activeCase);
  if (program === null) return null;
  const details = buildCommercialOrderPartnerDetails(activeCase);
  return buildCommercialProforma({ activeCase, program, details });
}

export function buildSpdQrPayload(input: {
  readonly iban: string;
  readonly amountCzk: number;
  readonly variableSymbol: string;
  readonly message: string;
}): string {
  const amount = input.amountCzk.toFixed(2);
  const msg = input.message.replace(/[\r\n*]/g, ' ').slice(0, 60);
  return [
    'SPD*1.0',
    `ACC:${input.iban}`,
    `AM:${amount}`,
    'CC:CZK',
    `X-VS:${input.variableSymbol}`,
    `MSG:${msg}`,
  ].join('*');
}

export function renderCommercialProformaPdf(
  proforma: CommercialProforma,
): Uint8Array {
  const ascii = (value: string): string =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, '');

  const escapePdfText = (value: string): string =>
    ascii(value)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const commands: string[] = [];

  const text = (
    x: number,
    y: number,
    size: number,
    value: string,
  ): void => {
    commands.push(
      `BT /F1 ${size} Tf ${x} ${y} Td ` +
        `(${escapePdfText(value)}) Tj ET`,
    );
  };

  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width = 1,
  ): void => {
    commands.push(
      `${width} w ${x1} ${y1} m ${x2} ${y2} l S`,
    );
  };

  const fillRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    gray: number,
  ): void => {
    commands.push(
      `${gray} g ${x} ${y} ${width} ${height} re f 0 g`,
    );
  };

  // HEADER
  text(42, 790, 22, 'CONIS');
  text(350, 792, 15, 'VYZVA K UHRADE');
  text(
    350,
    772,
    9,
    `Proforma faktura ${proforma.number}`,
  );

  line(42, 752, 553, 752, 1.2);

  // DODAVATEL
  text(42, 722, 8, 'DODAVATEL');
  text(42, 700, 12, 'Radim Ventus');
  text(
    42,
    681,
    9,
    'Postovni 115, 747 19 Bohuslavice',
  );
  text(42, 664, 9, 'ICO: 62288474');
  text(42, 647, 9, 'Neplatce DPH');

  // PARTNER — canonical company scope
  text(310, 722, 8, 'PARTNER');
  text(
    310,
    700,
    12,
    proforma.companyName,
  );

  text(
    310,
    681,
    9,
    proforma.address.length > 0
      ? proforma.address
      : 'Adresa neuvedena',
  );

  text(
    310,
    664,
    9,
    `ICO: ${proforma.ico || 'neuvedeno'}`,
  );

  if (proforma.dic.length > 0) {
    text(
      310,
      647,
      9,
      `DIC: ${proforma.dic}`,
    );
  }

  line(42, 600, 553, 600);

  // PREDMET
  text(42, 568, 8, 'PREDMET PLNENI');

  text(
    42,
    542,
    12,
    `Pilotni nasazeni platformy CONIS - ${proforma.packageName}`,
  );

  // CENA
  fillRect(42, 472, 511, 54, 0.94);

  text(
    58,
    494,
    9,
    'CELKEM K UHRADE',
  );

  text(
    350,
    488,
    18,
    formatCommercialPilotPriceCzk(
      proforma.amountCzk,
    ),
  );

  // PLATBA
  text(42, 432, 8, 'PLATEBNI UDAJE');

  text(
    42,
    407,
    10,
    `Banka: ${proforma.bankName}`,
  );

  text(
    42,
    388,
    10,
    `Ucet: ${proforma.accountNumber}`,
  );

  text(
    42,
    369,
    10,
    `IBAN: ${proforma.iban}`,
  );

  text(
    42,
    350,
    10,
    `Variabilni symbol: ${proforma.variableSymbol}`,
  );

  text(
    42,
    331,
    10,
    `Splatnost: ${formatCommercialDateCs(
      proforma.dueDate,
    )}`,
  );

  // REAL SPD QR
  const qr =
    createQrModules(proforma.qrPayload);

  const qrSize = 150;
  const moduleSize =
    qrSize / qr.size;

  const qrX = 385;
  const qrY = 300;

  commands.push('0 g');

  for (
    let rowIndex = 0;
    rowIndex < qr.size;
    rowIndex += 1
  ) {
    for (
      let columnIndex = 0;
      columnIndex < qr.size;
      columnIndex += 1
    ) {
      const dataIndex =
        rowIndex * qr.size +
        columnIndex;

      if (!Boolean(qr.data[dataIndex])) {
        continue;
      }

      const x =
        qrX +
        columnIndex * moduleSize;

      const y =
        qrY +
        (qr.size - rowIndex - 1) *
          moduleSize;

      commands.push(
        `${x.toFixed(3)} ${y.toFixed(3)} ` +
          `${moduleSize.toFixed(3)} ` +
          `${moduleSize.toFixed(3)} re f`,
      );
    }
  }

  line(42, 265, 553, 265);

  text(
    42,
    236,
    9,
    'QR kod obsahuje stejny ucet, castku a variabilni symbol.',
  );

  text(
    42,
    218,
    9,
    'Tato vyzva k uhrade neni danovym dokladem.',
  );

  // FOOTER
  text(42, 72, 8, 'CONIS');

  text(
    395,
    72,
    8,
    proforma.number,
  );

  const stream =
    commands.join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R ' +
      '/MediaBox [0 0 595 842] ' +
      '/Resources << /Font << /F1 5 0 R >> >> ' +
      '/Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(
      stream,
      'utf8',
    )} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 ' +
      '/BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';

  const offsets: number[] = [0];

  objects.forEach((object,index) => {
    offsets.push(
      Buffer.byteLength(pdf,'utf8'),
    );

    pdf +=
      `${index + 1} 0 obj\n` +
      `${object}\nendobj\n`;
  });

  const xrefOffset =
    Buffer.byteLength(pdf,'utf8');

  pdf +=
    `xref\n0 ${objects.length + 1}\n`;

  pdf +=
    '0000000000 65535 f\n';

  offsets.slice(1).forEach((offset) => {
    pdf +=
      `${String(offset).padStart(
        10,
        '0',
      )} 00000 n\n`;
  });

  pdf +=
    'trailer\n' +
    `<< /Size ${objects.length + 1} ` +
    '/Root 1 0 R >>\n' +
    `startxref\n${xrefOffset}\n%%EOF`;

  return new Uint8Array(
    Buffer.from(pdf,'utf8'),
  );
}

export function commercialProformaPdfObjectUrl(
  proforma: CommercialProforma,
): string {
  const bytes = renderCommercialProformaPdf(proforma);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export function commercialProformaPdfDataUrl(
  proforma: CommercialProforma,
): string {
  const bytes = renderCommercialProformaPdf(proforma);
  return `data:application/pdf;base64,${bytesToBase64(bytes)}`;
}

export function downloadCommercialProformaPdf(
  proforma: CommercialProforma,
): void {
  const href = commercialProformaPdfObjectUrl(proforma);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `${proforma.number}.pdf`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function openCommercialProformaPdf(proforma: CommercialProforma): void {
  const href = commercialProformaPdfObjectUrl(proforma);
  window.open(href, '_blank', 'noopener,noreferrer');
}

export function formatCommercialDateCs(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

function variableSymbolFromCaseId(caseId: string): string {
  const digits = caseId.replace(/\D/g, '');

  if (digits.length >= 6) {
    return digits.slice(-10);
  }

  let hash = 0x811c9dc5;

  for (let index = 0; index < caseId.length; index += 1) {
    hash ^= caseId.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return String(hash);
}

function dueDateFromIssuedAt(issuedAt: string, days = 14): string {
  const date = new Date(issuedAt);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
