import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatChapterKindCs,
  formatDecisionKeyCs,
  formatMoveStatusCs,
  formatPriorityIdCs,
} from './decisionTerminalLabels';

describe('Decision Terminal labels (CSCB-05A)', () => {
  it('maps known Runtime keys to Czech customer copy', () => {
    assert.equal(
      formatDecisionKeyCs('inspect-value-drivers'),
      'Prohlédněte si, co tvoří hodnotu domu',
    );
    assert.equal(
      formatDecisionKeyCs('value-led-exploration'),
      'Orientace podle hodnoty a efektivity',
    );
    assert.equal(
      formatDecisionKeyCs('day-zone-openness'),
      'Otevřenost denní zóny',
    );
    assert.equal(formatPriorityIdCs('energy'), 'Energie');
    assert.equal(formatPriorityIdCs('layout'), 'Dispozice');
    assert.equal(formatChapterKindCs('primary-explanation'), 'Hlavní vysvětlení');
    assert.equal(formatMoveStatusCs('pending'), 'Čeká');
    assert.equal(formatMoveStatusCs('active'), 'Aktivní');
  });

  it('maps prefixed move keys without inventing new order', () => {
    assert.equal(
      formatDecisionKeyCs('explain:primary-living-volume'),
      'Vysvětlení: Obývací prostor je jádrem denního života',
    );
    assert.equal(
      formatDecisionKeyCs('acknowledge:value-led-exploration'),
      'Potvrzení: Orientace podle hodnoty a efektivity',
    );
    assert.equal(formatDecisionKeyCs('media:hero'), 'Hlavní pohled');
  });

  it('falls back safely for unknown keys without inventing semantics', () => {
    assert.equal(formatDecisionKeyCs('unknown-future-key'), 'unknown future key');
  });
});
