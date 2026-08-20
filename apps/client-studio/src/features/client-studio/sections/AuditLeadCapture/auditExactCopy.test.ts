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

describe('Audit exact FORM copy', () => {
  const source = form();

  it('keeps the required follow-up sentence immediately after GDPR', () => {
    const gdpr = source.indexOf('data-testid="audit-gdpr-consent"');
    const copy = source.indexOf('data-testid="audit-post-submit-copy"');
    const trust = source.indexOf('Nezávislé posouzení.');
    const formClose = source.indexOf('</form>');

    assert.ok(gdpr > 0);
    assert.ok(gdpr < copy);
    assert.ok(copy < formClose);
    assert.ok(formClose < trust);
    assert.match(
      source,
      /Po odeslání formuláře se s Vámi spojíme a domluvíme podrobnosti\./,
    );
  });

  it('does not keep removed pre-form or security-trust copy', () => {
    assert.equal(
      source.includes(
        'Po odeslání vám zašleme další postup a informace potřebné pro zpracování posouzení',
      ),
      false,
    );
    assert.equal(source.includes('Vaše data jsou u nás v bezpečí.'), false);
    assert.equal(source.includes('Vaše údaje jsou v bezpečí.'), false);
    assert.equal(
      source.includes(
        'Informace použijeme pouze pro účely posouzení. Nesdílíme je s třetími stranami.',
      ),
      false,
    );
    assert.equal(source.includes('LockIcon'), false);
  });
});
