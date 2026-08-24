import type {
  HouseOperationalCase,
  OperationalDecisionEvent,
  OperationalDecisionSnapshot,
} from "./operationalTypes";
import { VIDEO_START_DEBOUNCE_MS } from "../readiness/scoreIndexPripravenosti";

export type ManagerReadinessBucket = "0-24" | "25-49" | "50-74" | "75-100";

export type ManagerReadinessDistribution = Readonly<
  Record<ManagerReadinessBucket, number>
>;

export type ManagerPriorityInsight = {
  readonly id: string;
  readonly label: string;
  readonly profileCount: number;
  readonly averageImportance: number | null;
};

export type ManagerQuestionInsight = {
  readonly questionId: string;
  readonly prompt: string | null;
  readonly profileCount: number;
  readonly openCount: number;
};

export type ManagerRoomInsight = {
  readonly roomId: string;
  readonly profileCount: number;
  readonly visitCount: number;
  readonly repeatVisitCount: number;
};

export type ManagerMediaInsight = {
  readonly mediaId: string;
  readonly profileCount: number;
  readonly viewCount: number;
  readonly repeatViewCount: number;
};

export type ManagerVideoInsight = {
  readonly mediaId: string;
  readonly profileCount: number;
  readonly startCount: number;
  readonly halfProfileCount: number;
  readonly completedProfileCount: number;
  readonly replayProfileCount: number;
};

export type ManagerTrajectory = {
  readonly measuredProfiles: number;
  readonly tourProfiles: number;
  readonly priorityProfiles: number;
  readonly faqProfiles: number;
  readonly chatProfiles: number;
  readonly tourReturnProfiles: number;
  readonly convertedProfiles: number;
};

export type ManagerRecommendation = {
  readonly id: string;
  readonly observation: string;
  readonly evidence: readonly string[];
  readonly recommendation: string;
};

export type ManagerProfilePeriods = {
  readonly monthToDate: number;
  readonly quarterToDate: number;
  readonly yearToDate: number;
};

export type ManagerHouseIntelligence = {
  readonly houseId: string;
  readonly houseName: string;
  readonly realProfileCount: number;
  readonly profilePeriods: ManagerProfilePeriods;
  readonly referenceProfileCount: number;
  readonly measuredReadinessCount: number;
  readonly averageReadiness: number | null;
  readonly readinessDistribution: ManagerReadinessDistribution;
  readonly acceptedCaseCount: number;
  readonly trajectory: ManagerTrajectory;
  readonly priorities: readonly ManagerPriorityInsight[];
  readonly faq: readonly ManagerQuestionInsight[];
  readonly rooms: readonly ManagerRoomInsight[];
  readonly media: readonly ManagerMediaInsight[];
  readonly video: readonly ManagerVideoInsight[];
  readonly recommendations: readonly ManagerRecommendation[];
  readonly preData: boolean;
};

export type ManagerProjectHouseComparison = {
  readonly houseId: string;
  readonly houseName: string;
  readonly realProfileCount: number;
  readonly measuredReadinessCount: number;
  readonly averageReadiness: number | null;
  readonly highReadinessCount: number;
  readonly preData: boolean;
};

export type ManagerProjectIntelligence = {
  readonly houses: readonly ManagerProjectHouseComparison[];
  readonly totalRealProfiles: number;
  readonly measuredReadinessCount: number;
  readonly averageReadiness: number | null;
};

type SnapshotByCase = ReadonlyMap<string, OperationalDecisionSnapshot>;

function measuredScore(item: HouseOperationalCase): number | null {
  return typeof item.profilZajemce.readinessScore === "number"
    ? item.profilZajemce.readinessScore
    : null;
}

function readinessBucket(score: number): ManagerReadinessBucket {
  if (score <= 24) return "0-24";
  if (score <= 49) return "25-49";
  if (score <= 74) return "50-74";
  return "75-100";
}

function emptyDistribution(): Record<ManagerReadinessBucket, number> {
  return {
    "0-24": 0,
    "25-49": 0,
    "50-74": 0,
    "75-100": 0,
  };
}

