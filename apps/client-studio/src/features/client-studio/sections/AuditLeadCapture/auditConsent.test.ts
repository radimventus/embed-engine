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
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

describe('Audit GDPR consent UX', () => {
  const form = stripComments(read('AuditContact.tsx'));
  const dialog = stripComments(read('AuditConsentDialog.tsx'));
  const payload = stripComments(read('durableLeadSubmission.ts'));

  it('removes the former consent checkbox row from the form', () => {
    assert.equal(form.includes('audit-gdpr-consent'), false);
    assert.equal(form.includes('type="checkbox"'), false);
    assert.equal(form.includes('Odesláním souhlasíte'), false);
    assert.equal(form.includes('audit-gdpr-privacy-link'), false);
  });

  it('blocks POST and submitDurableLead while consent is unchecked', () => {
    const handlerStart = form.indexOf('const handleSubmit');
    const handlerEnd = form.indexOf('return (', handlerStart);
    const handler = form.slice(handlerStart, handlerEnd);
    const guard = handler.indexOf('if (!gdprConsent)');
    const post = handler.indexOf('submitDurableLead');

    assert.ok(guard >= 0);
    assert.ok(guard < post);
    assert.match(handler.slice(guard, post), /return;/);
    assert.equal(
      handler.slice(guard, post).includes('submitDurableLead'),
      false,
    );
    assert.match(form, /handleCtaClick/);
    assert.match(form, /event\.preventDefault\(\)/);
  });

  it('opens a modal instead of rendering overlapping CTA guidance', () => {
    assert.match(form, /setConsentDialogOpen\(true\)/);
    assert.match(form, /<AuditConsentDialog/);
    assert.equal(form.includes('audit-gdpr-guidance'), false);
    assert.equal(form.includes('onMouseEnter'), false);
    assert.match(dialog, /role="dialog"/);
    assert.match(dialog, /aria-modal="true"/);
    assert.match(dialog, /Souhlasíte s podmínkami\?/);
    assert.match(dialog, /data-testid="audit-consent-backdrop"/);
  });

  it('moves the original Project privacy destination into the modal link', () => {
    assert.match(form, /privacyHref=\{project\?\.privacyUrl\}/);
    assert.match(dialog, /data-testid="audit-consent-privacy-link"/);
    assert.match(dialog, /href=\{privacyHref\}/);
    assert.match(dialog, /zpracováním osobních údajů/);
    assert.match(dialog, /target="_blank"/);
    assert.equal(form.includes('AUDIT_PRIVACY_HREF'), false);
  });

  it('shows pending and success copy only after durable acceptance', () => {
    assert.match(form, /ODESÍLÁM…/);
    assert.match(form, /submitDurableLead/);
    assert.match(form, /submitClientOutput/);
    assert.match(form, /setClientOutput\(output\)/);
    assert.match(form, /downloadClientOutput/);
    assert.match(form, /clientOutputVariantForLandOption\(landOption\)/);
    assert.match(form, /setPhase\('success'\)/);

    const tryBlock = form.slice(form.indexOf('try {'), form.indexOf('} catch'));
    assert.ok(
      tryBlock.indexOf('submitDurableLead') <
        tryBlock.indexOf("setPhase('success')"),
    );
    assert.ok(tryBlock.indexOf('submitDurableLead') < tryBlock.indexOf('submitClientOutput'));
    assert.ok(tryBlock.indexOf('submitClientOutput') < tryBlock.indexOf("setPhase('success')"));
    assert.match(payload, /if \(!response\.ok\)/);
  });
});
