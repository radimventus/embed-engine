import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { WORKFLOW_BY_LAND } from './audit-panel';

const here = dirname(fileURLToPath(import.meta.url));

describe('Audit process workflow', () => {
  it('binds the owned-plot icons and copy to the correct nodes', () => {
    assert.deepEqual(
      WORKFLOW_BY_LAND.owned.map(({ motif, title, lines }) => ({
        motif,
        title,
        description: lines.join(' '),
      })),
      [
        {
          motif: 'pin',
          title: 'Mám pozemek',
          description: 'Získáme informace o vašem pozemku.',
        },
        {
          motif: 'house',
          title: 'Osazení domu',
          description: 'Navrhneme optimální umístění domu na pozemku.',
        },
        {
          motif: 'document',
          title: 'Stanoviska',
          description: 'Prověříme podmínky a regulace.',
        },
        {
          motif: 'check',
          title: 'Doporučení',
          description: 'Navrhneme dům, který sedí na váš pozemek.',
        },
      ],
    );
  });

  it('binds the seeking-plot icons and copy to the correct nodes', () => {
    assert.deepEqual(
      WORKFLOW_BY_LAND.seeking.map(({ motif, title, lines }) => ({
        motif,
        title,
        description: lines.join(' '),
      })),
      [
        {
          motif: 'search',
          title: 'Hledám pozemek',
          description: 'Najdeme vhodnou parcelu pro váš záměr.',
        },
        {
          motif: 'pin',
          title: 'Lokalita',
          description: 'Prověříme lokalitu a její možnosti.',
        },
        {
          motif: 'document',
          title: 'Stanoviska',
          description: 'Ověříme podmínky a omezení.',
        },
        {
          motif: 'check',
          title: 'Doporučení',
          description: 'Navrhneme vhodnější dům nebo doporučíme další postup.',
        },
      ],
    );
  });

  it('renders the compact reference geometry with one reusable node per station', () => {
    const source = readFileSync(join(here, 'AssessmentWorkflow.tsx'), 'utf8');
    assert.match(source, /stations\.map\(\(station, index\) =>/);
    assert.match(source, /data-testid="audit-workflow-step"/);
    assert.match(source, /className="flex h-14 w-14/);
    assert.match(source, /className="h-7 w-7"/);
    assert.match(source, /grid grid-cols-4/);
    assert.match(source, /left-\[12\.5%\] right-\[37\.5%\]/);
    assert.match(source, /left-\[62\.5%\] right-\[12\.5%\]/);
    assert.match(source, /border-t border-dashed/);
    assert.equal(source.includes('h-[88px] w-[88px]'), false);
  });

  it('keeps the selected-mode legend separate on the left', () => {
    const source = readFileSync(join(here, 'AssessmentWorkflow.tsx'), 'utf8');
    const desktop = source.indexOf('data-testid="audit-workflow-desktop"');
    const mode = source.indexOf('data-testid="audit-workflow-mode"');
    const divider = source.indexOf('data-testid="audit-workflow-mode-divider"');
    const process = source.indexOf('role="list"');

    assert.ok(desktop > 0);
    assert.ok(desktop < mode);
    assert.ok(mode < divider);
    assert.ok(divider < process);
    assert.match(source, /grid-cols-\[9\.5rem_1px_minmax\(0,1fr\)\]/);
    assert.match(source, /className="h-\[72px\] w-px"/);
    assert.match(source, /\{mode\.label\}/);
  });
});
