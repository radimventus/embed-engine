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

describe('Audit compact conversion layout', () => {
  const source = form();

  it('keeps a desktop 2 × 2 contact grid with CTA in row 2', () => {
    assert.match(source, /data-testid="audit-contact-grid"/);
    assert.match(source, /grid grid-cols-2 gap-3 mobile:grid-cols-1/);

    const grid = source.slice(
      source.indexOf('data-testid="audit-contact-grid"'),
      source.indexOf('data-testid="audit-gdpr-consent"'),
    );
    const phone = source.indexOf('id="audit-contact-phone"');
    const phoneBlock = source.slice(phone, source.indexOf('data-testid="audit-contact-submit"'));
    const submit = source.slice(
      source.indexOf('data-testid="audit-contact-submit"'),
      source.indexOf('data-testid="audit-gdpr-consent"'),
    );

    assert.equal(grid.includes('col-span-2'), false);
    assert.equal(grid.includes('audit-gdpr-consent'), false);
    assert.equal(phoneBlock.includes('col-span-2'), false);
    assert.equal(submit.includes('col-span-2'), false);
    assert.match(submit, /ODESLAT POPTÁVKU →/);
    assert.match(submit, /ODESÍLÁM…/);
  });

  it('follows heading → grid → GDPR → supporting sentence → remaining trust item', () => {
    const heading = source.indexOf('Kam vám máme poslat výstup?');
    const grid = source.indexOf('data-testid="audit-contact-grid"');
    const gdpr = source.indexOf('data-testid="audit-gdpr-consent"');
    const copy = source.indexOf('data-testid="audit-post-submit-copy"');
    const independent = source.indexOf('Nezávislé posouzení.');

    assert.ok(heading > 0);
    assert.ok(heading < grid);
    assert.ok(grid < gdpr);
    assert.ok(gdpr < copy);
    assert.ok(copy < independent);
    assert.equal(source.includes('Vaše údaje jsou v bezpečí.'), false);
    assert.match(
      source,
      /Po odeslání formuláře se s Vámi spojíme a domluvíme podrobnosti\./,
    );
  });
});
