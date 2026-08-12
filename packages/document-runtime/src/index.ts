/**
 * PT-15 — Document Runtime public API.
 */

export type {
  CommercialDocumentType,
  DocumentArtifact,
  DocumentAttachment,
  DocumentCatalogEntry,
  DocumentContext,
  DocumentLifecycleStatus,
} from './domain/types';
export {
  COMMERCIAL_DOCUMENT_LABELS,
  DEAL_PACKAGE_ROOT,
} from './domain/types';
export {
  COMMERCIAL_DOCUMENT_CATALOG,
  ELECTRONIC_ORDER_PACKAGE,
  documentsForBusinessEvent,
  getCatalogEntry,
} from './domain/registry';
export { DEAL_TEMPLATES, fillTemplate, htmlToPlainLines } from './domain/templates';
export { createQrModules, renderPlainTextPdf, bytesToBase64 } from './generator/pdfPipeline';
export { generateDocumentArtifact, contextToTokens } from './generator/generateDocument';
export {
  createDocumentVersionStore,
  type DocumentVersionStore,
} from './runtime/versionStore';
export {
  createDocumentRuntime,
  buildDocumentContextFromPayload,
  type DocumentRuntime,
  type DocumentIssueResult,
} from './runtime/documentRuntime';
export type {
  DocumentRuntimePorts,
  DocumentConversationPort,
  DocumentMailPort,
  DocumentTimelinePort,
} from './ports/documentPorts';
