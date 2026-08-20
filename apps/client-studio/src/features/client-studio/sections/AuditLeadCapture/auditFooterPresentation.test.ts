import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

function readFromHere(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

describe('Audit Project footer presentation', () => {
  const card = readFromHere('ContactCard.tsx');
  const mapping = readFromHere('projectFooter.ts');
  const shell = readFromHere('AuditLeadCapture.tsx');

  it('restores a gold-separator Project footer driven by active runtime Company', () => {
    assert.match(card, /data-testid="audit-project-footer"/);
    assert.match(card, /data-testid="audit-project-footer-identity"/);
    assert.match(card, /data-testid="audit-project-footer-contact"/);
    assert.match(card, /borderColor: AUDIT_ACCENT/);
    assert.match(card, /useDecisionSessionRuntime/);
    assert.match(card, /company\?\.companyName/);
    assert.match(card, /company\?\.legalName/);
    assert.match(card, /company\?\.phone/);
    assert.match(card, /company\?\.email/);
    assert.match(card, /projectFooterFromRuntime/);
    assert.match(mapping, /legalName/);
    assert.match(mapping, /city/);
    assert.match(mapping, /country/);
    assert.match(mapping, /ico/);
    assert.match(mapping, /phone/);
    assert.match(mapping, /email/);
  });

  it('does not hardcode Asrav fixtures or the compact centered contact footer', () => {
    assert.equal(card.includes('Asrav s.r.o.'), false);
    assert.equal(card.includes('Budějická 765, Lierec'), false);
    assert.equal(card.includes('IČ: 123 456 88'), false);
    assert.equal(card.includes('kontakt@astav.cz'), false);
    assert.equal(card.includes('+420 987 654 321'), false);
    assert.equal(card.includes('EXPERIENCE_CONTACT_EMAIL'), false);
    assert.equal(card.includes('EXPERIENCE_CONTACT_PHONE_DISPLAY'), false);
    assert.equal(card.includes('Potřebujete se nejdřív zeptat?'), false);
    assert.equal(mapping.includes('Asrav'), false);
    assert.equal(mapping.includes('Domy s energií'), false);
    assert.equal(mapping.includes('AC Modular'), false);
  });

  it('keeps a single Project footer and the separate CONIS product footer', () => {
    assert.equal(shell.includes('<ContactCard'), true);
    assert.equal(shell.split('<ContactCard').length - 1, 1);
    assert.match(shell, /audit-final-footer/);
    assert.match(shell, /CONIS • Conversion Intelligence System/);
    assert.match(shell, /Radim Věntus/);
  });
});
