/**
 * CAP-OP-09 — SMTP adapter (outbound system mail).
 * Office never imports this module; Conversation Runtime receives Messages only.
 */

import type { SmtpEnvConfig } from './mailEnv';

export type SmtpSendMailInput = {
  readonly from: string;
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly messageId?: string;
  readonly inReplyTo?: string;
  readonly references?: string;
  readonly attachments?: readonly {
    readonly filename: string;
    readonly contentBase64: string;
    readonly contentType: string;
  }[];
};

export type SmtpSendMailResult = {
  readonly messageId: string;
  readonly accepted: readonly string[];
};

export type SmtpTransportClient = {
  readonly sendMail: (input: SmtpSendMailInput) => Promise<SmtpSendMailResult>;
};

export type SmtpAdapter = {
  readonly kind: 'smtp';
  readonly config: SmtpEnvConfig;
  readonly sendMail: (input: SmtpSendMailInput) => Promise<SmtpSendMailResult>;
};

export function createSmtpAdapter(
  config: SmtpEnvConfig,
  client: SmtpTransportClient,
): SmtpAdapter {
  return {
    kind: 'smtp',
    config,
    sendMail: (input) => client.sendMail(input),
  };
}

/** Deterministic Message-ID for system mail when the transport does not supply one. */
export function allocateSystemMessageId(domain = 'conis.cz'): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `<system-${stamp}-${rand}@${domain}>`;
}
