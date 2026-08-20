export const DECISION_SESSION_FORMAT = 'decision-session';
export const DECISION_SESSION_SCHEMA_VERSION = '1.0';

export const DECISION_SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type DurablePriorityIntensity = {
  readonly priorityId: string;
  readonly importance: number;
};

export type DurableDecisionEvent =
  | {
      readonly type: 'RoomSelected';
      readonly roomId: string;
      readonly at: number;
    }
  | {
      readonly type: 'PriorityChanged';
      readonly priorityIds: readonly string[];
      readonly intensities?: readonly DurablePriorityIntensity[];
      readonly at: number;
    }
  | {
      readonly type: 'VariantSelected';
      readonly variantId: string;
      readonly at: number;
    }
  | {
      readonly type: 'ScenarioActivated';
      readonly scenarioId: string;
      readonly at: number;
    }
  | {
      readonly type: 'QuestionAnswered';
      readonly questionId: string;
      readonly answerId: string;
      readonly at: number;
    }
  | {
      readonly type: 'QuestionOpened';
      readonly questionId: string;
      readonly prompt?: string;
      readonly at: number;
    };

export type DurableSerializedDecisionSession = {
  readonly format: typeof DECISION_SESSION_FORMAT;
  readonly schemaVersion: typeof DECISION_SESSION_SCHEMA_VERSION;
  readonly objectId: string;
  readonly runtimeState: {
    readonly activeRoomId: string | null;
    readonly priorityIds: readonly string[];
    readonly priorityIntensities: Readonly<Record<string, number>> | null;
    readonly variantId: string | null;
    readonly scenarioId: string | null;
    readonly version: number;
  };
  readonly events: readonly DurableDecisionEvent[];
  readonly createdAt: number;
  readonly updatedAt: number;
};

export type DurableDecisionSessionRecord = {
  readonly decisionSessionId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly serialized: DurableSerializedDecisionSession;
};

export type DurableDecisionSessionInput = {
  readonly decisionSessionId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly serialized: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isDecisionSessionId(value: string): boolean {
  return DECISION_SESSION_ID_PATTERN.test(value.trim());
}

function sanitizeIntensities(
  value: unknown,
): readonly DurablePriorityIntensity[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new Error('Invalid decision session intensities.');
  }
  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.priorityId !== 'string' ||
      item.priorityId.trim().length === 0 ||
      typeof item.importance !== 'number' ||
      !Number.isFinite(item.importance) ||
      item.importance < 0 ||
      item.importance > 1
    ) {
      throw new Error('Invalid decision session intensities.');
    }
    return {
      priorityId: item.priorityId.trim(),
      importance: item.importance,
    };
  });
}

function sanitizeEvent(value: unknown): DurableDecisionEvent {
  if (!isRecord(value) || typeof value.type !== 'string') {
    throw new Error('Invalid decision session event.');
  }
  if (typeof value.at !== 'number' || !Number.isFinite(value.at)) {
    throw new Error('Invalid decision session event timestamp.');
  }
  switch (value.type) {
    case 'RoomSelected':
      if (typeof value.roomId !== 'string' || value.roomId.trim().length === 0) {
        throw new Error('Invalid RoomSelected event.');
      }
      return { type: 'RoomSelected', roomId: value.roomId.trim(), at: value.at };
    case 'PriorityChanged': {
      if (
        !Array.isArray(value.priorityIds) ||
        value.priorityIds.length === 0 ||
        value.priorityIds.some(
          (id) => typeof id !== 'string' || id.trim().length === 0,
        )
      ) {
        throw new Error('Invalid PriorityChanged event.');
      }
      const intensities = sanitizeIntensities(value.intensities);
      return intensities === undefined
        ? {
            type: 'PriorityChanged',
            priorityIds: value.priorityIds.map((id) => (id as string).trim()),
            at: value.at,
          }
        : {
            type: 'PriorityChanged',
            priorityIds: value.priorityIds.map((id) => (id as string).trim()),
            intensities,
            at: value.at,
          };
    }
    case 'VariantSelected':
      if (typeof value.variantId !== 'string' || value.variantId.trim().length === 0) {
        throw new Error('Invalid VariantSelected event.');
      }
      return {
        type: 'VariantSelected',
        variantId: value.variantId.trim(),
        at: value.at,
      };
    case 'ScenarioActivated':
      if (typeof value.scenarioId !== 'string' || value.scenarioId.trim().length === 0) {
        throw new Error('Invalid ScenarioActivated event.');
      }
      return {
        type: 'ScenarioActivated',
        scenarioId: value.scenarioId.trim(),
        at: value.at,
      };
    case 'QuestionAnswered':
      if (
        typeof value.questionId !== 'string' ||
        value.questionId.trim().length === 0 ||
        typeof value.answerId !== 'string' ||
        value.answerId.trim().length === 0
      ) {
        throw new Error('Invalid QuestionAnswered event.');
      }
      return {
        type: 'QuestionAnswered',
        questionId: value.questionId.trim(),
        answerId: value.answerId.trim(),
        at: value.at,
      };
    case 'QuestionOpened': {
      if (
        typeof value.questionId !== 'string' ||
        value.questionId.trim().length === 0
      ) {
        throw new Error('Invalid QuestionOpened event.');
      }
      const prompt =
        typeof value.prompt === 'string' && value.prompt.trim().length > 0
          ? value.prompt.trim()
          : undefined;
      return prompt === undefined
        ? {
            type: 'QuestionOpened',
            questionId: value.questionId.trim(),
            at: value.at,
          }
        : {
            type: 'QuestionOpened',
            questionId: value.questionId.trim(),
            prompt,
            at: value.at,
          };
    }
    default:
      throw new Error('Unsupported decision session event.');
  }
}

