'use strict';

/**
 * Email destination for lead notifications (CAP-WEB-01).
 * Configure via SMTP_* env vars. Without SMTP, writes to outbound-mail.log.
 */

const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('./localArchive');

const MAIL_LOG = path.join(DATA_DIR, 'outbound-mail.log');

const QUESTION_TITLES_BY_KEY = Object.freeze({
  annual_sales: 'Kolik domů ročně prodáváte?',
  sales_team: 'Máte vlastní obchodní tým?',
  monthly_traffic: 'Kolik lidí měsíčně navštíví váš web?',
  priority: 'Co je pro vás důležitější?',
  ready_for_pilot: 'Jste připraveni začít pilotem?',
});

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function formatAnswers(record) {
  if (record.answersByTitle && typeof record.answersByTitle === 'object') {
    return Object.entries(record.answersByTitle)
      .map(([title, value]) => `${title}: ${value}`)
      .join('\n');
  }

  return Object.entries(record.answers || {})
    .map(([key, value]) => {
      const title = QUESTION_TITLES_BY_KEY[key] || key;
      return `${title}: ${value}`;
    })
    .join('\n');
}

function buildMailBody(record) {
  return [
    'Nová kvalifikace CONIS',
    '',
    `Lead ID: ${record.leadId || '—'}`,
    `Jméno: ${record.name}`,
    `Firma: ${record.company}`,
    `Email: ${record.email}`,
    `Telefon: ${record.phone || '—'}`,
    '',
    `Skóre: ${record.score || '—'}`,
    `Segment: ${record.segment || record.status || '—'}`,
    `Doporučení: ${record.recommendation || '—'}`,
    '',
    'Odpovědi z kvízu:',
    formatAnswers(record) || '—',
    '',
    `Datum: ${record.timestamp}`,
    `URL: ${record.url || '—'}`,
    `Session ID: ${record.sessionId || '—'}`,
    `User-Agent: ${record.userAgent || '—'}`,
  ].join('\n');
}

async function deliverEmail(record) {
  const to = process.env.LEAD_EMAIL_TO || 'kontakt@conis.cz';
  const from = process.env.LEAD_EMAIL_FROM || to;
  const subject = `Nová kvalifikace CONIS — ${record.company || 'lead'}`;
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
