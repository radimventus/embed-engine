import {
  AUDIT_LAND_QUESTION_ID,
  AUDIT_LAND_SALES_DETAIL,
  lookupAuditLandLabel,
  lookupOpenedQuestionLabel,
  lookupSupplementaryAnswer,
  lookupSupplementaryQuestion,
  prioritySupplementaryQuestionId,
} from './decisionSignalCatalog';
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
 * (0.35 + progressRatio * 0.65). That is not Index rozhodovací jistoty.
 * REAL cases therefore stay `score: null` until a compatible measured metric exists.
 */
export const REAL_DECISION_CERTAINTY_AUTHORITY = 'unscored' as const;

export function priorityLabel(priorityId: string): string {
  return CANONICAL_PRIORITY_LABELS[priorityId] ?? priorityId;
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
): readonly OperationalJourneyStep[] {
  const steps: OperationalJourneyStep[] = [];
  const seenRooms = new Set<string>();
  let sawPriority = false;
  let changedPriority = false;

  for (const event of snapshot.events) {
    if (isRoomSelected(event) && !seenRooms.has(event.roomId)) {
      seenRooms.add(event.roomId);
      steps.push({
        module: 'Prohlídka domu',
        title: 'Navštívená místnost',
        detail: event.roomId,
        completed: true,
      });
    }
    if (isPriorityChanged(event)) {
      if (!sawPriority) {
        sawPriority = true;
        steps.push({
          module: 'Priority',
          title: 'Výběr priorit',
          detail: event.priorityIds.map(priorityLabel).join(', '),
          completed: true,
        });
      } else {
        changedPriority = true;
      }
    }
  }

  if (changedPriority) {
    const latest = [...snapshot.events].reverse().find(isPriorityChanged);
    steps.push({
      module: 'Priority',
      title: 'Úprava priorit',
      detail: (latest?.priorityIds ?? []).map(priorityLabel).join(', '),
      completed: true,
    });
  }

  if (openedQuestions.length > 0) {
    steps.push({
      module: 'FAQ',
      title: 'Otevřené otázky',
      detail: openedQuestions.map((item) => item.label).join(', '),
      completed: true,
    });
  }

  if (land !== null) {
    steps.push({
      module: 'Audit',
      title: land.label,
      detail: land.detail,
      completed: true,
    });
  }

  if (converted) {
    steps.push({
      module: 'Zachycení kontaktu',
      title: 'Žádost o audit',
      detail: 'Odeslána žádost o audit',
      completed: true,
      active: true,
    });
  }

  return steps;
}

export function projectLeadProfilZajemce(input: {
  readonly lead: OperationalLeadRecord;
  readonly snapshot: OperationalDecisionSnapshot | null;
}): ProfilZajemce {
  const { lead, snapshot } = input;
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
      journey: [
        {
          module: 'Zachycení kontaktu',
          title: 'Žádost o audit',
          detail: 'Odeslána žádost o audit',
          completed: true,
          active: true,
        },
      ],
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

  return {
    land: land?.label ?? 'Nezadáno',
    location: null,
    tags: priorities.map((item) => item.label),
    priorities,
    openedQuestions,
    insight,
    score: null,
    journey: journeyFromSnapshot(
      snapshot,
      lead.status === 'accepted',
      land,
      openedQuestions,
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
