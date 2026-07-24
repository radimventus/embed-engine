import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import {
  createTestBuilderRuntime,
  getTestBuilderHousePackage,
  installBuilderPackageRegistriesForTests,
} from '../../runtime/builderPackageTestInstall';
import {
  createHouseNavigatorViewModel,
  firstRoomOnFloor,
  isNavigatorRoomActive,
  roomsOnFloor,
} from './houseNavigatorModel';

before(() => {
  installBuilderPackageRegistriesForTests();
});

describe('House Navigator Runtime integration', () => {
  it('selecting a room updates Runtime → Projection → Navigator view model', () => {
    const house = getTestBuilderHousePackage();
    const runtime = createTestBuilderRuntime();

    const before = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    assert.equal(before.activeRoomId, null);

    const result = runtime.dispatch({ type: 'SelectRoom', roomId: 'bedroom' }, 2);
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    const view = createHouseNavigatorViewModel(result.experience.context);
    assert.equal(view.activeRoomId, 'bedroom');
    assert.equal(view.activeRoom?.name, 'Ložnice');
    assert.equal(view.selectedFloor, '0');
    assert.equal(isNavigatorRoomActive(view, 'bedroom'), true);
    assert.equal(isNavigatorRoomActive(view, 'kitchen'), false);
    assert.equal(view.rooms.length, house.rooms.length);
    assert.equal(view.rooms.length, 10);
  });

  it('external Runtime changes update Navigator without local state', () => {
    const runtime = createTestBuilderRuntime(10);

    runtime.dispatch({ type: 'SelectRoom', roomId: 'kitchen' }, 11);
    const kitchenView = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    assert.equal(kitchenView.activeRoomId, 'kitchen');
    assert.equal(kitchenView.selectedFloor, '0');

    runtime.dispatch({ type: 'SelectRoom', roomId: 'living-room' }, 12);
    const livingView = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    assert.equal(livingView.activeRoomId, 'living-room');
    assert.equal(livingView.activeRoom?.name, 'Obývací pokoj');
    assert.equal(isNavigatorRoomActive(livingView, 'living-room'), true);
    assert.equal(isNavigatorRoomActive(livingView, 'kitchen'), false);
  });

  it('uses a single Room Registry from projected ExperienceHouse', () => {
    const house = getTestBuilderHousePackage();
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'bathroom' }, 2);
    const view = createHouseNavigatorViewModel(runtime.getExperience()!.context);

    assert.deepEqual(
      view.rooms.map((room) => room.id),
      house.rooms.map((room) => room.id),
    );
    assert.ok(view.rooms.some((room) => room.id === 'exterior'));
    assert.ok(view.rooms.some((room) => room.id === 'wardrobe'));
  });

  it('selectFloor resolves to first projected room on that floor via SelectRoom', () => {
    const runtime = createTestBuilderRuntime();
    const empty = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    const ground = firstRoomOnFloor(empty, '0');
    assert.ok(ground);
    assert.equal(ground?.floor, 0);

    const result = runtime.dispatch({ type: 'SelectRoom', roomId: ground!.id }, 2);
    assert.ok(result.ok);
    if (!result.ok) {
      return;
    }
    const view = createHouseNavigatorViewModel(result.experience.context);
    assert.equal(view.selectedFloor, '0');
    assert.equal(view.activeRoomId, ground!.id);
  });

  it('roomsOnFloor filters the projected room registry by floor', () => {
    const runtime = createTestBuilderRuntime();
    runtime.dispatch({ type: 'SelectRoom', roomId: 'living-room' }, 2);
    const view = createHouseNavigatorViewModel(runtime.getExperience()!.context);
    const ground = roomsOnFloor(view, '0');
    const upper = roomsOnFloor(view, '1');

    assert.ok(ground.every((room) => room.floor === 0));
    assert.equal(upper.length, 0);
    assert.ok(ground.some((room) => room.id === 'living-room'));
    assert.ok(ground.some((room) => room.id === 'bedroom'));
    assert.equal(ground.length, 10);
  });
});
