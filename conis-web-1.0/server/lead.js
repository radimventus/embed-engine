'use strict';

/**
 * Lead pipeline — separate from qualification.
 * Always persists locally. Email + Google Sheets when configured.
 */

const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./env');

loadEnv();

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');
const MAIL_LOG = path.join(DATA_DIR, 'outbound-mail.log');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function validateLead(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Neplatný požadavek.' };
  }

  const name = String(body.name || '').trim();
  const company = String(body.company || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const status = String(body.status || '').trim() || 'B';
  const answers =
    body.answers && typeof body.answers === 'object' ? body.answers : {};
  const userAgent = String(body.userAgent || '').trim();

  if (!name || !company || !email) {
    return { ok: false, error: 'Vyplňte jméno, firmu a e-mail.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Zadejte platný e-mail.' };
  }

  return {
    ok: true,
    lead: {
      timestamp: new Date().toISOString(),
      name,
      company,
      email,
      phone,
      answers,
      status,
      userAgent,
    },
  };
}

function formatAnswers(answers) {
  return Object.entries(answers || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

function buildMailBody(lead, ip) {
  return [
    'Nová kvalifikace CONIS',
    '',
    `Jméno: ${lead.name}`,
    `Firma: ${lead.company}`,
    `Email: ${lead.email}`,
    `Telefon: ${lead.phone || '—'}`,
    '',
    'Výsledky kvalifikace:',
    formatAnswers(lead.answers) || '—',
    '',
    `Výsledek: ${lead.status}`,
    `Datum: ${lead.timestamp}`,
    `IP: ${ip || '—'}`,
    `User-Agent: ${lead.userAgent || '—'}`,
  ].join('\n');
}

function appendLocalLead(lead, ip) {
  ensureDataDir();
  const row = {
    ...lead,
    ip: ip || '',
  };
  fs.appendFileSync(LEADS_FILE, `${JSON.stringify(row)}\n`, 'utf8');
  return row;
}

async function sendLeadEmail(lead, ip) {
  const to = process.env.LEAD_EMAIL_TO || 'kontakt@conis.cz';
  const from = process.env.LEAD_EMAIL_FROM || to;
  const subject = 'Nová kvalifikace CONIS';
  const text = buildMailBody(lead, ip);

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

async function appendGoogleSheet(lead, ip) {
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const row = {
    timestamp: lead.timestamp,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone || '',
    answers: JSON.stringify(lead.answers || {}),
    status: lead.status,
    userAgent: lead.userAgent || '',
    ip: ip || '',
  };

  if (!webhook) {
    ensureDataDir();
    const sheetLog = path.join(DATA_DIR, 'sheets-queue.jsonl');
    fs.appendFileSync(sheetLog, `${JSON.stringify(row)}\n`, 'utf8');
    return { written: false, mode: 'queue' };
  }

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Google Sheets webhook failed: ${response.status} ${detail}`);
  }

  return { written: true, mode: 'webhook' };
}

async function processLead(body, ip) {
  const checked = validateLead(body);
  if (!checked.ok) {
    return { ok: false, statusCode: 400, error: checked.error };
  }

  const lead = checked.lead;
  appendLocalLead(lead, ip);

  const mail = await sendLeadEmail(lead, ip);
  const sheet = await appendGoogleSheet(lead, ip);

  return {
    ok: true,
    statusCode: 200,
    result: {
      ok: true,
      mail,
      sheet,
    },
  };
}

module.exports = {
  processLead,
  validateLead,
  buildMailBody,
};
