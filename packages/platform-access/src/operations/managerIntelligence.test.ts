import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  HouseOperationalCase,
  OperationalDecisionSnapshot,
} from "./operationalTypes";
import {
  managerHouseIntelligence,
  managerProjectIntelligence,
} from "./managerIntelligence";

function realCase(input: {
  id: string;
  houseId?: string;
  houseName?: string;
  score?: number | null;
  status?: "new" | "accepted";
  createdAt?: string;
  priorities?: HouseOperationalCase["profilZajemce"]["priorities"];
  decisionSessionId?: string | null;
}): HouseOperationalCase {
  return {
    caseId: input.id,
    companyId: "company-a",
    projectId: "project-a",
    houseId: input.houseId ?? "house-a",
    houseName: input.houseName ?? "House A",
    origin: "LEAD",
    leadId: `lead-${input.id}`,
    decisionSessionId: input.decisionSessionId ?? null,
    processingStatus: input.status ?? "new",
    createdAt: input.createdAt ?? "2026-08-24T10:00:00.000Z",
    contact: {
      name: input.id,
      email: `${input.id}@example.test`,
      phone: null,
    },
    conversion: {
      source: "EMBED",
      intent: "audit",
      status: "accepted",
    },
    profilZajemce: {
      score: null,
      readinessScore: input.score ?? null,
      certainty: "unscored",
      tags: [],
      priorities: input.priorities ?? [],
      questions: [],
      journey: [],
      decisionSessionId: input.decisionSessionId ?? null,
    },
  };
}

function referenceCase(id: string): HouseOperationalCase {
  return {
    ...realCase({ id }),
    origin: "REFERENCE",
    leadId: null,
    decisionSessionId: null,
    processingStatus: "new",
    profilZajemce: {
      ...realCase({ id }).profilZajemce,
      readinessScore: null,
      decisionSessionId: null,
    },
  };
}

describe("TASK 71 Manager Intelligence", () => {
  it("uses REAL cases for manager KPI and keeps REFERENCE separate", () => {
    const result = managerHouseIntelligence({
      houseId: "house-a",
      houseName: "House A",
      cases: [
        realCase({ id: "r1", score: 80 }),
        realCase({ id: "r2", score: 40 }),
        referenceCase("ref1"),
        referenceCase("ref2"),
        referenceCase("ref3"),
      ],
    });

    assert.equal(result.realProfileCount, 2);
    assert.equal(result.referenceProfileCount, 3);
    assert.equal(result.averageReadiness, 60);
    assert.equal(result.readinessDistribution["75-100"], 1);
    assert.equal(result.readinessDistribution["25-49"], 1);
  });

  it("does not turn unavailable readiness into zero", () => {
    const result = managerHouseIntelligence({
      houseId: "house-a",
      houseName: "House A",
      cases: [
        realCase({ id: "r1", score: null }),
        realCase({ id: "r2", score: 60 }),
      ],
    });

    assert.equal(result.measuredReadinessCount, 1);
    assert.equal(result.averageReadiness, 60);
  });

  it("returns truthful pre-data without invented recommendation", () => {
    const result = managerHouseIntelligence({
      houseId: "house-empty",
      houseName: "Empty",
      cases: [],
    });

    assert.equal(result.preData, true);
    assert.equal(result.realProfileCount, 0);
    assert.equal(result.averageReadiness, null);
    assert.deepEqual(result.recommendations, []);
  });

  it("preserves House identity in Project aggregation", () => {
    const a = managerHouseIntelligence({
      houseId: "house-a",
      houseName: "House A",
      cases: [realCase({ id: "a1", score: 80 })],
    });

    const b = managerHouseIntelligence({
      houseId: "house-b",
      houseName: "House B",
      cases: [
        realCase({
          id: "b1",
          houseId: "house-b",
          houseName: "House B",
          score: 40,
        }),
      ],
    });

    const project = managerProjectIntelligence([a, b]);

    assert.deepEqual(
      project.houses.map((house) => house.houseId),
      ["house-a", "house-b"],
    );
    assert.equal(project.totalRealProfiles, 2);
    assert.equal(project.averageReadiness, 60);
  });

  it("creates evidence recommendation only when evidence threshold exists", () => {
    const priorities = [
      {
        id: "energy",
        label: "Energetická úspora",
        importance: 0.8,
        answer: null,
      },
    ] as const;

    const result = managerHouseIntelligence({
      houseId: "house-a",
      houseName: "House A",
      cases: [
        realCase({ id: "r1", score: 60, priorities }),
        realCase({ id: "r2", score: 65, priorities }),
        realCase({ id: "r3", score: 70, priorities }),
      ],
    });

    assert.equal(result.recommendations.length, 1);
    assert.match(result.recommendations[0]?.observation ?? "", /Energetická/);
    assert.ok((result.recommendations[0]?.evidence.length ?? 0) > 0);
  });

  it("does not create recommendation from weak evidence", () => {
    const priorities = [
      {
        id: "energy",
        label: "Energetická úspora",
        importance: 0.8,
        answer: null,
      },
    ] as const;

    const result = managerHouseIntelligence({
      houseId: "house-a",
      houseName: "House A",
      cases: [realCase({ id: "r1", score: 60, priorities })],
    });

    assert.deepEqual(result.recommendations, []);
  });
});

