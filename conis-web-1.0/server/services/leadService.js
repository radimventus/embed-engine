'use strict';

/**
 * Lead Service — integration layer between web UI and destinations.
 *
 * Production (conis.cz / GitHub Pages) posts directly to Google Apps Script.
 * Local `npm start` still accepts POST /lead and fans out to destinations.
 */

const { archiveLead } = require('../destinations/localArchive');
const { deliverEmail } = require('../destinations/email');
const { deliverSheet } = require('../destinations/googleSheets');

const QUESTION_TITLES_BY_KEY = Object.freeze({
  annual_sales: 'Kolik domů ročně prodáváte?',
  sales_team: 'Máte vlastní obchodní tým?',
  monthly_traffic: 'Kolik lidí měsíčně navštíví váš web?',
  priority: 'Co je pro vás důležitější?',
  ready_for_pilot: 'Jste připraveni začít pilotem?',
});

const SEGMENT_EVALUATION = Object.freeze({
  A: Object.freeze({
    score: 'Nízká připravenost',
    segment: 'A — zatím není fit pro pilot',
    recommendation:
      'Pilot zatím nedává smysl. Zůstaňte v kontaktu a vraťte se, až budete připraveni začít.',
  }),
  B: Object.freeze({
    score: 'Střední připravenost',
    segment: 'B — ke zvážení / review',
    recommendation:
      'Potenciál je, ale potřebujeme krátké review. Ozveme se s návrhem dalšího kroku.',
  }),
  C: Object.freeze({
    score: 'Vysoká připravenost',
    segment: 'C — pilotní kandidát',
    recommendation:
      'Silný fit pro pilot. Domluvíme krátkou schůzku a nastavíme další postup.',
  }),
});

function resolveTimestamp(value) {
  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }
  return new Date().toISOString();
}

function answersByQuestionTitle(answers) {
  const mapped = {};
  for (const [key, title] of Object.entries(QUESTION_TITLES_BY_KEY)) {
    mapped[title] =
      answers && answers[key] != null ? String(answers[key]) : '';
  }
  return mapped;
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
  const evaluation = SEGMENT_EVALUATION[status.toUpperCase()] || SEGMENT_EVALUATION.B;

  if (!name || !company || !email) {
    return { ok: false, error: 'Vyplňte jméno, firmu a e-mail.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Zadejte platný e-mail.' };
  }

  return {
    ok: true,
    record: {
      leadId: String(body.leadId || '').trim(),
      timestamp,
      name,
      company,
      email,
      phone,
      answers,
      answersByTitle:
        body.answersByTitle && typeof body.answersByTitle === 'object'
          ? body.answersByTitle
          : answersByQuestionTitle(answers),
      status,
      score: String(body.score || evaluation.score),
      segment: String(body.segment || evaluation.segment),
      recommendation: String(body.recommendation || evaluation.recommendation),
      url: String(body.url || '').trim(),
      referrer: String(body.referrer || '').trim(),
      utmSource: String(body.utmSource || '').trim(),
      utmMedium: String(body.utmMedium || '').trim(),
      utmCampaign: String(body.utmCampaign || '').trim(),
      sessionId: String(body.sessionId || '').trim(),
      userAgent,
    },
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
    ...checked.record,
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
  answersByQuestionTitle,
};