function profilePeriods(
  cases: readonly HouseOperationalCase[],
  now: Date,
): ManagerProfilePeriods {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;

  const startYear = Date.UTC(year, 0, 1);
  const startQuarter = Date.UTC(year, quarterStartMonth, 1);
  const startMonth = Date.UTC(year, month, 1);
  const end = now.getTime();

  const timestamps = cases
    .map((item) => Date.parse(item.createdAt))
    .filter((value) => Number.isFinite(value) && value <= end);

  return {
    monthToDate: timestamps.filter((value) => value >= startMonth).length,
    quarterToDate: timestamps.filter((value) => value >= startQuarter).length,
    yearToDate: timestamps.filter((value) => value >= startYear).length,
  };
}

function eventsFor(
  item: HouseOperationalCase,
  snapshots: SnapshotByCase,
): readonly OperationalDecisionEvent[] {
  const snapshot = snapshots.get(item.caseId);
  return snapshot?.events ?? [];
}

function isQuestionOpened(event: OperationalDecisionEvent): event is Extract<
  OperationalDecisionEvent,
  { readonly type: "QuestionOpened" }
> & {
  readonly questionId: string;
  readonly prompt?: string;
} {
  return (
    event.type === "QuestionOpened" &&
    typeof (event as { readonly questionId?: unknown }).questionId === "string"
  );
}

function isRoomSelected(event: OperationalDecisionEvent): event is Extract<
  OperationalDecisionEvent,
  { readonly type: "RoomSelected" }
> & {
  readonly roomId: string;
} {
  return (
    event.type === "RoomSelected" &&
    typeof (event as { readonly roomId?: unknown }).roomId === "string"
  );
}

function isImageViewed(event: OperationalDecisionEvent): event is Extract<
  OperationalDecisionEvent,
  { readonly type: "ImageViewed" }
> & {
  readonly mediaId: string;
} {
  return (
    event.type === "ImageViewed" &&
    typeof (event as { readonly mediaId?: unknown }).mediaId === "string"
  );
}

function isVideoPlaybackStarted(
  event: OperationalDecisionEvent,
): event is Extract<
  OperationalDecisionEvent,
  { readonly type: "VideoPlaybackStarted" }
> & {
  readonly mediaId: string;
  readonly at: number;
} {
  return (
    event.type === "VideoPlaybackStarted" &&
    typeof (event as { readonly mediaId?: unknown }).mediaId === "string" &&
    typeof event.at === "number"
  );
}

function isVideoPlaybackMilestone(
  event: OperationalDecisionEvent,
): event is Extract<
  OperationalDecisionEvent,
  { readonly type: "VideoPlaybackMilestone" }
> & {
  readonly mediaId: string;
  readonly milestone: "half" | "end";
} {
  return (
    event.type === "VideoPlaybackMilestone" &&
    typeof (event as { readonly mediaId?: unknown }).mediaId === "string" &&
    ((event as { readonly milestone?: unknown }).milestone === "half" ||
      (event as { readonly milestone?: unknown }).milestone === "end")
  );
}

function isJourneyStageEntered(
  event: OperationalDecisionEvent,
): event is Extract<
  OperationalDecisionEvent,
  { readonly type: "JourneyStageEntered" }
> & {
  readonly stageId: "tour" | "priority" | "racio" | "audit";
} {
  return (
    event.type === "JourneyStageEntered" &&
    typeof (event as { readonly stageId?: unknown }).stageId === "string"
  );
}

