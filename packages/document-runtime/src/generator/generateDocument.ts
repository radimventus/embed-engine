/**
 * PT-15 — Document Generator (template fill → PDF).
 */

import { getCatalogEntry } from '../domain/registry';
import { DEAL_TEMPLATES, fillTemplate, htmlToPlainLines } from '../domain/templates';
import type {
  CommercialDocumentType,
  DocumentArtifact,
  DocumentContext,
} from '../domain/types';
import { COMMERCIAL_DOCUMENT_LABELS } from '../domain/types';
import { bytesToBase64, renderPlainTextPdf } from '../generator/pdfPipeline';
import type { DocumentVersionStore } from '../runtime/versionStore';

export function contextToTokens(
  context: DocumentContext,
): Readonly<Record<string, string>> {
  return {
    projectId: context.projectId,
    partnerName: context.partnerName,
    companyName: context.companyName,
    packageName: context.packageName,
    orderId: context.orderId ?? '',
    proformaNumber: context.proformaNumber ?? '',
    amountCzk:
      context.amountCzk === null ? '' : String(Math.round(context.amountCzk)),
    issuedAt: context.issuedAt.slice(0, 10),
    dueDate: context.dueDate?.slice(0, 10) ?? '',
    variableSymbol: context.variableSymbol ?? '',
    bankAccountNumber: context.bankAccountNumber ?? '',
    bankIban: context.bankIban ?? '',
    heroLabel: context.heroLabel ?? '',
    websiteUrl: context.websiteUrl ?? '',
  };
}

export function generateDocumentArtifact(input: {
  readonly type: CommercialDocumentType;
  readonly context: DocumentContext;
  readonly store: DocumentVersionStore;
  readonly businessEventKind?: string | null;
  readonly createdAt?: string;
}): DocumentArtifact {
  const catalog = getCatalogEntry(input.type);
  const template = DEAL_TEMPLATES[input.type];
  const filled = fillTemplate(template, contextToTokens(input.context));
  const lines = htmlToPlainLines(filled);
  const label = COMMERCIAL_DOCUMENT_LABELS[input.type];
  const pdf = renderPlainTextPdf({
    title: label,
    lines,
    qrPayload: input.type === 'proforma' ? input.context.spdPayload ?? null : null,
  });
  const version = input.store.nextVersion(input.context.projectId, input.type);
  const createdAt = input.createdAt ?? new Date().toISOString();
  const id = `doc-${input.type}-v${version}-${Date.now().toString(36)}`;
  const fileName = `${input.type}-v${version}.pdf`;

  const artifact: DocumentArtifact = {
    id,
    type: input.type,
    label,
    projectId: input.context.projectId,
    version,
    status: 'generated',
    createdAt,
    context: input.context,
    sourcePath: catalog.sourcePath,
    attachment: {
      fileName,
      mimeType: 'application/pdf',
      bytesBase64: bytesToBase64(pdf),
      byteLength: pdf.byteLength,
    },
    businessEventKind: input.businessEventKind ?? null,
  };

  return input.store.save(artifact);
}
