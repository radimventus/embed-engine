/**
 * PT-COM-02 — Vite middleware: POST /api/pilot-mail/send → Nodemailer (Node only).
 * Lives outside `src/` so tsconfig.node / app composite projects do not collide.
 */

import { randomUUID } from 'node:crypto';

import nodemailer from 'nodemailer';
import type { Plugin } from 'vite';

type SmtpEnvConfig = {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly password: string;
};

type SmtpAttachment = {
  readonly filename: string;
  readonly contentBase64: string;
  readonly contentType?: string;
};

type SmtpSendMailInput = {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html?: string;
  readonly from?: string;
  readonly messageId?: string;
  readonly inReplyTo?: string;
  readonly references?: readonly string[];
  readonly attachments?: readonly SmtpAttachment[];
};

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function readSmtpEnvConfig(): SmtpEnvConfig | null {
  const host = readEnv('SMTP_HOST');
  const user = readEnv('SMTP_USER');
  const password = readEnv('SMTP_PASSWORD') ?? readEnv('SMTP_PASS');
  if (host === undefined || user === undefined || password === undefined) {
    return null;
  }
  const portRaw = readEnv('SMTP_PORT');
  const port = portRaw !== undefined && Number(portRaw) > 0 ? Number(portRaw) : 587;
  const secureRaw = readEnv('SMTP_SECURE')?.toLowerCase();
  const secure =
    secureRaw === 'true' || secureRaw === '1'
      ? true
      : secureRaw === 'false' || secureRaw === '0'
        ? false
        : false;
  return { host, port, secure, user, password };
}

function readRequestBody(
  req: import('node:http').IncomingMessage,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

async function handlePilotMailSend(
  req: import('node:http').IncomingMessage,
  res: import('node:http').ServerResponse,
): Promise<void> {
  const smtp = readSmtpEnvConfig();
  if (smtp === null) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        ok: false,
        error:
          'SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD).',
      }),
    );
    return;
  }

  try {
    const raw = await readRequestBody(req);
    const input = JSON.parse(raw || '{}') as SmtpSendMailInput;
    if (
      typeof input.to !== 'string' ||
      typeof input.subject !== 'string' ||
      typeof input.text !== 'string'
    ) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Invalid mail payload.' }));
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.password,
      },
    });

    const messageId = input.messageId ?? `<pilot-${randomUUID()}@conis.local>`;
    const from = input.from?.trim() || smtp.user;
    const info = await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      messageId,
      inReplyTo: input.inReplyTo,
      references: input.references ? [...input.references] : undefined,
      attachments: input.attachments?.map((item) => ({
        filename: item.filename,
        content: Buffer.from(item.contentBase64, 'base64'),
        contentType: item.contentType,
      })),
    });

    const resolvedId =
      typeof info.messageId === 'string' && info.messageId.length > 0
        ? info.messageId
        : messageId;
    const accepted = Array.isArray(info.accepted)
      ? info.accepted.map(String)
      : [];

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        ok: true,
        messageId: resolvedId,
        accepted,
      }),
    );
  } catch (error) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        ok: false,
        error:
          error instanceof Error ? error.message : 'SMTP send failed.',
      }),
    );
  }
}

export function pilotMailRelayPlugin(): Plugin {
  const attach = (server: {
    middlewares: {
      use: (
        fn: (
          req: import('node:http').IncomingMessage,
          res: import('node:http').ServerResponse,
          next: () => void,
        ) => void,
      ) => void;
    };
  }) => {
    server.middlewares.use((req, res, next) => {
      const pathOnly = (req.url ?? '').split('?')[0] ?? '';
      if (pathOnly !== '/api/pilot-mail/send' || req.method !== 'POST') {
        next();
        return;
      }
      void handlePilotMailSend(req, res);
    });
  };

  return {
    name: 'pilot-mail-relay',
    configureServer(server) {
      attach(server);
    },
    configurePreviewServer(server) {
      attach(server);
    },
  };
}
