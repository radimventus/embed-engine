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

describe('Audit CTA consent guidance', () => {
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

  it('shows hover/click/keyboard guidance without a permanent extra row', () => {
    assert.match(source, /onMouseEnter/);
    assert.match(source, /onMouseLeave/);
    assert.match(source, /handleCtaClick/);
    assert.match(source, /revealConsentGuidance/);
    assert.match(source, /checkboxRef\.current\?\.focus\(\)/);
    assert.match(source, /onClick=\{handleCtaClick\}/);
    assert.match(source, /onSubmit=\{handleSubmit\}/);
    assert.match(
      source,
      /pointer-events-none absolute top-\[calc\(100%\+6px\)\]/,
    );
    assert.match(source, /Pro odeslání potvrďte souhlas s GDPR\./);
    assert.equal(
      source.includes(
        'Pro odeslání poptávky potvrďte souhlas se zpracováním osobních údajů',
      ),
      false,
    );
  });

  it('hides GDPR guidance once consent is checked', () => {
    assert.match(
      source,
      /!gdprConsent && \(ctaHovered \|\| guidancePinned\)/,
    );
  });
});
