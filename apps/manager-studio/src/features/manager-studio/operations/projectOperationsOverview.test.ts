import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import {
  createDecisionSessionRuntime,
  createFixedClock,
} from '@embed-engine/runtime';

import { projectOperationsOverview } from './projectOperationsOverview';

describe('Operations projection (MSCB-01)', () => {
  it('projects overview and timeline from Runtime without inventing events', () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: REFERENCE_HOUSE_PACKAGE,
      clock: createFixedClock(100),
      now: 100,
    });
    const experience = runtime.getExperience();
    assert.ok(experience);

    const before = projectOperationsOverview({
      experience,
      session: runtime.getSession(),
    });

    assert.equal(before.overview.objectId, REFERENCE_HOUSE_PACKAGE.identity.id);
    assert.equal(before.overview.eventCount, 0);
    assert.equal(before.timeline.length, 0);

    const result = runtime.dispatch({
      type: 'SelectRoom',
      roomId: 'room-living',
    });
    assert.equal(result.ok, true);

    const afterExperience = runtime.getExperience();
    assert.ok(afterExperience);

    const after = projectOperationsOverview({
      experience: afterExperience,
      session: runtime.getSession(),
    });

    assert.equal(after.overview.eventCount, 1);
    assert.equal(after.overview.lastEventType, 'RoomSelected');
    assert.equal(after.overview.activeRoomId, 'room-living');
    assert.equal(after.timeline.length, 1);
    assert.equal(after.timeline[0]?.type, 'RoomSelected');
  });
});
