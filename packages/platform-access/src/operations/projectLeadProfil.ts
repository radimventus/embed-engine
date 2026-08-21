import {
  AUDIT_LAND_QUESTION_ID,
  AUDIT_LAND_SALES_DETAIL,
  lookupAuditLandLabel,
  lookupOpenedQuestionLabel,
  lookupSupplementaryAnswer,
  lookupSupplementaryQuestion,
  prioritySupplementaryQuestionId,
} from './decisionSignalCatalog';
import {
  formatVisitedRoomsTitle,
  lookupRoomSalesLabel,
} from './lookupRoomSalesLabel';
import {
  scoreIndexPripravenosti,
} from '../readiness/scoreIndexPripravenosti';
import type { ReadinessCatalog } from '../readiness/readinessTypes';
import type {
  OperationalDecisionEvent,
  OperationalDecisionSnapshot,
  OperationalJourneyStep,
  OperationalOpenedQuestion,
  OperationalLeadRecord,
  OperationalPriorityAnswer,
  OperationalPrioritySelection,
  ProfilZajemce,
} from './operationalTypes';

/**
 * Canonical Client Priority labels — same catalogue IDs as Client cards.
 * Not a second intensity scale.
 */
export const CANONICAL_PRIORITY_LABELS: Readonly<Record<string, string>> =
  Object.freeze({
    plot: 'Pozemek',
    layout: 'Dispozice',
    privacy: 'Soukromí',
    energy: 'Energie',
    'operating-costs': 'Provozní náklady',
    design: 'Design',
    quality: 'Kvalita',
    investment: 'Investice',
    maintenance: 'Údržba',
    flexibility: 'Flexibilita',
  });

/**
 * Decision Outcome `confidence` is recommendation-progress
 * (0.35 + progressRatio * 0.65). That is not Index připravenosti.
 * Legacy `score` stays null on REAL cases. Readiness is scored separately.
 */
export const REAL_DECISION_CERTAINTY_AUTHORITY = 'unscored' as const;

export function priorityLabel(priorityId: string): string {
  return CANONICAL_PRIORITY_LABELS[priorityId] ?? priorityId;
}

export function formatPriorityImportance(importance: number | null): string | null {
  if (importance === null || !Number.isFinite(importance)) {
    return null;
  }
  return `${Math.round(Math.min(1, Math.max(0, importance)) * 100)} %`;
}

export const SALES_CONVERSION_JOURNEY_TITLE = 'Odeslal žádost o audit.';

function conversionJourneyStep(): OperationalJourneyStep {
  return {
    module: 'Konverze',
    title: SALES_CONVERSION_JOURNEY_TITLE,
    detail: '',
    completed: true,
    active: true,
  };
}

function visitedRoomIdsFromSnapshot(
  snapshot: OperationalDecisionSnapshot,
): readonly string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const event of snapshot.events) {
    if (!isRoomSelected(event) || seen.has(event.roomId)) {
      continue;
    }
    seen.add(event.roomId);
    ordered.push(event.roomId);
  }
  return ordered;
}

function isPriorityChanged(
  event: OperationalDecisionEvent,
): event is Extract<OperationalDecisionEvent, { type: 'PriorityChanged' }> {
  return event.type === 'PriorityChanged' && Array.isArray(
    (event as { priorityIds?: unknown }).priorityIds,
  );
}

function isRoomSelected(
  event: OperationalDecisionEvent,
): event is Extract<OperationalDecisionEvent, { type: 'RoomSelected' }> {
  return event.type === 'RoomSelected' && typeof (event as { roomId?: unknown }).roomId === 'string';
}

function isQuestionAnswered(
  event: OperationalDecisionEvent,
): event is Extract<OperationalDecisionEvent, { type: 'QuestionAnswered' }> {
  return (
    event.type === 'QuestionAnswered' &&
    typeof (event as { questionId?: unknown }).questionId === 'string' &&
    typeof (event as { answerId?: unknown }).answerId === 'string'
  );
}

