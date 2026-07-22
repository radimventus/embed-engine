import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { HousePackage } from "@embed-engine/object-house";

import {
  createDecisionSession,
  createDecisionSessionRuntime,
  dispatchCommand,
  replayDecisionSession,
} from "../testing";

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
    rooms: 2,
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

describe("Runtime Event Pipeline", () => {
  it("invalid command → no mutation", () => {
    const session = createDecisionSession({ housePackage: HOUSE, now: 1 });
    const result = dispatchCommand({
      session,
      housePackage: HOUSE,
      command: { type: "SelectRoom", roomId: "missing-room" },
      now: 2,
    });
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.equal(result.session, session);
    assert.equal(result.session.events.length, 0);
    assert.equal(result.session.runtimeState.version, 0);
    assert.ok(result.errors.some((error) => error.code === "HP_UNKNOWN_ROOM"));
  });

  it("valid SelectRoomCommand → one RoomSelected → Runtime → Interpretation → Bedroom Experience", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: HOUSE,
      now: 10,
    });
    const result = runtime.dispatch(
      { type: "SelectRoom", roomId: "room-bedroom" },
      20,
    );
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.event.type, "RoomSelected");
    assert.equal(result.session.events.length, 1);
    assert.equal(result.session.runtimeState.activeRoomId, "room-bedroom");
    assert.equal(result.interpretation.activeRoomName, "Ložnice");
    assert.equal(result.experience.activeRoomId, "room-bedroom");
    assert.equal(result.experience.activeRoom?.name, "Ložnice");
    assert.equal(
      result.experience.interpretationSummary,
      result.interpretation.summary,
    );
    assert.equal(runtime.getExperience()?.activeRoomId, "room-bedroom");
  });

  it("ChangePriorityCommand → PriorityChanged → updated Experience", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: HOUSE,
      now: 1,
    });
    const result = runtime.dispatch(
      { type: "ChangePriority", priorityIds: ["price", "garden"] },
      2,
    );
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.event.type, "PriorityChanged");
    assert.deepEqual(result.session.runtimeState.priorityIds, [
      "price",
      "garden",
    ]);
    assert.deepEqual(result.interpretation.priorityIds, ["price", "garden"]);
    assert.deepEqual(result.experience.priorityIds, ["price", "garden"]);
    assert.match(result.interpretation.summary, /priorities:price,garden/);
  });

  it("mutation → Interpretation → Projection is deterministic", () => {
    const a = createDecisionSessionRuntime({ housePackage: HOUSE, now: 100 });
    const b = createDecisionSessionRuntime({ housePackage: HOUSE, now: 100 });

    const firstA = a.dispatch(
      { type: "SelectRoom", roomId: "room-kitchen" },
      110,
    );
    const firstB = b.dispatch(
      { type: "SelectRoom", roomId: "room-kitchen" },
      110,
    );
    assert.ok(firstA.ok && firstB.ok);
    if (!firstA.ok || !firstB.ok) {
      return;
    }

    const secondA = a.dispatch(
      { type: "ChangePriority", priorityIds: ["space"] },
      120,
    );
    const secondB = b.dispatch(
      { type: "ChangePriority", priorityIds: ["space"] },
      120,
    );
    assert.ok(secondA.ok && secondB.ok);
    if (!secondA.ok || !secondB.ok) {
      return;
    }

    assert.deepEqual(secondA.session.runtimeState, secondB.session.runtimeState);
    assert.deepEqual(secondA.session.events, secondB.session.events);
    assert.deepEqual(secondA.interpretation, secondB.interpretation);
    assert.deepEqual(secondA.experience, secondB.experience);
  });

  it("replay of pipeline events restores identical Runtime and Experience meaning", () => {
    const runtime = createDecisionSessionRuntime({
      housePackage: HOUSE,
      now: 1,
    });
    runtime.dispatch({ type: "SelectRoom", roomId: "room-bedroom" }, 2);
    const final = runtime.dispatch(
      { type: "ChangePriority", priorityIds: ["price"] },
      3,
    );
    assert.ok(final.ok);
    if (!final.ok) {
      return;
    }

    const replayed = replayDecisionSession({
      housePackage: HOUSE,
      events: final.session.events,
      createdAt: final.session.createdAt,
    });
    assert.equal(replayed.ok, true);
    if (!replayed.ok) {
      return;
    }
    assert.deepEqual(replayed.session.runtimeState, final.session.runtimeState);

    const restoredRuntime = createDecisionSessionRuntime({
      housePackage: HOUSE,
      session: replayed.session,
    });
    assert.equal(
      restoredRuntime.getInterpretation()?.summary,
      final.interpretation.summary,
    );
    assert.equal(
      restoredRuntime.getExperience()?.activeRoomId,
      "room-bedroom",
    );
  });

  it("exactly one event per successful command", () => {
    const session = createDecisionSession({ housePackage: HOUSE, now: 1 });
    const before = session.events.length;
    const result = dispatchCommand({
      session,
      housePackage: HOUSE,
      command: { type: "ActivateScenario", scenarioId: "day-zone" },
      now: 5,
    });
    assert.ok(result.ok);
    if (!result.ok) {
      return;
    }
    assert.equal(result.session.events.length, before + 1);
    assert.equal(result.event.type, "ScenarioActivated");
    assert.equal(result.session.runtimeState.scenarioId, "day-zone");
  });
});