function sanitizeIntensityRecord(
  value: unknown,
): Readonly<Record<string, number>> | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid decision session intensities record.');
  }
  const entries = Object.entries(value).map(([priorityId, importance]) => {
    if (
      priorityId.trim().length === 0 ||
      typeof importance !== 'number' ||
      !Number.isFinite(importance) ||
      importance < 0 ||
      importance > 1
    ) {
      throw new Error('Invalid decision session intensities record.');
    }
    return [priorityId.trim(), importance] as const;
  });
  return Object.freeze(Object.fromEntries(entries));
}

export function sanitizeSerializedDecisionSession(
  raw: unknown,
  houseId: string,
): DurableSerializedDecisionSession {
  if (!isRecord(raw)) {
    throw new Error('Serialized decision session must be an object.');
  }
  if (raw.format !== DECISION_SESSION_FORMAT) {
    throw new Error('Unexpected decision session format.');
  }
  if (raw.schemaVersion !== DECISION_SESSION_SCHEMA_VERSION) {
    throw new Error('Unsupported decision session schema.');
  }
  if (typeof raw.objectId !== 'string' || raw.objectId.trim() !== houseId) {
    throw new Error('Decision session objectId must match houseId.');
  }
  if (!isRecord(raw.runtimeState)) {
    throw new Error('runtimeState is required.');
  }
  const activeRoomId = raw.runtimeState.activeRoomId;
  const variantId = raw.runtimeState.variantId;
  const scenarioId = raw.runtimeState.scenarioId;
  if (
    !(activeRoomId === null || typeof activeRoomId === 'string') ||
    !(variantId === null || typeof variantId === 'string') ||
    !(scenarioId === null || typeof scenarioId === 'string') ||
    typeof raw.runtimeState.version !== 'number' ||
    !Number.isFinite(raw.runtimeState.version) ||
    !Array.isArray(raw.runtimeState.priorityIds) ||
    raw.runtimeState.priorityIds.some(
      (id) => typeof id !== 'string' || id.trim().length === 0,
    )
  ) {
    throw new Error('runtimeState shape is invalid.');
  }
  if (!Array.isArray(raw.events)) {
    throw new Error('events must be a DecisionEvent array.');
  }
  if (
    typeof raw.createdAt !== 'number' ||
    !Number.isFinite(raw.createdAt) ||
    typeof raw.updatedAt !== 'number' ||
    !Number.isFinite(raw.updatedAt)
  ) {
    throw new Error('createdAt/updatedAt must be numbers.');
  }

  return {
    format: DECISION_SESSION_FORMAT,
    schemaVersion: DECISION_SESSION_SCHEMA_VERSION,
    objectId: houseId,
    runtimeState: {
      activeRoomId,
      priorityIds: raw.runtimeState.priorityIds.map((id) => (id as string).trim()),
      priorityIntensities: sanitizeIntensityRecord(
        raw.runtimeState.priorityIntensities,
      ),
      variantId,
      scenarioId,
      version: raw.runtimeState.version,
    },
    events: raw.events.map(sanitizeEvent),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toOperationalDecisionSnapshot(
  record: DurableDecisionSessionRecord,
): {
  readonly decisionSessionId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly priorityIds: readonly string[];
  readonly priorityIntensities: Readonly<Record<string, number>> | null;
  readonly activeRoomId: string | null;
  readonly events: readonly DurableDecisionEvent[];
} {
  return {
    decisionSessionId: record.decisionSessionId,
    companyId: record.companyId,
    projectId: record.projectId,
    houseId: record.houseId,
    priorityIds: record.serialized.runtimeState.priorityIds,
    priorityIntensities: record.serialized.runtimeState.priorityIntensities,
    activeRoomId: record.serialized.runtimeState.activeRoomId,
    events: record.serialized.events,
  };
}