function buildRecommendations(input: {
  readonly realProfileCount: number;
  readonly priorities: readonly ManagerPriorityInsight[];
  readonly faq: readonly ManagerQuestionInsight[];
  readonly rooms: readonly ManagerRoomInsight[];
  readonly trajectory: ManagerTrajectory;
}): readonly ManagerRecommendation[] {
  const result: ManagerRecommendation[] = [];

  const topPriority = input.priorities[0];
  if (
    topPriority !== undefined &&
    input.realProfileCount >= 3 &&
    topPriority.profileCount >= 3
  ) {
    result.push({
      id: `priority-${topPriority.id}`,
      observation: `${topPriority.label} patří mezi nejsilnější rozhodovací témata.`,
      evidence: [
        `${topPriority.profileCount} Profilů zájemce z ${input.realProfileCount} toto téma zachytilo.`,
        ...(topPriority.averageImportance === null
          ? []
          : [
              `Průměrná intenzita priority je ${Math.round(topPriority.averageImportance * 100)} %.`,
            ]),
      ],
      recommendation:
        "Prověřte, zda Client Experience vysvětluje toto téma dostatečně brzy a srozumitelně.",
    });
  }

  const topFaq = input.faq[0];
  if (
    topFaq !== undefined &&
    input.realProfileCount >= 3 &&
    topFaq.profileCount >= 3
  ) {
    result.push({
      id: `faq-${topFaq.questionId}`,
      observation:
        topFaq.prompt === null
          ? "Jedna z FAQ se opakovaně podílí na rozhodování."
          : `Klienti se opakovaně vracejí k otázce „${topFaq.prompt}“.`,
      evidence: [
        `${topFaq.profileCount} Profilů zájemce tuto otázku otevřelo.`,
        `${topFaq.openCount} zaznamenaných otevření.`,
      ],
      recommendation:
        "Zvažte přenesení základní odpovědi přímo do hlavní Client Experience a FAQ ponechte pro detail.",
    });
  }

  const topRoom = input.rooms.find((item) => item.repeatVisitCount > 0);
  if (
    topRoom !== undefined &&
    input.realProfileCount >= 3 &&
    topRoom.repeatVisitCount >= 3
  ) {
    result.push({
      id: `room-${topRoom.roomId}`,
      observation: "K této části domu se klienti opakovaně vracejí.",
      evidence: [
        `${topRoom.profileCount} Profilů navštívilo místnost ${topRoom.roomId}.`,
        `${topRoom.repeatVisitCount} opakovaných návštěv.`,
      ],
      recommendation:
        "Prověřte, zda TOUR u této místnosti poskytuje všechny informace potřebné pro rozhodnutí.",
    });
  }

  return result;
}