describe("TASK 71 Manager periods and session evidence", () => {
  it("counts MTD / QTD / YTD from canonical createdAt", () => {
    const result = managerHouseIntelligence({
      houseId: "house-a",
      houseName: "House A",
      now: new Date("2026-08-24T12:00:00.000Z"),
      cases: [
        realCase({
          id: "aug",
          score: 60,
          createdAt: "2026-08-10T10:00:00.000Z",
        }),
        realCase({
          id: "jul",
          score: 60,
          createdAt: "2026-07-10T10:00:00.000Z",
        }),
        realCase({
          id: "feb",
          score: 60,
          createdAt: "2026-02-10T10:00:00.000Z",
        }),
        realCase({
          id: "old",
          score: 60,
          createdAt: "2025-12-10T10:00:00.000Z",
        }),
      ],
    });

    assert.deepEqual(result.profilePeriods, {
      monthToDate: 1,
      quarterToDate: 2,
      yearToDate: 3,
    });
  });
});

describe("TASK 71 Manager video engagement", () => {
  it("aggregates canonical video start / half / completion / genuine replay without technical duplicate inflation", () => {
    const item = realCase({
      id: "video-1",
      decisionSessionId: "session-video-1",
      score: 60,
    });

    const snapshot: OperationalDecisionSnapshot = {
      decisionSessionId: "session-video-1",
      companyId: "company-a",
      projectId: "project-a",
      houseId: "house-a",
      events: [
        {
          type: "VideoPlaybackStarted",
          mediaId: "tour-video",
          at: 1_000,
        },
        {
          type: "VideoPlaybackStarted",
          mediaId: "tour-video",
          at: 1_200,
        },
        {
          type: "VideoPlaybackMilestone",
          mediaId: "tour-video",
          milestone: "half",
          at: 5_000,
        },
        {
          type: "VideoPlaybackMilestone",
          mediaId: "tour-video",
          milestone: "end",
          at: 9_000,
        },
        {
          type: "VideoPlaybackStarted",
          mediaId: "tour-video",
          at: 12_000,
        },
      ],
    };

    const result = managerHouseIntelligence({
      houseId: "house-a",
      houseName: "House A",
      cases: [item],
      decisionSnapshots: [snapshot],
    });

    assert.equal(result.video.length, 1);
    assert.deepEqual(result.video[0], {
      mediaId: "tour-video",
      profileCount: 1,
      startCount: 2,
      halfProfileCount: 1,
      completedProfileCount: 1,
      replayProfileCount: 1,
    });
  });

  it("keeps video profile counts unique across repeated canonical evidence", () => {
    const a = realCase({
      id: "video-a",
      decisionSessionId: "session-video-a",
      score: 50,
    });
    const b = realCase({
      id: "video-b",
      decisionSessionId: "session-video-b",
      score: 70,
    });

    const snapshots: OperationalDecisionSnapshot[] = [
      {
        decisionSessionId: "session-video-a",
        companyId: "company-a",
        projectId: "project-a",
        houseId: "house-a",
        events: [
          {
            type: "VideoPlaybackStarted",
            mediaId: "tour-video",
            at: 1_000,
          },
          {
            type: "VideoPlaybackMilestone",
            mediaId: "tour-video",
            milestone: "half",
            at: 5_000,
          },
        ],
      },
      {
        decisionSessionId: "session-video-b",
        companyId: "company-a",
        projectId: "project-a",
        houseId: "house-a",
        events: [
          {
            type: "VideoPlaybackStarted",
            mediaId: "tour-video",
            at: 2_000,
          },
          {
            type: "VideoPlaybackMilestone",
            mediaId: "tour-video",
            milestone: "end",
            at: 8_000,
          },
        ],
      },
    ];

    const result = managerHouseIntelligence({
      houseId: "house-a",
      houseName: "House A",
      cases: [a, b],
      decisionSnapshots: snapshots,
    });

    assert.deepEqual(result.video[0], {
      mediaId: "tour-video",
      profileCount: 2,
      startCount: 2,
      halfProfileCount: 1,
      completedProfileCount: 1,
      replayProfileCount: 0,
    });
  });
});
