import {
  createPriorityProfile,
  type PriorityProfile,
} from "./PriorityProfile";
import {
  resolvePrioritySignalKind,
  type PrioritySignal,
} from "./PrioritySignal";

function compareSignals(left: PrioritySignal, right: PrioritySignal): number {
  if (right.strength !== left.strength) {
    return right.strength - left.strength;
  }
  if (left.rank !== right.rank) {
    return left.rank - right.rank;
  }
  return left.id.localeCompare(right.id);
}

/**
 * Priority Signal Evaluator (CAP-PRI-001).
 * Priority Profile → deterministic Priority Signals.
 * Identical profile → identical signals.
 */
export function evaluatePrioritySignals(
  profile: PriorityProfile,
): readonly PrioritySignal[] {
  const count = profile.entries.length;
  if (count === 0) {
    return Object.freeze([]);
  }

  const signals = profile.entries.map((entry) => {
    const kind = resolvePrioritySignalKind(entry.priorityId);
    const strength = (count - entry.rank + 1) / count;
    return Object.freeze({
      id: `${entry.priorityId}@${entry.rank}`,
      kind,
      priorityId: entry.priorityId,
      rank: entry.rank,
      strength,
    });
  });

  return Object.freeze([...signals].sort(compareSignals));
}

/**
 * Convenience: Runtime priorityIds → Priority Signals.
 */
export function evaluatePrioritySignalsFromIds(
  priorityIds: readonly string[],
): readonly PrioritySignal[] {
  return evaluatePrioritySignals(createPriorityProfile(priorityIds));
}
