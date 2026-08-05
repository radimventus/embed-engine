/**
 * PT-CJ-04 — Payment Experience (proforma + SPD QR).
 * Local generation for Commercial Journey — no bank verification · no BA · no SMTP.
 */

import {
  bytesToBase64,
  renderPlainTextPdf,
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
  accountNumber: '2303345128/2010',
  iban: 'CZ1520100000002303345128',
  bankName: 'Fio banka',
});

export type CommercialProforma = {
  readonly number: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly ico: string;
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
  return renderPlainTextPdf({
    title: 'Proforma faktura CONIS',
    lines: [
      `Cislo: ${proforma.number}`,
      `Partner: ${proforma.partnerName}`,
      `Spolecnost: ${proforma.companyName}`,
      `ICO: ${proforma.ico || '—'}`,
      `Program: ${proforma.packageName}`,
      `Castka: ${formatCommercialPilotPriceCzk(proforma.amountCzk)}`,
      `Mena: ${proforma.currency}`,
      `Vystaveno: ${formatCommercialDateCs(proforma.issuedAt)}`,
      `Splatnost: ${formatCommercialDateCs(proforma.dueDate)}`,
      `Ucet: ${proforma.accountNumber}`,
      `IBAN: ${proforma.iban}`,
      `Banka: ${proforma.bankName}`,
      `VS: ${proforma.variableSymbol}`,
      `Zprava: ${proforma.message}`,
    ],
  });
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
  if (digits.length >= 6) return digits.slice(-10);
  return caseId.replace(/[^0-9A-Z]/gi, '').slice(-10).padStart(6, '0');
}

function dueDateFromIssuedAt(issuedAt: string, days = 14): string {
  const date = new Date(issuedAt);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}
