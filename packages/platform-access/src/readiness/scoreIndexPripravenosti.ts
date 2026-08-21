import {
  AUDIT_LAND_QUESTION_ID,
  parsePrioritySupplementaryQuestionId,
} from '../operations/decisionSignalCatalog';
import type {
  IndexPripravenosti,
  ReadinessBreakdown,
  ReadinessEvent,
  ScoreIndexPripravenostiInput,
} from './readinessTypes';

/**
 * Consecutive PriorityChanged events inside this window collapse to the last
 * event. Capture already debounces ChangePriority at 300ms; 400ms is the
 * narrow extra guard against slider onChange bursts that still reached the log.
 */
export const PRIORITY_SETTLE_WINDOW_MS = 400;

/** Consecutive playback starts of the same media inside this window are one start. */
export const VIDEO_START_DEBOUNCE_MS = 800;

const EMPTY_BREAKDOWN: ReadinessBreakdown = Object.freeze({
  mandatory: 0,
  video: 0,
  images: 0,
  rooms: 0,
  tourReturns: 0,
  priorities: 0,
  faq: 0,
  chat: 0,
});

export function displayIndexPripravenosti(rawScore: number): number {
  if (!Number.isFinite(rawScore) || rawScore <= 0) {
    return 0;
  }
  return Math.min(100, Math.round(rawScore));
}

function roundTenths(value: number): number {
  return Math.round(value * 10) / 10;
}

export function scoreIndexPripravenosti(
  input: ScoreIndexPripravenostiInput,
): IndexPripravenosti {
  const events = [...input.events].sort((left, right) => left.at - right.at);
  const breakdown: ReadinessBreakdown = {
    mandatory: scoreMandatory(events, input.qualifiedLead),
    video: scoreVideo(events),
    images: scoreImages(events, input.catalog.imageIds),
    rooms: scoreRooms(events, input.catalog.roomIds),
    tourReturns: scoreTourReturns(events),
    priorities: scorePriorities(events),
    faq: scoreFaq(events),
    chat: scoreChat(events),
  };
  const rawScore = roundTenths(
    breakdown.mandatory +
      breakdown.video +
      breakdown.images +
      breakdown.rooms +
      breakdown.tourReturns +
      breakdown.priorities +
      breakdown.faq +
      breakdown.chat,
  );
  const score = Math.min(100, Math.max(0, rawScore));
  return {
    available: true,
    rawScore,
    score,
    displayScore: displayIndexPripravenosti(rawScore),
    breakdown,
  };
}

export function unavailableIndexPripravenosti(): IndexPripravenosti {
  return {
    available: false,
    rawScore: 0,
    score: 0,
    displayScore: 0,
    breakdown: EMPTY_BREAKDOWN,
  };
}

function scoreMandatory(
  events: readonly ReadinessEvent[],
  qualifiedLead: boolean,
): number {
  if (!qualifiedLead) {
    return 0;
  }
  const supplementary = new Set<string>();
  let land = false;
  for (const event of events) {
    if (event.type !== 'QuestionAnswered' || event.questionId === undefined) {
      continue;
    }
    if (event.questionId === AUDIT_LAND_QUESTION_ID && event.answerId) {
      land = true;
      continue;
    }
    const priorityId = parsePrioritySupplementaryQuestionId(event.questionId);
    if (priorityId !== null) {
      supplementary.add(priorityId);
    }
  }
  return supplementary.size >= 3 && land ? 30 : 0;
}

function scoreVideo(events: readonly ReadinessEvent[]): number {
  let starts = 0;
  let half = false;
  let ended = false;
  let lastStartAt = Number.NEGATIVE_INFINITY;
  let lastStartMedia = '';
  let score = 0;
  for (const event of events) {
    if (event.type === 'VideoPlaybackStarted' && event.mediaId) {
      if (
        event.mediaId === lastStartMedia &&
        event.at - lastStartAt <= VIDEO_START_DEBOUNCE_MS
      ) {
        continue;
      }
      lastStartMedia = event.mediaId;
      lastStartAt = event.at;
      starts += 1;
      if (starts === 1) {
        score += 0.5;
      } else {
        score += 2;
      }
      continue;
    }
    if (event.type !== 'VideoPlaybackMilestone' || event.mediaId === undefined) {
      continue;
    }
    if (event.milestone === 'half' && !half) {
      half = true;
      score += 0.5;
    }
    if (event.milestone === 'end' && !ended) {
      ended = true;
      score += 0.5;
    }
  }
  return score;
}

