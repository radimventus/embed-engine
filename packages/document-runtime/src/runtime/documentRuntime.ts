/**
 * PT-15 — Document Runtime orchestration.
 * Automation calls this — never generates PDF itself.
 */

import { documentsForBusinessEvent } from '../domain/registry';
import type {
  CommercialDocumentType,
  DocumentArtifact,
  DocumentContext,
} from '../domain/types';
import { generateDocumentArtifact } from '../generator/generateDocument';
import type { DocumentRuntimePorts } from '../ports/documentPorts';
import {
  createDocumentVersionStore,
  type DocumentVersionStore,
} from '../runtime/versionStore';

export type DocumentIssueResult = {
  readonly artifacts: readonly DocumentArtifact[];
  readonly eventKind: string;
  readonly projectId: string;
};

export type DocumentRuntime = {
  readonly generate: (input: {
    readonly type: CommercialDocumentType;
    readonly context: DocumentContext;
    readonly businessEventKind?: string | null;
  }) => Promise<DocumentArtifact>;
  readonly issueForBusinessEvent: (input: {
    readonly eventKind: string;
    readonly context: DocumentContext;
    readonly sendToEmail?: string | null;
  }) => Promise<DocumentIssueResult>;
  readonly listByProject: (projectId: string) => readonly DocumentArtifact[];
  readonly getById: (documentId: string) => DocumentArtifact | null;
  readonly markSent: (documentId: string) => Promise<DocumentArtifact | null>;
  readonly getStore: () => DocumentVersionStore;
};

export function createDocumentRuntime(
  ports: DocumentRuntimePorts = {},
  store: DocumentVersionStore = createDocumentVersionStore(),
): DocumentRuntime {
  return {
    getStore: () => store,

    listByProject: (projectId) => store.listByProject(projectId),

    getById: (documentId) => store.getById(documentId),

    generate: async ({ type, context, businessEventKind }) => {
      const artifact = generateDocumentArtifact({
        type,
        context,
        store,
        businessEventKind,
      });
      await ports.timeline?.recordDocumentEvent?.({
        artifact,
        kind: 'document.generated',
      });
      return artifact;
    },

    issueForBusinessEvent: async ({ eventKind, context, sendToEmail }) => {
      const types = documentsForBusinessEvent(eventKind);
      const artifacts: DocumentArtifact[] = [];

      for (const type of types) {
        const artifact = generateDocumentArtifact({
          type,
          context,
          store,
          businessEventKind: eventKind,
        });
        artifacts.push(artifact);
        await ports.timeline?.recordDocumentEvent?.({
          artifact,
          kind: 'document.generated',
        });
        await ports.conversation?.attachDocument?.(artifact);
        store.updateStatus(artifact.id, 'attached');
        await ports.timeline?.recordDocumentEvent?.({
          artifact: { ...artifact, status: 'attached' },
          kind: 'document.attached',
        });
      }

      const primary = artifacts[0];
      const toEmail = sendToEmail ?? context.contactEmail;
      if (primary !== undefined && toEmail !== null && toEmail.length > 0) {
        await ports.mail?.sendDocument?.({
          artifact: primary,
          toEmail,
          subject: `${primary.label} · ${context.partnerName}`,
          body: `V příloze zasíláme dokument ${primary.label} pro projekt ${context.projectId}.`,
        });
        for (const artifact of artifacts) {
          store.updateStatus(artifact.id, 'sent');
          await ports.timeline?.recordDocumentEvent?.({
            artifact: { ...artifact, status: 'sent' },
            kind: 'document.sent',
          });
        }
      }

      return {
        artifacts: store.listByProject(context.projectId).filter((item) =>
          artifacts.some((issued) => issued.id === item.id),
        ),
        eventKind,
        projectId: context.projectId,
      };
    },

    markSent: async (documentId) => {
      const updated = store.updateStatus(documentId, 'sent');
      if (updated === null) return null;
      await ports.timeline?.recordDocumentEvent?.({
        artifact: updated,
        kind: 'document.sent',
      });
      return updated;
    },
  };
}

export function buildDocumentContextFromPayload(input: {
  readonly projectId: string;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
  readonly issuedAt?: string;
}): DocumentContext {
  const amount = input.payload.amountCzk;
  return {
    projectId: input.projectId,
    partnerName: String(input.payload.partnerName ?? ''),
    companyName: String(input.payload.companyName ?? input.payload.partnerName ?? ''),
    packageName: String(input.payload.packageName ?? input.payload.packageId ?? ''),
    orderId:
      input.payload.orderId === null || input.payload.orderId === undefined
        ? null
        : String(input.payload.orderId),
    proformaNumber:
      input.payload.proformaId === null || input.payload.proformaId === undefined
        ? input.payload.proformaNumber === null ||
          input.payload.proformaNumber === undefined
          ? null
          : String(input.payload.proformaNumber)
        : String(input.payload.proformaId),
    amountCzk: typeof amount === 'number' ? amount : null,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    dueDate:
      input.payload.dueDate === null || input.payload.dueDate === undefined
        ? null
        : String(input.payload.dueDate),
    contactEmail:
      input.payload.contactEmail === null ||
      input.payload.contactEmail === undefined
        ? null
        : String(input.payload.contactEmail),
    variableSymbol:
      input.payload.variableSymbol === null || input.payload.variableSymbol === undefined
        ? null
        : String(input.payload.variableSymbol),
    bankAccountNumber:
      input.payload.bankAccountNumber === null || input.payload.bankAccountNumber === undefined
        ? null
        : String(input.payload.bankAccountNumber),
    bankIban:
      input.payload.bankIban === null || input.payload.bankIban === undefined
        ? null
        : String(input.payload.bankIban),
    spdPayload:
      input.payload.spdPayload === null || input.payload.spdPayload === undefined
        ? null
        : String(input.payload.spdPayload),
  };
}
