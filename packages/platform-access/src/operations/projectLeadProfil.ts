import type {
  OperationalDecisionEvent,
  OperationalDecisionSnapshot,
  OperationalJourneyStep,
  OperationalLeadRecord,
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

export function selectedPrioritiesFromSnapshot(
  snapshot: OperationalDecisionSnapshot,
): readonly OperationalPrioritySelection[] {
  const ids =
    snapshot.priorityIds.length > 0
      ? snapshot.priorityIds
      : [...snapshot.events].reverse().find(isPriorityChanged)?.priorityIds ?? [];

  return ids.map((id) => ({
    id,
    label: priorityLabel(id),
    importance: snapshot.priorityIntensities?.[id] ?? null,
  }));
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
  const strongest = strongestPriority(priorities);
  const insight =
    strongest === null
      ? 'Zájemce odeslal žádost o posouzení. Zachycené priority zatím nejsou k dispozici.'
      : `Nejsilnější zachycená priorita: ${strongest.label}.`;

  return {
    land: 'Nezadáno',
    location: null,
    tags: priorities.map((item) => item.label),
    priorities,
    insight,
    score: null,
    journey: journeyFromSnapshot(snapshot, lead.status === 'accepted'),
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