function scoreImages(
  events: readonly ReadinessEvent[],
  catalogIds: readonly string[],
): number {
  const unique = new Set<string>();
  let repeats = 0;
  let previousId: string | null = null;
  for (const event of events) {
    if (event.type !== 'ImageViewed' || event.mediaId === undefined) {
      continue;
    }
    const mediaId = event.mediaId;
    if (previousId === mediaId) {
      continue;
    }
    previousId = mediaId;
    if (unique.has(mediaId)) {
      repeats += 1;
      continue;
    }
    unique.add(mediaId);
  }
  let score = unique.size * 0.1 + repeats * 0.5;
  if (
    catalogIds.length > 0 &&
    catalogIds.every((id) => unique.has(id))
  ) {
    score += 2;
  }
  return roundTenths(score);
}

function scoreRooms(
  events: readonly ReadinessEvent[],
  catalogIds: readonly string[],
): number {
  const unique = new Set<string>();
  for (const event of events) {
    if (event.type !== 'RoomSelected' || event.roomId === undefined) {
      continue;
    }
    unique.add(event.roomId);
  }
  let score = unique.size;
  if (
    catalogIds.length > 0 &&
    catalogIds.every((id) => unique.has(id))
  ) {
    score += 2;
  }
  return score;
}

function scoreTourReturns(events: readonly ReadinessEvent[]): number {
  const later = new Set(['priority', 'racio', 'audit']);
  let lastLater = false;
  let score = 0;
  for (const event of events) {
    if (event.type !== 'JourneyStageEntered' || event.stageId === undefined) {
      continue;
    }
    if (event.stageId === 'tour') {
      if (lastLater) {
        score += 5;
      }
      lastLater = false;
      continue;
    }
    if (later.has(event.stageId)) {
      lastLater = true;
    }
  }
  return score;
}

function scorePriorities(events: readonly ReadinessEvent[]): number {
  const settled = collapsePriorityBursts(events);
  if (settled.length === 0) {
    return 0;
  }
  const final = settled[settled.length - 1]!;
  const selected = final.priorityIds ?? [];
  const selectionCount = selected.length;
  let score = 0;
  if (selectionCount >= 3) {
    score += 3 + (selectionCount - 3);
  }
  const finalIntensities = intensityMap(final.intensities);
  for (const id of selected) {
    if (finalIntensities.has(id)) {
      score += 2;
    }
  }
  const finalIdSet = [...selected].slice().sort().join(',');
  const firstFinalIndex = settled.findIndex((event) => {
    const ids = [...(event.priorityIds ?? [])].slice().sort().join(',');
    return ids === finalIdSet;
  });
  const start = firstFinalIndex >= 0 ? firstFinalIndex : 0;
  let previousFingerprint = fingerprint(settled[start]!);
  for (let index = start + 1; index < settled.length; index += 1) {
    const current = settled[index]!;
    const nextFingerprint = fingerprint(current);
    if (nextFingerprint === previousFingerprint) {
      continue;
    }
    previousFingerprint = nextFingerprint;
    score += 3;
  }
  return score;
}

function scoreFaq(events: readonly ReadinessEvent[]): number {
  const unique = new Set<string>();
  for (const event of events) {
    if (event.type !== 'QuestionOpened' || event.questionId === undefined) {
      continue;
    }
    unique.add(event.questionId);
  }
  return unique.size * 0.5;
}

function scoreChat(events: readonly ReadinessEvent[]): number {
  let count = 0;
  for (const event of events) {
    if (event.type === 'ChatQuestionSubmitted') {
      count += 1;
    }
  }
  return count * 2;
}

function collapsePriorityBursts(
  events: readonly ReadinessEvent[],
): readonly ReadinessEvent[] {
  const changed = events.filter(
    (event) =>
      event.type === 'PriorityChanged' &&
      Array.isArray(event.priorityIds) &&
      event.priorityIds.length > 0,
  );
  if (changed.length === 0) {
    return [];
  }
  const settled: ReadinessEvent[] = [];
  let burst: ReadinessEvent[] = [changed[0]!];
  for (let index = 1; index < changed.length; index += 1) {
    const event = changed[index]!;
    const previous = burst[burst.length - 1]!;
    if (event.at - previous.at <= PRIORITY_SETTLE_WINDOW_MS) {
      burst.push(event);
      continue;
    }
    settled.push(burst[burst.length - 1]!);
    burst = [event];
  }
  settled.push(burst[burst.length - 1]!);
  return settled;
}

function intensityMap(
  intensities: ReadinessEvent['intensities'],
): ReadonlyMap<string, number> {
  const map = new Map<string, number>();
  if (intensities === undefined) {
    return map;
  }
  for (const item of intensities) {
    if (Number.isFinite(item.importance)) {
      map.set(item.priorityId, item.importance);
    }
  }
  return map;
}

function fingerprint(event: ReadinessEvent): string {
  const ids = [...(event.priorityIds ?? [])].join(',');
  const intensities = [...(event.intensities ?? [])]
    .map((item) => `${item.priorityId}:${item.importance}`)
    .join(',');
  return `${ids}|${intensities}`;
}
