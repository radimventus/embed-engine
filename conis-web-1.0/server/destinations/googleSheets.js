'use strict';

/**
 * Google Sheets destination via Apps Script webhook.
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

function toSheetRow(record) {
  return {
    timestamp: record.timestamp,
    name: record.name,
    company: record.company,
    email: record.email,
    phone: record.phone || '',
    answers: JSON.stringify(record.answers || {}),
    status: record.status,
    userAgent: record.userAgent || '',
    ip: record.ip || '',
  };
}

async function deliverSheet(record) {
  const row = toSheetRow(record);
  const webhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhook) {
    ensureDataDir();
    fs.appendFileSync(QUEUE_FILE, `${JSON.stringify(row)}\n`, 'utf8');
    return { written: false, mode: 'queue', row };
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

  return { written: true, mode: 'webhook', row };
}

module.exports = {
  deliverSheet,
  toSheetRow,
};
