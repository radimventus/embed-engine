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

  it('keeps the required follow-up sentence immediately after the contact grid', () => {
    const grid = source.indexOf('data-testid="audit-contact-grid"');
    const copy = source.indexOf('data-testid="audit-post-submit-copy"');
    const trust = source.indexOf('Nezávislé posouzení.');
    const formClose = source.indexOf('</form>');

    assert.ok(grid > 0);
    assert.ok(grid < copy);
    assert.ok(copy < formClose);
    assert.ok(formClose < trust);
    assert.match(
      source,
      /Po odeslání formuláře se s Vámi spojíme a domluvíme podrobnosti\./,
    );
  });

  it('keeps removed pre-form copy out and restores desktop security trust', () => {
    assert.equal(
      source.includes(
        'Po odeslání vám zašleme další postup a informace potřebné pro zpracování posouzení',
      ),
      false,
    );
    assert.equal(source.includes('Vaše data jsou u nás v bezpečí.'), true);
    assert.equal(source.includes('Vaše údaje jsou v bezpečí.'), false);
    assert.match(
      source,
      /Informace použijeme pouze pro účely posouzení\. Nesdílíme je s\s+třetími stranami\./,
    );
    assert.equal(source.includes('LockIcon'), true);
    assert.match(source, /data-testid="audit-data-trust"/);
    assert.match(source, /mobile:hidden/);
    assert.ok(
      source.indexOf('Nezávislé posouzení.') <
        source.indexOf('Vaše data jsou u nás v bezpečí.'),
    );
  });
});
