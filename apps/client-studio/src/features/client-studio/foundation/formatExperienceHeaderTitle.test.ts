import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatExperienceHeaderTitle } from './formatExperienceHeaderTitle';

describe('formatExperienceHeaderTitle', () => {
  it('formats the pilot house id as Client Studio / Modern 01', () => {
    assert.equal(
      formatExperienceHeaderTitle('house-modern-01'),
      'Client Studio / Modern 01',
    );
  });

  it('falls back to Client Studio when object id is missing', () => {
    assert.equal(formatExperienceHeaderTitle(undefined), 'Client Studio');
    assert.equal(formatExperienceHeaderTitle(''), 'Client Studio');
  });

  it('prefixes partner firm name from Brand Projection (PE-02)', () => {
    assert.equal(
      formatExperienceHeaderTitle('house-modern-01', 'Pilot Domů'),
      'Pilot Domů · Client Studio / Modern 01',
    );
  });
});
