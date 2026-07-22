import type {
  ContextualMessagingConfig,
  FocusRoom,
  HeroEmphasisConfig,
  InterpretationRule,
  InterpretationRuleKind,
  InterpretedSemantics,
  MediaPrioritizationConfig,
  RecommendationOrderingConfig,
  RecommendedMediaRef,
  RecommendedMediaRole,
  RoomImportanceConfig,
} from "./InterpretationRule";
import type { InterpretationContext } from "./InterpretationContext";
import type { PrioritySignal } from "../priority-signals";

type MutableSemantics = {
  focusRoom: FocusRoom | null;
  primaryReason: string;
  highlights: string[];
  recommendedMedia: RecommendedMediaRef[];
  roomImportanceRank: string[];
  applied: InterpretationRule[];
};

/** Stable intra-priority order so dependent kinds see earlier outputs. */
const KIND_EVALUATION_ORDER: Readonly<Record<InterpretationRuleKind, number>> = {
  "room-importance": 0,
  "hero-emphasis": 1,
  "media-prioritization": 2,
  "contextual-messaging": 3,
  "recommendation-ordering": 4,
};

function compareRules(left: InterpretationRule, right: InterpretationRule): number {
  if (left.priority !== right.priority) {
    return left.priority - right.priority;
  }
  const kindDelta =
    KIND_EVALUATION_ORDER[left.kind] - KIND_EVALUATION_ORDER[right.kind];
  if (kindDelta !== 0) {
    return kindDelta;
  }
  return left.id.localeCompare(right.id);
}

/** Signals already sorted by strength desc; preserve that order. */
function strongestSignals(
  signals: readonly PrioritySignal[],
): readonly PrioritySignal[] {
  return signals;
}

function resolveRoomName(
  housePackage: InterpretationContext["housePackage"],
  roomId: string,
): string | null {
  return housePackage.rooms.find((room) => room.id === roomId)?.name ?? null;
}

function applyRoomImportance(
  context: InterpretationContext,
  rule: InterpretationRule,
  draft: MutableSemantics,
): void {
  const config = rule.config as RoomImportanceConfig;
  const packageRoomIds = context.housePackage.rooms.map((room) => room.id);
  const packageSet = new Set(packageRoomIds);
  let rankedPreferred = config.order.filter((roomId) => packageSet.has(roomId));

  const boosts = config.boostBySignalKind;
  if (boosts !== undefined) {
    const boosted: string[] = [];
    for (const signal of strongestSignals(context.prioritySignals)) {
      const rooms = boosts[signal.kind];
      if (rooms === undefined) {
        continue;
      }
      for (const roomId of rooms) {
        if (packageSet.has(roomId) && !boosted.includes(roomId)) {
          boosted.push(roomId);
        }
      }
    }
    if (boosted.length > 0) {
      rankedPreferred = [
        ...boosted,
        ...rankedPreferred.filter((roomId) => !boosted.includes(roomId)),
      ];
    }
  }

  const remainder = packageRoomIds.filter(
    (roomId) => !rankedPreferred.includes(roomId),
  );
  draft.roomImportanceRank = [...rankedPreferred, ...remainder];

  const activeRoomId = context.runtimeState.activeRoomId;
  if (activeRoomId !== null) {
    const name = resolveRoomName(context.housePackage, activeRoomId);
    if (name !== null) {
      draft.focusRoom = { id: activeRoomId, name };
      return;
    }
  }

  const top = draft.roomImportanceRank[0];
  if (top === undefined) {
    draft.focusRoom = null;
    return;
  }
  const name = resolveRoomName(context.housePackage, top);
  draft.focusRoom =
    name === null
      ? null
      : {
          id: top,
          name,
        };
}

function applyHeroEmphasis(
  context: InterpretationContext,
  rule: InterpretationRule,
  draft: MutableSemantics,
): void {
  const config = rule.config as HeroEmphasisConfig;
  const focusId = draft.focusRoom?.id ?? context.runtimeState.activeRoomId;
  let reason =
    focusId === null
      ? config.defaultReason
      : (config.reasonsByRoomId[focusId] ?? config.defaultReason);

  const bySignal = config.reasonBySignalKind;
  if (bySignal !== undefined) {
    for (const signal of strongestSignals(context.prioritySignals)) {
      const signalReason = bySignal[signal.kind];
      if (signalReason !== undefined) {
        reason = signalReason;
        break;
      }
    }
  }

  draft.primaryReason = reason;
}