export function managerHouseIntelligence(input: {
  readonly houseId: string;
  readonly houseName: string;
  readonly cases: readonly HouseOperationalCase[];
  readonly decisionSnapshots?: readonly OperationalDecisionSnapshot[];
  readonly now?: Date;
}): ManagerHouseIntelligence {
  const realCases = input.cases.filter((item) => item.origin === "LEAD");
  const referenceCases = input.cases.filter(
    (item) => item.origin === "REFERENCE",
  );

  const snapshotMap = new Map<string, OperationalDecisionSnapshot>();
  for (const item of realCases) {
    const decisionSessionId = item.decisionSessionId;
    if (decisionSessionId === null) continue;

    const snapshot = (input.decisionSnapshots ?? []).find(
      (candidate) =>
        candidate.decisionSessionId === decisionSessionId &&
        candidate.companyId === item.companyId &&
        candidate.projectId === item.projectId &&
        candidate.houseId === item.houseId,
    );

    if (snapshot !== undefined) {
      snapshotMap.set(item.caseId, snapshot);
    }
  }

  const scores = realCases
    .map(measuredScore)
    .filter((score): score is number => score !== null);

  const distribution = emptyDistribution();
  for (const score of scores) distribution[readinessBucket(score)] += 1;

  const priorityMap = new Map<
    string,
    { label: string; profiles: Set<string>; importance: number[] }
  >();

  for (const item of realCases) {
    for (const priority of item.profilZajemce.priorities) {
      const current = priorityMap.get(priority.id) ?? {
        label: priority.label,
        profiles: new Set<string>(),
        importance: [],
      };
      current.profiles.add(item.caseId);
      if (typeof priority.importance === "number") {
        current.importance.push(priority.importance);
      }
      priorityMap.set(priority.id, current);
    }
  }

  const priorities = [...priorityMap.entries()]
    .map(([id, value]) => ({
      id,
      label: value.label,
      profileCount: value.profiles.size,
      averageImportance:
        value.importance.length === 0
          ? null
          : value.importance.reduce((sum, x) => sum + x, 0) /
            value.importance.length,
    }))
    .sort(
      (a, b) =>
        b.profileCount - a.profileCount ||
        (b.averageImportance ?? -1) - (a.averageImportance ?? -1) ||
        a.label.localeCompare(b.label, "cs"),
    );

  const faqMap = new Map<
    string,
    { prompt: string | null; profiles: Set<string>; opens: number }
  >();

  const roomMap = new Map<
    string,
    { profiles: Set<string>; visits: number; repeats: number }
  >();

  const mediaMap = new Map<
    string,
    { profiles: Set<string>; views: number; repeats: number }
  >();

  const videoMap = new Map<
    string,
    {
      profiles: Set<string>;
      starts: number;
      halfProfiles: Set<string>;
      completedProfiles: Set<string>;
      replayProfiles: Set<string>;
    }
  >();

  let tourProfiles = 0;
  let priorityProfiles = 0;
  let faqProfiles = 0;
  let chatProfiles = 0;
  let tourReturnProfiles = 0;

  for (const item of realCases) {
    const events = eventsFor(item, snapshotMap);

    let hasTour = false;
    let hasPriority = false;
    let hasFaq = false;
    let hasChat = false;

    let leftTour = false;
    let returnedToTour = false;

    const roomSeen = new Map<string, number>();
    const mediaSeen = new Map<string, number>();
    const videoStartSeen = new Map<string, number>();
    const videoLastStartAt = new Map<string, number>();
    const faqSeen = new Set<string>();

    for (const event of events) {
      if (isJourneyStageEntered(event)) {
        if (event.stageId === "tour") {
          hasTour = true;
          if (leftTour) returnedToTour = true;
        } else {
          leftTour = true;
        }
      }

      if (event.type === "PriorityChanged") hasPriority = true;

      if (isQuestionOpened(event)) {
        hasFaq = true;
        faqSeen.add(event.questionId);

        const current = faqMap.get(event.questionId) ?? {
          prompt: event.prompt ?? null,
          profiles: new Set<string>(),
          opens: 0,
        };
        current.opens += 1;
        current.profiles.add(item.caseId);
        if (current.prompt === null && event.prompt !== undefined) {
          current.prompt = event.prompt;
        }
        faqMap.set(event.questionId, current);
      }

      if (event.type === "ChatQuestionSubmitted") {
        hasChat = true;
      }

      if (isRoomSelected(event)) {
        const seen = roomSeen.get(event.roomId) ?? 0;
        roomSeen.set(event.roomId, seen + 1);

        const current = roomMap.get(event.roomId) ?? {
          profiles: new Set<string>(),
          visits: 0,
          repeats: 0,
        };
        current.profiles.add(item.caseId);
        current.visits += 1;
        if (seen > 0) current.repeats += 1;
        roomMap.set(event.roomId, current);
      }

      if (isImageViewed(event)) {
        const mediaId = event.mediaId;
        const seen = mediaSeen.get(mediaId) ?? 0;
        mediaSeen.set(mediaId, seen + 1);

        const current = mediaMap.get(mediaId) ?? {
          profiles: new Set<string>(),
          views: 0,
          repeats: 0,
        };
        current.profiles.add(item.caseId);
        current.views += 1;
        if (seen > 0) current.repeats += 1;
        mediaMap.set(mediaId, current);
      }

      if (isVideoPlaybackStarted(event)) {
        const mediaId = event.mediaId;
        const previousAt = videoLastStartAt.get(mediaId);

        /*
         * Keep Manager replay semantics aligned with TASK 70:
         * Keep exactly the TASK-70 debounce contract.
         * Consecutive starts of the same media inside the canonical
         * VIDEO_START_DEBOUNCE_MS window are one technical start.
         */
        const technicalDuplicate =
          previousAt !== undefined &&
          event.at - previousAt <= VIDEO_START_DEBOUNCE_MS;

        videoLastStartAt.set(mediaId, event.at);

        if (!technicalDuplicate) {
          const seen = videoStartSeen.get(mediaId) ?? 0;
          videoStartSeen.set(mediaId, seen + 1);

          const current = videoMap.get(mediaId) ?? {
            profiles: new Set<string>(),
            starts: 0,
            halfProfiles: new Set<string>(),
            completedProfiles: new Set<string>(),
            replayProfiles: new Set<string>(),
          };

          current.profiles.add(item.caseId);
          current.starts += 1;
          if (seen > 0) current.replayProfiles.add(item.caseId);
          videoMap.set(mediaId, current);
        }
      }

      if (isVideoPlaybackMilestone(event)) {
        const current = videoMap.get(event.mediaId) ?? {
          profiles: new Set<string>(),
          starts: 0,
          halfProfiles: new Set<string>(),
          completedProfiles: new Set<string>(),
          replayProfiles: new Set<string>(),
        };

        current.profiles.add(item.caseId);

        if (event.milestone === "half") {
          current.halfProfiles.add(item.caseId);
        }

        if (event.milestone === "end") {
          current.completedProfiles.add(item.caseId);
        }

        videoMap.set(event.mediaId, current);
      }
    }

    if (hasTour) tourProfiles += 1;
    if (hasPriority) priorityProfiles += 1;
    if (hasFaq) faqProfiles += 1;
    if (hasChat) chatProfiles += 1;
    if (returnedToTour) tourReturnProfiles += 1;
  }

  const faq = [...faqMap.entries()]
    .map(([questionId, value]) => ({
      questionId,
      prompt: value.prompt,
      profileCount: value.profiles.size,
      openCount: value.opens,
    }))
    .sort(
      (a, b) =>
        b.profileCount - a.profileCount ||
        b.openCount - a.openCount ||
        a.questionId.localeCompare(b.questionId),
    );

  const rooms = [...roomMap.entries()]
    .map(([roomId, value]) => ({
      roomId,
      profileCount: value.profiles.size,
      visitCount: value.visits,
      repeatVisitCount: value.repeats,
    }))
    .sort(
      (a, b) =>
        b.profileCount - a.profileCount ||
        b.repeatVisitCount - a.repeatVisitCount ||
        a.roomId.localeCompare(b.roomId),
    );

  const media = [...mediaMap.entries()]
    .map(([mediaId, value]) => ({
      mediaId,
      profileCount: value.profiles.size,
      viewCount: value.views,
      repeatViewCount: value.repeats,
    }))
    .sort(
      (a, b) =>
        b.profileCount - a.profileCount ||
        b.repeatViewCount - a.repeatViewCount ||
        a.mediaId.localeCompare(b.mediaId),
    );

  const video = [...videoMap.entries()]
    .map(([mediaId, value]) => ({
      mediaId,
      profileCount: value.profiles.size,
      startCount: value.starts,
      halfProfileCount: value.halfProfiles.size,
      completedProfileCount: value.completedProfiles.size,
      replayProfileCount: value.replayProfiles.size,
    }))
    .sort(
      (a, b) =>
        b.profileCount - a.profileCount ||
        b.completedProfileCount - a.completedProfileCount ||
        b.replayProfileCount - a.replayProfileCount ||
        a.mediaId.localeCompare(b.mediaId),
    );

  const trajectory: ManagerTrajectory = {
    measuredProfiles: scores.length,
    tourProfiles,
    priorityProfiles,
    faqProfiles,
    chatProfiles,
    tourReturnProfiles,
    convertedProfiles: realCases.filter(
      (item) => item.conversion.status === "accepted",
    ).length,
  };

  const averageReadiness =
    scores.length === 0
      ? null
      : scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return {
    houseId: input.houseId,
    houseName: input.houseName,
    realProfileCount: realCases.length,
    profilePeriods: profilePeriods(realCases, input.now ?? new Date()),
    referenceProfileCount: referenceCases.length,
    measuredReadinessCount: scores.length,
    averageReadiness,
    readinessDistribution: distribution,
    acceptedCaseCount: realCases.filter(
      (item) => item.processingStatus === "accepted",
    ).length,
    trajectory,
    priorities,
    faq,
    rooms,
    media,
    video,
    recommendations: buildRecommendations({
      realProfileCount: realCases.length,
      priorities,
      faq,
      rooms,
      trajectory,
    }),
    preData: realCases.length === 0,
  };
}

export function managerProjectIntelligence(
  houses: readonly ManagerHouseIntelligence[],
): ManagerProjectIntelligence {
  const measured = houses.filter((house) => house.averageReadiness !== null);

  const weightedReadinessTotal = measured.reduce(
    (sum, house) =>
      sum + (house.averageReadiness ?? 0) * house.measuredReadinessCount,
    0,
  );

  const measuredCount = measured.reduce(
    (sum, house) => sum + house.measuredReadinessCount,
    0,
  );

  return {
    houses: houses.map((house) => ({
      houseId: house.houseId,
      houseName: house.houseName,
      realProfileCount: house.realProfileCount,
      measuredReadinessCount: house.measuredReadinessCount,
      averageReadiness: house.averageReadiness,
      highReadinessCount: house.readinessDistribution["75-100"],
      preData: house.preData,
    })),
    totalRealProfiles: houses.reduce(
      (sum, house) => sum + house.realProfileCount,
      0,
    ),
    measuredReadinessCount: measuredCount,
    averageReadiness:
      measuredCount === 0 ? null : weightedReadinessTotal / measuredCount,
  };
}
