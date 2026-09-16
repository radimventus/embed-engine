import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

function form(): string {
  return readFileSync(join(here, 'AuditContact.tsx'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Audit CTA consent modal', () => {
  const source = form();

  it('keeps the gold CTA interactive while consent is unchecked', () => {
    const submit = source.slice(
      source.indexOf('data-testid="audit-contact-submit"'),
      source.indexOf('data-testid="audit-gdpr-consent"'),
    );

    assert.match(submit, /disabled=\{phase === 'loading'\}/);
    assert.equal(submit.includes('aria-disabled'), false);
    assert.equal(submit.includes('!gdprConsent || project'), false);
    assert.equal(submit.includes('aria-disabled={!gdprConsent'), false);
    assert.equal(submit.includes('0.42'), false);
    assert.match(submit, /opacity: phase === 'loading' \? 0\.6 : 1/);
    assert.match(submit, /backgroundColor: AUDIT_ACCENT/);
  });

  it('opens the consent modal from click and form submit', () => {
    assert.match(source, /handleCtaClick/);
    assert.match(source, /onClick=\{handleCtaClick\}/);
    assert.match(source, /onSubmit=\{handleSubmit\}/);
    assert.match(source, /setConsentDialogOpen\(true\)/);
    assert.match(source, /open=\{consentDialogOpen\}/);
    assert.equal(source.includes('audit-gdpr-guidance'), false);
  });

  it('confirms once and resumes the existing submit flow', () => {
    assert.match(source, /if \(consentContinuationRef\.current\) return/);
    assert.match(source, /setGdprConsent\(true\)/);
    assert.match(source, /formRef\.current\?\.requestSubmit\(\)/);
    assert.match(source, /onCancel=\{closeConsentDialog\}/);
    assert.match(source, /onConfirm=\{confirmConsentAndContinue\}/);
  });
});
