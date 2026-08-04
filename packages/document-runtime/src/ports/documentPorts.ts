/**
 * PT-15 — Document Runtime ports (Conversation · Mail · Timeline).
 */

import type { DocumentArtifact } from '../domain/types';

export type DocumentConversationPort = {
  readonly attachDocument?: (
    artifact: DocumentArtifact,
  ) => void | Promise<void>;
};

export type DocumentMailPort = {
  readonly sendDocument?: (input: {
    readonly artifact: DocumentArtifact;
    readonly toEmail: string;
    readonly subject: string;
    readonly body: string;
  }) => void | Promise<void>;
};

export type DocumentTimelinePort = {
  readonly recordDocumentEvent?: (input: {
    readonly artifact: DocumentArtifact;
    readonly kind: 'document.generated' | 'document.attached' | 'document.sent';
  }) => void | Promise<void>;
};

export type DocumentRuntimePorts = {
  readonly conversation?: DocumentConversationPort;
  readonly mail?: DocumentMailPort;
  readonly timeline?: DocumentTimelinePort;
};
