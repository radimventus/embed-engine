import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Audit GDPR consent UX', () => {
  const form = stripComments(read('AuditContact.tsx'));
  const payload = stripComments(read('durableLeadSubmission.ts'));

  it('places the GDPR block above contact fields', () => {
    const gdprIndex = form.indexOf('data-testid="audit-gdpr-consent"');
    const nameIndex = form.indexOf('id="audit-contact-name"');
    const emailIndex = form.indexOf('id="audit-contact-email"');
    const phoneIndex = form.indexOf('id="audit-contact-phone"');
    const submitIndex = form.indexOf('type="submit"');

    assert.ok(gdprIndex > 0);
    assert.ok(gdprIndex < nameIndex);
    assert.ok(nameIndex < emailIndex);
    assert.ok(emailIndex < phoneIndex);
    assert.ok(phoneIndex < submitIndex);
  });

  it('keeps a togglable checkbox with a visible checked mark', () => {
    assert.match(form, /id="audit-gdpr-consent"/);
    assert.match(form, /type="checkbox"/);
    assert.match(form, /checked=\{gdprConsent\}/);
    assert.match(form, /setGdprConsent\(event\.target\.checked\)/);
    assert.match(form, /data-testid="audit-gdpr-consent-mark"/);
    assert.match(form, /backgroundColor: gdprConsent \? AUDIT_ACCENT : 'transparent'/);
  });

  it('disables submit while unchecked and does not POST', () => {
    const handlerStart = form.indexOf('const handleSubmit');
    const handlerEnd = form.indexOf('return (', handlerStart);
    const handler = form.slice(handlerStart, handlerEnd);
    const guard = handler.indexOf('if (!gdprConsent)');
    const post = handler.indexOf('submitDurableLead');

    assert.match(form, /disabled=\{!submitEnabled\}/);
    assert.match(form, /gdprConsent && project\?\.privacyUrl !== undefined/);
    assert.ok(guard >= 0);
    assert.ok(guard < post);
    assert.match(handler.slice(guard, post), /return;/);
    assert.equal(handler.slice(guard, post).includes('submitDurableLead'), false);
  });

  it('shows guidance only while consent is unchecked', () => {
    assert.match(
      form,
      /Pro odeslání poptávky potvrďte souhlas se zpracováním osobních údajů/,
    );
    assert.match(form, /data-testid="audit-gdpr-guidance"/);
    assert.match(form, /\{gdprConsent \? null : \(/);
    assert.match(form, /\{AUDIT_GDPR_GUIDANCE\}/);
  });

  it('keeps the Project privacy link outside the checkbox label', () => {
    const controlStart = form.indexOf('data-testid="audit-gdpr-consent-control"');
    const controlLabelClose = form.indexOf('</label>', controlStart);
    const linkIndex = form.indexOf('data-testid="audit-gdpr-privacy-link"');

    assert.ok(controlStart > 0);
    assert.ok(linkIndex > controlLabelClose);
    assert.equal(
      form.slice(controlStart, controlLabelClose).includes('<a'),
      false,
    );
    assert.match(form, /href=\{project\?\.privacyUrl\}/);
    assert.equal(form.includes('AUDIT_PRIVACY_HREF'), false);
  });

  it('shows pending and success copy only after durable acceptance', () => {
    assert.match(form, /ODESÍLÁM…/);
    assert.match(form, /submitDurableLead/);
    assert.match(form, /setPhase\('success'\)/);

    const tryBlock = form.slice(
      form.indexOf('try {'),
      form.indexOf('} catch'),
    );
    assert.ok(tryBlock.indexOf('submitDurableLead') < tryBlock.indexOf("setPhase('success')"));
    assert.match(payload, /if \(!response\.ok\)/);
  });
});
