import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

describe('Header hover menus (CAP UX 57 / TASK 49G)', () => {
  it('renders Kontakt from the active Company public projection', () => {
    const contact = readFileSync(join(here, 'HeaderContactMenu.tsx'), 'utf8');
    const footer = readFileSync(
      join(here, '../sections/AuditLeadCapture/ContactCard.tsx'),
      'utf8',
    );

    assert.match(contact, /useDecisionSessionRuntime/);
    assert.match(contact, /company\?\.phone/);
    assert.match(contact, /company\?\.email/);
    assert.match(contact, /mailto:\$\{email\}/);
    assert.equal(contact.includes('EXPERIENCE_CONTACT_EMAIL'), false);
    assert.equal(contact.includes('kontakt@astav.cz'), false);
    assert.equal(contact.includes('+420 987 654 321'), false);
    assert.equal(footer.includes('EXPERIENCE_CONTACT_EMAIL'), false);
    assert.equal(footer.includes('Asrav s.r.o.'), false);
  });

  it('wires Kontakt and the unified personal-output delivery action', () => {
    const contact = readFileSync(join(here, 'HeaderContactMenu.tsx'), 'utf8');
    const save = readFileSync(join(here, 'HeaderSaveMenu.tsx'), 'utf8');
    const menu = readFileSync(join(here, 'HeaderHoverMenu.tsx'), 'utf8');

    assert.match(contact, /mailto:/);
    assert.match(contact, /tel:/);
    assert.match(save, /Stáhnout osobní PDF/);
    assert.match(save, /submitClientOutput/);
    assert.match(save, /trigger:'HEADER'/);
    assert.match(save, /downloadClientOutput/);
    assert.match(save, /PDF vychází z aktuálního domu/);
    assert.equal(save.includes('window.print'), false);
    assert.match(menu, /onMouseEnter/);
    assert.match(menu, /onMouseLeave/);
    assert.match(menu, /hover:text-embed-brand-navy/);
    assert.match(menu, /hover:decoration-embed-brand-navy/);
    assert.match(menu, /rgba\(0, 25, 48, 0\.7\)/);
  });
});
