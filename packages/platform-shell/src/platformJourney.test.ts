import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildPlatformWorkspaceState } from './buildPlatformWorkspaceState';
import { PLATFORM_STUDIOS } from './platformStudios';
import { PLATFORM_STUDIO_SWITCH_ORDER } from './StudioSwitcher';

describe('platformJourney (VR-FIX-04 / OF-01)', () => {
  it('keeps one studio switch order for header and Landing', () => {
    assert.deepEqual([...PLATFORM_STUDIO_SWITCH_ORDER], [
      'client',
      'manager',
      'sales',
      'builder',
      'office',
    ]);
    assert.deepEqual(
      PLATFORM_STUDIOS.map((studio) => studio.id),
      [...PLATFORM_STUDIO_SWITCH_ORDER],
    );
  });

  it('uses short studio labels matching breadcrumb grammar', () => {
    for (const studio of PLATFORM_STUDIOS) {
      assert.ok(studio.shortLabel.length > 0);
      assert.ok(!studio.shortLabel.includes('Studio'));
    }
  });

  it('builds identical Project Switcher shape for all studios', () => {
    const workspace = buildPlatformWorkspaceState({
      companyLabel: 'AC Modular',
      projectLabel: 'Villa 168',
      projects: [
        {
          id: 'villa-168',
          label: 'Villa 168',
          companyLabel: 'AC Modular',
        },
      ],
    });
    assert.equal(workspace.companyLabel, 'AC Modular');
    assert.equal(workspace.projectLabel, 'Villa 168');
    assert.equal(workspace.projects[0]?.id, 'villa-168');
  });
});
