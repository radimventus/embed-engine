'use strict';

/**
 * Google Sheets destination via Apps Script webhook (CAP-WEB-01).
 * Without GOOGLE_SHEETS_WEBHOOK_URL, queues rows to sheets-queue.jsonl.
 */

const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('./localArchive');

const QUEUE_FILE = path.join(DATA_DIR, 'sheets-queue.jsonl');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function toSheetPayload(record) {
  return {
    leadId: record.leadId || '',
    timestamp: record.timestamp,
    name: record.name,
    company: record.company,
    email: record.email,
    phone: record.phone || '',
    status: record.status,
    score: record.score || '',
    segment: record.segment || record.status || '',
    recommendation: record.recommendation || '',
    answers: record.answers || {},
    answersByTitle: record.answersByTitle || {},
    url: record.url || '',
    referrer: record.referrer || '',
    utmSource: record.utmSource || '',
    utmMedium: record.utmMedium || '',
    utmCampaign: record.utmCampaign || '',
    sessionId: record.sessionId || '',
    userAgent: record.userAgent || '',
    ip: record.ip || '',
  };
}

async function deliverSheet(record) {
  const row = toSheetPayload(record);
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhook) {
    ensureDataDir();
    fs.appendFileSync(QUEUE_FILE, `${JSON.stringify(row)}\n`, 'utf8');
    return { written: false, mode: 'queue', row };
  }

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(row),
    redirect: 'follow',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Google Sheets webhook failed: ${response.status} ${detail}`);
  }

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }
  if (body.ok === false) {
    throw new Error(body.error || 'Google Sheets webhook returned ok:false');
  }

  return { written: true, mode: 'webhook', row };
}

module.exports = {
  deliverSheet,
  toSheetPayload,
};
