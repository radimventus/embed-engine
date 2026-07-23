import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import {
  createFixedClock,
  createDecisionSessionRuntime,
} from '@embed-engine/runtime';

import {
  createHouseNavigatorViewModel,
  firstRoomOnFloor,
  isNavigatorRoomActive,
  roomsOnFloor,
} from './houseNavigatorModel';

describe('House Navigator Runtime integration', () => {
  it('selecting a room updates Runtime → Projection → Navigator view model', () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });

    const before = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    assert.equal(before.activeRoomId, null);

    const result = runtime.dispatch(
      { type: 'SelectRoom', roomId: 'room-bedroom' },
      2,
    );
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    const view = createHouseNavigatorViewModel(result.experience.context);
    assert.equal(view.activeRoomId, 'room-bedroom');
    assert.equal(view.activeRoom?.name, 'Ložnice');
    assert.equal(view.selectedFloor, '0');
    assert.equal(isNavigatorRoomActive(view, 'room-bedroom'), true);
    assert.equal(isNavigatorRoomActive(view, 'room-kitchen'), false);
    assert.equal(view.rooms.length, REFERENCE_HOUSE_PACKAGE.rooms.length);
  });

  it('external Runtime changes update Navigator without local state', () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(10),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 10,
    });

    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-kitchen' }, 11);
    const kitchenView = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    assert.equal(kitchenView.activeRoomId, 'room-kitchen');
    assert.equal(kitchenView.selectedFloor, '0');

    // Simulate another module (Gallery / AI / Story) changing the room.
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 12);
    const livingView = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    assert.equal(livingView.activeRoomId, 'room-living');
    assert.equal(livingView.activeRoom?.name, 'Obývací pokoj');
    assert.equal(isNavigatorRoomActive(livingView, 'room-living'), true);
    assert.equal(isNavigatorRoomActive(livingView, 'room-kitchen'), false);
  });

  it('uses a single Room Registry from projected ExperienceHouse', () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-bath' }, 2);
    const view = createHouseNavigatorViewModel(runtime.getExperience()!.context);

    assert.deepEqual(
      view.rooms.map((room) => room.id),
      REFERENCE_HOUSE_PACKAGE.rooms.map((room) => room.id),
    );
  });

  it('selectFloor resolves to first projected room on that floor via SelectRoom', () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const empty = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    const ground = firstRoomOnFloor(empty, '0');
    assert.ok(ground);
    assert.equal(ground?.floor, 0);

    const result = runtime.dispatch(
      { type: 'SelectRoom', roomId: ground!.id },
      2,
    );
    assert.ok(result.ok);
    if (!result.ok) {
      return;
    }
    const view = createHouseNavigatorViewModel(result.experience.context);
    assert.equal(view.selectedFloor, '0');
    assert.equal(view.activeRoomId, ground!.id);
  });

  it('roomsOnFloor filters the projected room registry by floor', () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    runtime.dispatch({ type: 'SelectRoom', roomId: 'room-living' }, 2);
    const view = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    const ground = roomsOnFloor(view, '0');
    const upper = roomsOnFloor(view, '1');

    assert.ok(ground.every((room) => room.floor === 0));
    assert.equal(upper.length, 0);
    assert.ok(ground.some((room) => room.id === 'room-living'));
    assert.ok(ground.some((room) => room.id === 'room-bedroom'));
  });
});
