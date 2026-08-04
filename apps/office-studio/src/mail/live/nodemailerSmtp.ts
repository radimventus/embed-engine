/**
 * CAP-OP-09 — Live Nodemailer SMTP client (Node only).
 * Not imported by Office UI / PilotWorkspaceProvider.
 */

import nodemailer from 'nodemailer';

import type { SmtpEnvConfig } from '../mailEnv';
import type { SmtpSendMailInput, SmtpTransportClient } from '../smtpAdapter';
import { allocateSystemMessageId } from '../smtpAdapter';

export function createNodemailerSmtpClient(
  config: SmtpEnvConfig,
): SmtpTransportClient {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  return {
    async sendMail(input: SmtpSendMailInput) {
      const messageId = input.messageId ?? allocateSystemMessageId();
      const info = await transporter.sendMail({
        from: input.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        messageId,
        inReplyTo: input.inReplyTo,
        references: input.references,
      });
      const resolvedId =
        typeof info.messageId === 'string' && info.messageId.length > 0
          ? info.messageId
          : messageId;
      const accepted = Array.isArray(info.accepted)
        ? info.accepted.map(String)
        : [];
      return { messageId: resolvedId, accepted };
    },
  };
}