function applyMediaPrioritization(
  context: InterpretationContext,
  rule: InterpretationRule,
  draft: MutableSemantics,
): void {
  const config = rule.config as MediaPrioritizationConfig;
  const focusId = draft.focusRoom?.id ?? context.runtimeState.activeRoomId;
  let roleOrder: readonly RecommendedMediaRole[] =
    focusId !== null && config.roleOrderByRoomId?.[focusId] !== undefined
      ? config.roleOrderByRoomId[focusId]!
      : config.roleOrder;

  const bySignal = config.roleOrderBySignalKind;
  if (bySignal !== undefined) {
    for (const signal of strongestSignals(context.prioritySignals)) {
      const override = bySignal[signal.kind];
      if (override !== undefined) {
        roleOrder = override;
        break;
      }
    }
  }

  draft.recommendedMedia = roleOrder.map((role, index) =>
    Object.freeze({
      role,
      rank: index + 1,
      reason: `${rule.id}:${role}`,
    }),
  );
}

function applyContextualMessaging(
  context: InterpretationContext,
  rule: InterpretationRule,
  draft: MutableSemantics,
): void {
  const config = rule.config as ContextualMessagingConfig;
  const focusId = draft.focusRoom?.id ?? context.runtimeState.activeRoomId;
  const roomMessages =
    focusId !== null
      ? (config.messagesByRoomId[focusId] ?? config.defaultMessages)
      : config.defaultMessages;

  const signalMessages: string[] = [];
  const bySignalKind = config.messagesBySignalKind;
  const byPriorityId = config.messagesByPriorityId;

  for (const signal of strongestSignals(context.prioritySignals)) {
    const fromKind = bySignalKind?.[signal.kind];
    if (fromKind !== undefined) {
      signalMessages.push(fromKind);
      continue;
    }
    const fromPriority = byPriorityId?.[signal.priorityId];
    if (fromPriority !== undefined) {
      signalMessages.push(fromPriority);
    }
  }

  draft.highlights = [...roomMessages, ...signalMessages];
}

function applyRecommendationOrdering(
  _context: InterpretationContext,
  rule: InterpretationRule,
  draft: MutableSemantics,
): void {
  const config = rule.config as RecommendationOrderingConfig;
  const rank = new Map(
    config.highlightOrder.map((key, index) => [key, index] as const),
  );

  draft.highlights = [...draft.highlights].sort((left, right) => {
    const leftRank = rank.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = rank.get(right) ?? Number.MAX_SAFE_INTEGER;
    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }
    return left.localeCompare(right);
  });
}

function applyRule(
  context: InterpretationContext,
  rule: InterpretationRule,
  draft: MutableSemantics,
): void {
  switch (rule.kind) {
    case "room-importance":
      applyRoomImportance(context, rule, draft);
      break;
    case "hero-emphasis":
      applyHeroEmphasis(context, rule, draft);
      break;
    case "media-prioritization":
      applyMediaPrioritization(context, rule, draft);
      break;
    case "contextual-messaging":
      applyContextualMessaging(context, rule, draft);
      break;
    case "recommendation-ordering":
      applyRecommendationOrdering(context, rule, draft);
      break;
    default: {
      const _exhaustive: never = rule.kind;
      void _exhaustive;
    }
  }
  draft.applied.push(rule);
}

/**
 * Evaluate Interpretation Rules against Object Package + Runtime State + Priority Signals.
 * Deterministic: identical context → identical InterpretedSemantics.
 *
 * Evaluation order: ascending priority (low → high).
 * Higher-priority rules overwrite earlier outputs for the same fields.
 */
export function evaluateInterpretationRules(
  context: InterpretationContext,
): InterpretedSemantics {
  const draft: MutableSemantics = {
    focusRoom: null,
    primaryReason: "uninterpreted",
    highlights: [],
    recommendedMedia: [],
    roomImportanceRank: context.housePackage.rooms.map((room) => room.id),
    applied: [],
  };

  const enabled = context.rules.rules
    .filter((rule) => rule.enabled)
    .slice()
    .sort(compareRules);

  for (const rule of enabled) {
    applyRule(context, rule, draft);
  }

  const appliedRuleIds = draft.applied
    .slice()
    .sort((left, right) => {
      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }
      return left.id.localeCompare(right.id);
    })
    .map((rule) => rule.id);

  return Object.freeze({
    focusRoom:
      draft.focusRoom === null
        ? null
        : Object.freeze({ ...draft.focusRoom }),
    primaryReason: draft.primaryReason,
    highlights: Object.freeze([...draft.highlights]),
    recommendedMedia: Object.freeze(
      draft.recommendedMedia.map((item) => Object.freeze({ ...item })),
    ),
    roomImportanceRank: Object.freeze([...draft.roomImportanceRank]),
    appliedRuleIds: Object.freeze(appliedRuleIds),
  });
}
