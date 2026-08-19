import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeSocialProofSignal } from "./socialProofSignal";

const houseId = "house-1";

describe("Social Proof signal contract", () => {
  it("accepts only positive whole person counts", () => {
    assert.deepEqual(
      normalizeSocialProofSignal({
        kind: "SAVE",
        houseId,
        count: 1,
        window: "ROLLING_7_DAYS",
        evidence: "HOUSE_SAVED",
      }),
      { kind: "SAVE", houseId, count: 1, window: "ROLLING_7_DAYS" },
    );

    for (const count of [0, -1, 1.5, Number.NaN]) {
      assert.equal(
        normalizeSocialProofSignal({
          kind: "SAVE",
          houseId,
          count,
          window: "ROLLING_7_DAYS",
          evidence: "HOUSE_SAVED",
        }),
        null,
      );
    }
  });

  it("requires an exact supported aggregation window for historical signals", () => {
    assert.equal(
      normalizeSocialProofSignal({
        kind: "RETURN",
        houseId,
        count: 1,
        window: null,
        evidence: "RETURNING_VISITOR",
      }),
      null,
    );
    assert.equal(
      normalizeSocialProofSignal({
        kind: "RETURN",
        houseId,
        count: 1,
        window: "LIVE",
        evidence: "RETURNING_VISITOR",
      }),
      null,
    );
  });

  it("never upcasts a historical visitor aggregate to LIVE", () => {
    assert.equal(
      normalizeSocialProofSignal({
        kind: "LIVE",
        houseId,
        count: 21,
        window: "ROLLING_7_DAYS",
        evidence: "HISTORICAL_VISITOR_AGGREGATE",
      }),
      null,
    );
    assert.deepEqual(
      normalizeSocialProofSignal({
        kind: "LIVE",
        houseId,
        count: 1,
        window: "LIVE",
        evidence: "VERIFIED_CONCURRENT_PRESENCE",
      }),
      { kind: "LIVE", houseId, count: 1, window: "LIVE" },
    );
  });

  it("validates Priority preference identity and percentage", () => {
    assert.deepEqual(
      normalizeSocialProofSignal({
        kind: "PRIORITY_PREFERENCE",
        houseId,
        priorityId: "energy",
        percentage: 38,
        window: "ROLLING_MONTH",
        evidence: "QUALIFYING_PRIORITY_SELECTION_AGGREGATE",
      }),
      {
        kind: "PRIORITY_PREFERENCE",
        houseId,
        priorityId: "energy",
        percentage: 38,
        window: "ROLLING_MONTH",
      },
    );
    assert.equal(
      normalizeSocialProofSignal({
        kind: "PRIORITY_PREFERENCE",
        houseId,
        priorityId: "unknown",
        percentage: 38,
        window: "ROLLING_MONTH",
        evidence: "QUALIFYING_PRIORITY_SELECTION_AGGREGATE",
      }),
      null,
    );
    assert.equal(
      normalizeSocialProofSignal({
        kind: "PRIORITY_PREFERENCE",
        houseId,
        priorityId: "energy",
        percentage: 101,
        window: "ROLLING_MONTH",
        evidence: "QUALIFYING_PRIORITY_SELECTION_AGGREGATE",
      }),
      null,
    );
  });

  it("requires actual completion meanings instead of weaker events", () => {
    assert.equal(
      normalizeSocialProofSignal({
        kind: "PRIORITY_COMPLETION",
        houseId,
        count: 1,
        window: "ROLLING_WEEK",
        evidence: "PRIORITY_ENTRY",
      }),
      null,
    );
    assert.equal(
      normalizeSocialProofSignal({
        kind: "TOUR_COMPLETION",
        houseId,
        count: 21,
        window: "ROLLING_MONTH",
        evidence: "TOUR_VIEW",
      }),
      null,
    );
    assert.deepEqual(
      normalizeSocialProofSignal({
        kind: "TOUR_COMPLETION",
        houseId,
        count: 21,
        window: "ROLLING_MONTH",
        evidence: "TOUR_TRANSITIONED_TO_PRIORITY",
      }),
      {
        kind: "TOUR_COMPLETION",
        houseId,
        count: 21,
        window: "ROLLING_MONTH",
      },
    );
  });

  it("does not reinterpret save or return as stronger customer claims", () => {
    assert.equal(
      normalizeSocialProofSignal({
        kind: "SAVE",
        houseId,
        count: 1,
        window: "ROLLING_WEEK",
        evidence: "PURCHASE_INTENT_INFERENCE",
      }),
      null,
    );
    assert.equal(
      normalizeSocialProofSignal({
        kind: "RETURN",
        houseId,
        count: 1,
        window: "ROLLING_WEEK",
        evidence: "INTEREST_INFERENCE",
      }),
      null,
    );
  });
});
