/**
 * PT-15 — Office Document Runtime host.
 * Wires Document Runtime into Conversation · Mail Session · Timeline.
 * Automation calls GenerateDocument → this host issues PDFs.
 */

import {
  buildDocumentContextFromPayload,
  createDocumentRuntime,
  type DocumentArtifact,
  type DocumentRuntime,
} from '@embed-engine/document-runtime';
import type { BusinessEvent } from '@embed-engine/business-automation';

import {
  DEFAULT_PILOT_MAILBOX_ID,
  type PilotMailTransportSession,
} from '../mail';
import { mapToConversation } from '../mail/conversationMapping';
import {
  getConversationMailStore,
  ingestStoreMessage,
} from '../mail/conversationMailStore';
import { appendDocumentTimelineEvent } from './officeDocumentTimelineJournal';
import type { PilotTimelineEventKind } from './pilotTimelineModel';

let sharedRuntime: DocumentRuntime | null = null;
let sharedMailSession: PilotMailTransportSession | null = null;

function timelineKindFromDocument(
  kind: 'document.generated' | 'document.attached' | 'document.sent',
): PilotTimelineEventKind {
  return kind;
}

export function bindOfficeDocumentMailSession(
  session: PilotMailTransportSession,
): void {
  sharedMailSession = session;
}

export function getOfficeDocumentRuntime(): DocumentRuntime {
  if (sharedRuntime === null) {
    sharedRuntime = createDocumentRuntime({
      conversation: {
        attachDocument: (artifact) => {
          const store = getConversationMailStore();
          const toEmail =
            artifact.context.contactEmail ?? 'partner@example.com';
          const conversation = mapToConversation(
            {
              mailboxId: DEFAULT_PILOT_MAILBOX_ID,
              fromEmail: 'kontakt@conis.cz',
              toEmail,
              subject: artifact.label,
              threadId: `<doc-thread-${artifact.projectId}@conis.cz>`,
              createdAt: artifact.createdAt,
              caseId: artifact.projectId,
            },
            store,
          );
          ingestStoreMessage(
            {
              id: `doc-msg-${artifact.id}`,
              direction: 'outgoing',
              subject: artifact.label,
              body: `Dokument ${artifact.label} (v${artifact.version}) připojen k projektu.`,
              messageId: `<doc-${artifact.id}@conis.cz>`,
              threadId: `<doc-thread-${artifact.projectId}@conis.cz>`,
              mailboxId: conversation.mailboxId,
              conversationId: conversation.id,
              origin: 'SYSTEM',
              fromEmail: 'kontakt@conis.cz',
              toEmail,
              createdAt: artifact.createdAt,
              attachments: [
                {
                  documentId: artifact.id,
                  fileName: artifact.attachment.fileName,
                  mimeType: 'application/pdf',
                  bytesBase64: artifact.attachment.bytesBase64,
                  byteLength: artifact.attachment.byteLength,
                },
              ],
            },
            store,
          );
        },
      },
      mail: {
        sendDocument: async ({ artifact, toEmail, subject, body }) => {
          if (sharedMailSession === null) return;
          try {
            await sharedMailSession.sendSystemMail({
              mailboxId: DEFAULT_PILOT_MAILBOX_ID,
              toEmail,
              subject,
              body,
              caseId: artifact.projectId,
              origin: 'SYSTEM',
              attachments: [
                {
                  fileName: artifact.attachment.fileName,
                  mimeType: 'application/pdf',
                  bytesBase64: artifact.attachment.bytesBase64,
                  documentId: artifact.id,
                },
              ],
            });
          } catch {
            // Mail failure must not roll back document attach / Conversation.
          }
        },
      },
      timeline: {
        recordDocumentEvent: ({ artifact, kind }) => {
          appendDocumentTimelineEvent({
            id: `tl-doc-${kind}-${artifact.id}`,
            caseId: artifact.projectId,
            kind: timelineKindFromDocument(kind),
            title: artifact.label,
            summary: `${kind} · v${artifact.version}`,
            detail: `${artifact.label}\n${artifact.sourcePath}\n${artifact.attachment.fileName}`,
            occurredAt: new Date().toISOString(),
          });
        },
      },
    });
  }
  return sharedRuntime;
}

export async function generateDocumentsForBusinessEvent(
  event: BusinessEvent,
): Promise<readonly DocumentArtifact[]> {
  const projectId = String(
    event.payload.caseId ??
      event.payload.projectId ??
      event.correlationId ??
      event.payload.orderId ??
      '',
  );
  if (projectId.length === 0) return [];

  const runtime = getOfficeDocumentRuntime();
  const context = buildDocumentContextFromPayload({
    projectId,
    payload: event.payload,
    issuedAt: event.occurredAt,
  });

  const result = await runtime.issueForBusinessEvent({
    eventKind: event.kind,
    context,
    sendToEmail:
      typeof event.payload.contactEmail === 'string'
        ? event.payload.contactEmail
        : null,
  });
  return result.artifacts;
}

export function listProjectDocuments(
  projectId: string,
): readonly DocumentArtifact[] {
  return getOfficeDocumentRuntime().listByProject(projectId);
}

export function getProjectDocument(
  documentId: string,
): DocumentArtifact | null {
  return getOfficeDocumentRuntime().getById(documentId);
}

export function resetOfficeDocumentRuntimeForTests(): void {
  sharedRuntime = null;
}
