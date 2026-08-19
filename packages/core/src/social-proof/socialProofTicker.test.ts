import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSocialProofTickerSchedule,
  nextSocialProofTickerIndex,
  SOCIAL_PROOF_DIRECTION,
  SOCIAL_PROOF_REPEAT_GAP,
  SOCIAL_PROOF_TICK_MS,
} from "./socialProofTicker";

const corpus = Array.from({ length: 10 }, (_, index) => ({
  id: `proof-${index}`,
  group: index < 5 ? "COUNT" as const : "SHARE" as const,
}));

describe("Social Proof ticker contract", () => {
  it("uses the shared 18-second right-to-left cadence", () => {
    assert.equal(SOCIAL_PROOF_TICK_MS, 18_000);
    assert.equal(SOCIAL_PROOF_DIRECTION, "RIGHT_TO_LEFT");
  });

  it("advances exactly one position and maximizes repeat distance", () => {
    const schedule = createSocialProofTickerSchedule([...corpus, corpus[0]!]);
    assert.equal(schedule.length, corpus.length);

    let index = 0;
    const positions = [schedule[index]!.id];
    for (let position = 1; position <= schedule.length; position += 1) {
      index = nextSocialProofTickerIndex(index, schedule);
      positions.push(schedule[index]!.id);
    }

    assert.equal(positions[1], schedule[1]!.id);
    assert.equal(positions.at(-1), positions[0]);
    assert.ok(schedule.length - 1 >= SOCIAL_PROOF_REPEAT_GAP);
    assert.equal(new Set(positions.slice(0, -1)).size, schedule.length);
  });

  it("does not repeat early when the corpus cannot satisfy the gap", () => {
    const shortSchedule = createSocialProofTickerSchedule(corpus.slice(0, 5));
    assert.equal(nextSocialProofTickerIndex(2, shortSchedule), 2);
  });

  it("keeps semantic topic families unique in every visible three-slot window", () => {
    const schedule = createSocialProofTickerSchedule([
      { id: "count-priorities", group: "COUNT", topicFamily: "priorities_set" },
      { id: "share-priorities", group: "SHARE", topicFamily: "priorities_set" },
      { id: "faq", group: "SHARE", topicFamily: "faq" },
      { id: "chat", group: "SHARE", topicFamily: "chat" },
      { id: "land", group: "COUNT", topicFamily: "land_validation" },
      { id: "pdf", group: "COUNT", topicFamily: "pdf" },
    ]);
    for (let index = 0; index < schedule.length; index += 1) {
      const window = Array.from({ length: 3 }, (_, offset) =>
        schedule[(index + offset) % schedule.length]!,
      );
      assert.equal(new Set(window.map((entry) => entry.topicFamily)).size, 3);
    }
  });

  it("keeps every duplicate family out of concurrent slots", () => {
    for (const family of [
      "priorities_set",
      "return_after_priorities",
      "faq",
      "chat",
      "land_validation",
    ]) {
      const schedule = createSocialProofTickerSchedule([
        { id: `${family}:count`, group: "COUNT" as const, topicFamily: family },
        { id: `${family}:share`, group: "SHARE" as const, topicFamily: family },
        { id: `${family}:one`, group: "COUNT" as const, topicFamily: `${family}:one` },
        { id: `${family}:two`, group: "SHARE" as const, topicFamily: `${family}:two` },
        { id: `${family}:three`, group: "LIVE" as const, topicFamily: `${family}:three` },
        { id: `${family}:four`, group: "COUNT" as const, topicFamily: `${family}:four` },
      ]);
      for (let index = 0; index < schedule.length; index += 1) {
        const window = Array.from({ length: 3 }, (_, offset) =>
          schedule[(index + offset) % schedule.length]!,
        );
        assert.equal(new Set(window.map((entry) => entry.topicFamily)).size, 3);
      }
    }
  });
});