function isQuestionOpened(
  event: OperationalDecisionEvent,
): event is Extract<OperationalDecisionEvent, { type: 'QuestionOpened' }> {
  return (
    event.type === 'QuestionOpened' &&
    typeof (event as { questionId?: unknown }).questionId === 'string'
  );
}

function latestAnswersByQuestion(
  events: readonly OperationalDecisionEvent[],
): ReadonlyMap<string, { readonly answerId: string; readonly at: number }> {
  const latest = new Map<string, { readonly answerId: string; readonly at: number }>();
  for (const event of events) {
    if (!isQuestionAnswered(event)) {
      continue;
    }
    latest.set(event.questionId, { answerId: event.answerId, at: event.at });
  }
  return latest;
}

function supplementaryAnswerForPriority(
  priorityId: string,
  answers: ReadonlyMap<string, { readonly answerId: string; readonly at: number }>,
): OperationalPriorityAnswer | null {
  const questionId = prioritySupplementaryQuestionId(priorityId);
  const recorded = answers.get(questionId);
  if (recorded === undefined) {
    return null;
  }
  const questionLabel =
    lookupSupplementaryQuestion(priorityId) ?? questionId;
  const answerLabel =
    lookupSupplementaryAnswer(priorityId, recorded.answerId) ?? recorded.answerId;
  return {
    questionId,
    questionLabel,
    answerId: recorded.answerId,
    answerLabel,
  };
}

export function selectedPrioritiesFromSnapshot(
  snapshot: OperationalDecisionSnapshot,
): readonly OperationalPrioritySelection[] {
  const ids =
    snapshot.priorityIds.length > 0
      ? snapshot.priorityIds
      : [...snapshot.events].reverse().find(isPriorityChanged)?.priorityIds ?? [];
  const answers = latestAnswersByQuestion(snapshot.events);

  return ids.map((id) => ({
    id,
    label: priorityLabel(id),
    importance: snapshot.priorityIntensities?.[id] ?? null,
    answer: supplementaryAnswerForPriority(id, answers),
  }));
}

export function openedQuestionsFromSnapshot(
  snapshot: OperationalDecisionSnapshot,
): readonly OperationalOpenedQuestion[] {
  const unique = new Map<string, OperationalOpenedQuestion>();
  for (const event of snapshot.events) {
    if (!isQuestionOpened(event)) {
      continue;
    }
    if (unique.has(event.questionId)) {
      continue;
    }
    unique.set(event.questionId, {
      questionId: event.questionId,
      label: lookupOpenedQuestionLabel(event.questionId, event.prompt),
    });
  }
  return [...unique.values()];
}

export function auditLandFromSnapshot(
  snapshot: OperationalDecisionSnapshot,
): {
  readonly answerId: string;
  readonly label: string;
  readonly detail: string;
} | null {
  const recorded = latestAnswersByQuestion(snapshot.events).get(
    AUDIT_LAND_QUESTION_ID,
  );
  if (recorded === undefined) {
    return null;
  }
  const label = lookupAuditLandLabel(recorded.answerId);
  if (label === null) {
    return null;
  }
  return {
    answerId: recorded.answerId,
    label,
    detail: AUDIT_LAND_SALES_DETAIL[recorded.answerId] ?? label,
  };
}

function strongestPriority(
  priorities: readonly OperationalPrioritySelection[],
): OperationalPrioritySelection | null {
  if (priorities.length === 0) {
    return null;
  }
  return [...priorities].sort((left, right) => {
    const delta = (right.importance ?? -1) - (left.importance ?? -1);
    if (delta !== 0) {
      return delta;
    }
    return left.label.localeCompare(right.label, 'cs');
  })[0] ?? null;
}

