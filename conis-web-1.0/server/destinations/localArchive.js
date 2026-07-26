'use strict';

/**
 * Local lead archive destination.
 * Always available — safety net independent of external integrations.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function archiveLead(record) {
  ensureDataDir();
  fs.appendFileSync(LEADS_FILE, `${JSON.stringify(record)}\n`, 'utf8');
  return { written: true, mode: 'local', path: LEADS_FILE };
}

module.exports = {
  archiveLead,
  DATA_DIR,
};
