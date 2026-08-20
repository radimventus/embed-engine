import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { HousePackage } from "@embed-engine/object-house";

import {
  cloneDecisionSession,
  createDecisionSession,
  createDecisionSessionRuntime,
  createFixedClock,
  projectDecisionSession,
  replayDecisionSession,
  restoreDecisionSessionFromJson,
  selectRoom,
  serializeDecisionSessionToJson,
} from "./testing";

const HOUSE: HousePackage = {
  identity: {
    id: "house-modern-01",
    title: "Modern 01",
    reference: "ASTAV-M01",
  },
  overview: {
    price: 6_900_000,
    usableArea: 142,
    landArea: 620,
    rooms: 5,
    hasGarden: true,
  },
  media: [],
  rooms: [
    { id: "room-bedroom", name: "Ložnice", area: 18, floor: 1 },
    { id: "room-kitchen", name: "Kuchyně", area: 14, floor: 0 },
  ],
  location: { city: "Praha", district: "Západ" },
  metadata: { energyClass: "B", construction: "Zděná" },
};

describe("DecisionSession execution model", () => {
  it("selectRoom appends RoomSelected and projects active room Experience", () => {
    let session = createDecisionSession({ housePackage: HOUSE, now: 1_000 });

    const bedroom = selectRoom({
      session,
      housePackage: HOUSE,
      roomId: "room-bedroom",
      now: 1_100,
    });
    assert.equal(bedroom.ok, true);
    if (!bedroom.ok) {
      return;
    }
    session = bedroom.session;
    assert.equal(session.runtimeState.activeRoomId, "room-bedroom");
    assert.equal(session.events.length, 1);
    assert.equal(session.events[0]?.type, "RoomSelected");
    assert.equal(bedroom.experience.context.activeRoom.id, "room-bedroom");
    assert.equal(bedroom.experience.context.activeRoom.room?.name, "Ložnice");
    assert.equal(bedroom.experience.house.id, "house-modern-01");

    const kitchen = selectRoom({
      session,
      housePackage: HOUSE,
      roomId: "room-kitchen",
      now: 1_200,
    });
    assert.equal(kitchen.ok, true);
    if (!kitchen.ok) {
      return;
    }
    assert.equal(kitchen.session.runtimeState.activeRoomId, "room-kitchen");
    assert.equal(kitchen.session.events.length, 2);
    assert.equal(kitchen.experience.context.activeRoom.id, "room-kitchen");
    assert.deepEqual(
      kitchen.session.events.map((event) => event.type),
      ["RoomSelected", "RoomSelected"],
    );
  });

  it("rejects unknown RoomId (Room Registry ownership)", () => {
    const session = createDecisionSession({ housePackage: HOUSE, now: 1 });
    const result = selectRoom({
      session,
      housePackage: HOUSE,
      roomId: "room-does-not-exist",
      now: 2,
    });
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.equal(result.code, "HP_UNKNOWN_ROOM");
  });

  it("replay produces identical RuntimeState and Experience", () => {
    let session = createDecisionSession({ housePackage: HOUSE, now: 10 });
    const first = selectRoom({
      session,
      housePackage: HOUSE,
      roomId: "room-bedroom",
      now: 20,
    });
    assert.ok(first.ok);
    if (!first.ok) {
      return;
    }
    session = first.session;
    const second = selectRoom({
      session,
      housePackage: HOUSE,
      roomId: "room-kitchen",
      now: 30,
    });
    assert.ok(second.ok);
    if (!second.ok) {
      return;
    }

    const replayed = replayDecisionSession({
      housePackage: HOUSE,
      events: second.session.events,
      createdAt: second.session.createdAt,
    });
    assert.equal(replayed.ok, true);
    if (!replayed.ok) {
      return;
    }

    assert.deepEqual(replayed.session.runtimeState, second.session.runtimeState);
    assert.deepEqual(replayed.session.events, second.session.events);
    assert.equal(replayed.session.createdAt, second.session.createdAt);
    assert.equal(replayed.session.updatedAt, second.session.updatedAt);

    const originalExperience = projectDecisionSession(second.session, HOUSE);
    const replayedExperience = projectDecisionSession(replayed.session, HOUSE);
    assert.equal(originalExperience.ok, true);
    assert.equal(replayedExperience.ok, true);
    if (!originalExperience.ok || !replayedExperience.ok) {
      return;
    }
    assert.deepEqual(originalExperience.experience, replayedExperience.experience);
  });

  it("preserves event ordering across serialize → restore → replay", () => {
    let session = createDecisionSession({ housePackage: HOUSE, now: 100 });
    for (const [roomId, at] of [
      ["room-bedroom", 110],
      ["room-kitchen", 120],
      ["room-bedroom", 130],
    ] as const) {
      const next = selectRoom({
        session,
        housePackage: HOUSE,
        roomId,
        now: at,
      });
      assert.ok(next.ok);
      if (!next.ok) {
        return;
      }
      session = next.session;
    }

    const json = serializeDecisionSessionToJson(session);
    const restored = restoreDecisionSessionFromJson(json);
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }
    assert.deepEqual(restored.session.events, session.events);

    const replayed = replayDecisionSession({
      housePackage: HOUSE,
      events: restored.session.events,
      createdAt: restored.session.createdAt,
    });
    assert.ok(replayed.ok);
    if (!replayed.ok) {
      return;
    }
    assert.deepEqual(replayed.session.runtimeState, session.runtimeState);
    assert.deepEqual(
      replayed.session.events.map((event) =>
        event.type === "RoomSelected" ? event.roomId : event.type,
      ),
      ["room-bedroom", "room-kitchen", "room-bedroom"],
    );
  });

  it("serialize → restore preserves priority intensities", () => {
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(10),
      housePackage: HOUSE,
      now: 10,
    });
    const changed = runtime.dispatch(
      {
        type: "ChangePriority",
        priorityIds: ["price", "garden"],
        intensities: [
          { priorityId: "price", importance: 0.8 },
          { priorityId: "garden", importance: 0.2 },
        ],
      },
      20,
    );
    assert.equal(changed.ok, true);
    if (!changed.ok) {
      return;
    }
    const json = serializeDecisionSessionToJson(changed.session);
    const restored = restoreDecisionSessionFromJson(json);
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }
    assert.deepEqual(restored.session.runtimeState.priorityIds, [
      "price",
      "garden",
    ]);
    assert.deepEqual(restored.session.runtimeState.priorityIntensities, {
      price: 0.8,
      garden: 0.2,
    });
    const priorityEvent = restored.session.events.find(
      (event) => event.type === "PriorityChanged",
    );
    assert.equal(priorityEvent?.type, "PriorityChanged");
    if (priorityEvent?.type !== "PriorityChanged") {
      return;
    }
    assert.deepEqual(priorityEvent.intensities, [
      { priorityId: "price", importance: 0.8 },
      { priorityId: "garden", importance: 0.2 },
    ]);
  });

  it("serialize → restore accepts older sessions with priority ids only", () => {
    const json = JSON.stringify({
      format: "decision-session",
      schemaVersion: "1.0",
      objectId: HOUSE.identity.id,
      runtimeState: {
        activeRoomId: null,
        priorityIds: ["price"],
        variantId: null,
        scenarioId: null,
        version: 1,
      },
      events: [
        { type: "PriorityChanged", priorityIds: ["price"], at: 2 },
      ],
      createdAt: 1,
      updatedAt: 2,
    });
    const restored = restoreDecisionSessionFromJson(json);
    assert.equal(restored.ok, true);
    if (!restored.ok) {
      return;
    }
    assert.deepEqual(restored.session.runtimeState.priorityIds, ["price"]);
    assert.equal(restored.session.runtimeState.priorityIntensities, null);
  });

  it("clone is independent of the original session", () => {
    const session = createDecisionSession({ housePackage: HOUSE, now: 1 });
    const selected = selectRoom({
      session,
      housePackage: HOUSE,
      roomId: "room-bedroom",
      now: 2,
    });
    assert.ok(selected.ok);
    if (!selected.ok) {
      return;
    }
    const cloned = cloneDecisionSession(selected.session);
    const further = selectRoom({
      session: cloned,
      housePackage: HOUSE,
      roomId: "room-kitchen",
      now: 3,
    });
    assert.ok(further.ok);
    if (!further.ok) {
      return;
    }
    assert.equal(selected.session.events.length, 1);
    assert.equal(further.session.events.length, 2);
  });

  it("projection never exposes HousePackage identity/overview nesting", () => {
    const session = createDecisionSession({ housePackage: HOUSE, now: 1 });
    const selected = selectRoom({
      session,
      housePackage: HOUSE,
      roomId: "room-kitchen",
      now: 2,
    });
    assert.ok(selected.ok);
    if (!selected.ok) {
      return;
    }
    assert.equal(
      Object.prototype.hasOwnProperty.call(selected.experience.house, "identity"),
      false,
    );
    assert.equal(selected.experience.house.id, HOUSE.identity.id);
  });
});