function journeyFromSnapshot(
  snapshot: OperationalDecisionSnapshot,
  converted: boolean,
  land: ReturnType<typeof auditLandFromSnapshot>,
  openedQuestions: readonly OperationalOpenedQuestion[],
  priorities: readonly OperationalPrioritySelection[],
  roomNames?: Readonly<Record<string, string>>,
): readonly OperationalJourneyStep[] {
  const steps: OperationalJourneyStep[] = [];
  const roomIds = visitedRoomIdsFromSnapshot(snapshot);
  if (roomIds.length > 0) {
    const labels = roomIds.map((roomId) =>
      lookupRoomSalesLabel(roomId, roomNames),
    );
    steps.push({
      module: 'Prohlídka domu',
      title: formatVisitedRoomsTitle(labels.length),
      detail: labels.join(', '),
      completed: true,
    });
  }

  if (priorities.length > 0) {
    steps.push({
      module: 'Priority',
      title: '',
      detail: '',
      lines: priorities.map((priority) => {
        const importance = formatPriorityImportance(priority.importance);
        return importance === null
          ? priority.label
          : `${priority.label} · ${importance}`;
      }),
      completed: true,
    });
  }

  if (openedQuestions.length > 0) {
    steps.push({
      module: 'FAQ',
      title: `Otevřené otázky · ${openedQuestions.length}`,
      detail: '',
      lines: openedQuestions.map((item) => item.label),
      completed: true,
    });
  }

  if (land !== null) {
    steps.push({
      module: 'Pozemek',
      title: land.detail,
      detail: '',
      completed: true,
    });
  }

  if (converted) {
    steps.push(conversionJourneyStep());
  }

  return steps;
}

export function projectLeadProfilZajemce(input: {
  readonly lead: OperationalLeadRecord;
  readonly snapshot: OperationalDecisionSnapshot | null;
  readonly roomNames?: Readonly<Record<string, string>>;
  readonly readinessCatalog?: ReadinessCatalog;
}): ProfilZajemce {
  const { lead, snapshot, roomNames, readinessCatalog } = input;
  if (snapshot === null) {
    return {
      land: 'Nezadáno',
      location: null,
      tags: [],
      priorities: [],
      openedQuestions: [],
      insight:
        'Zájemce odeslal žádost o posouzení. Rozhodovací relace k tomuto kontaktu není k dispozici.',
      score: null,
      readinessScore: null,
      journey: [conversionJourneyStep()],
    };
  }

  const priorities = selectedPrioritiesFromSnapshot(snapshot);
  const openedQuestions = openedQuestionsFromSnapshot(snapshot);
  const land = auditLandFromSnapshot(snapshot);
  const strongest = strongestPriority(priorities);
  const insight =
    strongest === null
      ? 'Zájemce odeslal žádost o posouzení. Zachycené priority zatím nejsou k dispozici.'
      : strongest.answer === null
        ? `Nejsilnější zachycená priorita: ${strongest.label}.`
        : `Nejsilnější zachycená priorita: ${strongest.label}. ${strongest.answer.answerLabel}.`;
  const readiness = scoreIndexPripravenosti({
    events: snapshot.events,
    catalog: readinessCatalog ?? {
      roomIds: roomNames === undefined ? [] : Object.keys(roomNames),
      imageIds: [],
    },
    qualifiedLead: lead.status === 'accepted',
  });

  return {
    land: land?.label ?? 'Nezadáno',
    location: null,
    tags: priorities.map((item) => item.label),
    priorities,
    openedQuestions,
    insight,
    score: null,
    readinessScore: readiness.displayScore,
    journey: journeyFromSnapshot(
      snapshot,
      lead.status === 'accepted',
      land,
      openedQuestions,
      priorities,
      roomNames,
    ),
  };
}

export function resolveCorrelatedSnapshot(
  lead: OperationalLeadRecord,
  sessions: readonly OperationalDecisionSnapshot[],
): OperationalDecisionSnapshot | null {
  const decisionSessionId = lead.decisionSessionId;
  if (decisionSessionId === null || decisionSessionId.length === 0) {
    return null;
  }
  const found = sessions.find(
    (item) => item.decisionSessionId === decisionSessionId,
  );
  if (found === undefined) {
    return null;
  }
  if (
    found.companyId !== lead.companyId ||
    found.projectId !== lead.projectId ||
    found.houseId !== lead.houseId
  ) {
    return null;
  }
  return found;
}
