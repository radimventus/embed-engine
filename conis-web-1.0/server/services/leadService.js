'use strict';

/**
 * Lead Service — integration layer between web UI and destinations.
 *
 * Accepts:
 * - contact details
 * - complete qualification answers
 * - resulting segment
 * - timestamp
 * - user-agent
 *
 * Destinations (email, sheets, archive, future CRM) plug in without UI changes.
 */

const { archiveLead } = require('../destinations/localArchive');
const { deliverEmail } = require('../destinations/email');
const { deliverSheet } = require('../destinations/googleSheets');

function resolveTimestamp(value) {
  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }
  return new Date().toISOString();
}

function validateLeadInput(body) {
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
  const timestamp = resolveTimestamp(body.timestamp);

  if (!name || !company || !email) {
    return { ok: false, error: 'Vyplňte jméno, firmu a e-mail.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Zadejte platný e-mail.' };
  }

  return {
    ok: true,
    contact: { name, company, email, phone },
    qualification: { status, answers },
    userAgent,
    timestamp,
  };
}

/**
 * @param {object} body - Contact + qualification payload from the web
 * @param {{ ip?: string }} meta - Request metadata
 */
async function submitLead(body, meta = {}) {
  const checked = validateLeadInput(body);
  if (!checked.ok) {
    return { ok: false, statusCode: 400, error: checked.error };
  }

  const record = {
    timestamp: checked.timestamp,
    name: checked.contact.name,
    company: checked.contact.company,
    email: checked.contact.email,
    phone: checked.contact.phone,
    answers: checked.qualification.answers,
    status: checked.qualification.status,
    userAgent: checked.userAgent,
    ip: meta.ip || '',
  };

  const archive = await archiveLead(record);
  const mail = await deliverEmail(record);
  const sheet = await deliverSheet(record);

  return {
    ok: true,
    statusCode: 200,
    result: {
      ok: true,
      mail,
      sheet,
      archive: { mode: archive.mode },
    },
  };
}

module.exports = {
  submitLead,
  validateLeadInput,
};
