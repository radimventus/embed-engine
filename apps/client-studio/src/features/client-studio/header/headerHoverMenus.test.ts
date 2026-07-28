import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  EXPERIENCE_CONTACT_EMAIL,
  EXPERIENCE_CONTACT_PHONE_DISPLAY,
  EXPERIENCE_CONTACT_PHONE_TEL,
} from './experienceContact';

const here = dirname(fileURLToPath(import.meta.url));

describe('Header hover menus (CAP UX 57)', () => {
  it('shares footer contact values for mailto and tel', () => {
    assert.equal(EXPERIENCE_CONTACT_EMAIL, 'kontakt@astav.cz');
    assert.equal(EXPERIENCE_CONTACT_PHONE_DISPLAY, '+420 987 654 321');
    assert.equal(EXPERIENCE_CONTACT_PHONE_TEL, '+420987654321');

    const footer = readFileSync(
      join(here, '../sections/AuditLeadCapture/ContactCard.tsx'),
      'utf8',
    );
    assert.match(footer, /EXPERIENCE_CONTACT_EMAIL/);
    assert.match(footer, /EXPERIENCE_CONTACT_PHONE_DISPLAY/);
  });

  it('wires Kontakt and Uložit panels with required actions', () => {
    const contact = readFileSync(join(here, 'HeaderContactMenu.tsx'), 'utf8');
    const save = readFileSync(join(here, 'HeaderSaveMenu.tsx'), 'utf8');
    const menu = readFileSync(join(here, 'HeaderHoverMenu.tsx'), 'utf8');

    assert.match(contact, /mailto:\$\{EXPERIENCE_CONTACT_EMAIL\}/);
    assert.match(contact, /tel:\$\{EXPERIENCE_CONTACT_PHONE_TEL\}/);
    assert.match(save, /Uložit tuto stránku jako PDF/);
    assert.match(save, /Doporučujeme nejprve nastavit priority/);
    assert.match(save, /window\.print/);
    assert.match(menu, /onMouseEnter/);
    assert.match(menu, /onMouseLeave/);
    assert.match(menu, /hover:text-embed-brand-navy/);
    assert.match(menu, /hover:decoration-embed-brand-navy/);
    assert.match(menu, /rgba\(0, 25, 48, 0\.7\)/);
  });
});
