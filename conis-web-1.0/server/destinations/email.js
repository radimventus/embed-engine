'use strict';

/**
 * Email destination for lead notifications.
 * Configure via SMTP_* env vars. Without SMTP, writes to outbound-mail.log.
 */

const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('./localArchive');

const MAIL_LOG = path.join(DATA_DIR, 'outbound-mail.log');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function formatAnswers(answers) {
  return Object.entries(answers || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function buildMailBody(record) {
  return [
    'Nová kvalifikace CONIS',
    '',
    `Jméno: ${record.name}`,
    `Firma: ${record.company}`,
    `Email: ${record.email}`,
    `Telefon: ${record.phone || '—'}`,
    '',
    'Výsledky kvalifikace:',
    formatAnswers(record.answers) || '—',
    '',
    `Výsledek: ${record.status}`,
    `Datum: ${record.timestamp}`,
    `IP: ${record.ip || '—'}`,
    `User-Agent: ${record.userAgent || '—'}`,
  ].join('\n');
}

async function deliverEmail(record) {
  const to = process.env.LEAD_EMAIL_TO || 'kontakt@conis.cz';
  const from = process.env.LEAD_EMAIL_FROM || to;
  const subject = 'Nová kvalifikace CONIS';
  const text = buildMailBody(record);

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    ensureDataDir();
    fs.appendFileSync(
      MAIL_LOG,
      `\n--- ${new Date().toISOString()} ---\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`,
      'utf8',
    );
    return { sent: false, mode: 'log', to };
  }

  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    ensureDataDir();
    fs.appendFileSync(
      MAIL_LOG,
      `\n--- ${new Date().toISOString()} (nodemailer missing) ---\n${text}\n`,
      'utf8',
    );
    return { sent: false, mode: 'log-missing-nodemailer', to };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user, pass },
  });

  await transporter.sendMail({ from, to, subject, text });
  return { sent: true, mode: 'smtp', to };
}

module.exports = {
  deliverEmail,
  buildMailBody,
};
