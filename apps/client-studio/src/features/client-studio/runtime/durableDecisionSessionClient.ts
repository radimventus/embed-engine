import { platformApiOrigin } from '@embed-engine/platform-access';
import type { SerializedDecisionSession } from '@embed-engine/runtime';

import type { DecisionSessionScope } from './decisionSessionPointer';

export type PublicDecisionSessionRecord = {
  readonly decisionSessionId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly serialized: SerializedDecisionSession;
};

function endpoint(): string {
  return `${platformApiOrigin().replace(/\/$/, '')}/public/decision-sessions`;
}

export async function persistPublicDecisionSession(input: {
  readonly decisionSessionId: string;
  readonly scope: DecisionSessionScope;
  readonly serialized: SerializedDecisionSession;
  readonly signal?: AbortSignal;
}): Promise<boolean> {
  try {
    const response = await fetch(endpoint(), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        decisionSessionId: input.decisionSessionId,
        companyId: input.scope.companyId,
        projectId: input.scope.projectId,
        houseId: input.scope.houseId,
        serialized: input.serialized,
      }),
      signal: input.signal,
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function restorePublicDecisionSession(input: {
  readonly decisionSessionId: string;
  readonly scope: DecisionSessionScope;
  readonly signal?: AbortSignal;
}): Promise<PublicDecisionSessionRecord | null> {
  const params = new URLSearchParams({
    decisionSessionId: input.decisionSessionId,
    companyId: input.scope.companyId,
    projectId: input.scope.projectId,
    houseId: input.scope.houseId,
  });
  try {
    const response = await fetch(`${endpoint()}?${params}`, {
      signal: input.signal,
    });
    if (!response.ok) {
      return null;
    }
    const body = (await response.json()) as Partial<PublicDecisionSessionRecord>;
    if (
      body.decisionSessionId !== input.decisionSessionId ||
      body.companyId !== input.scope.companyId ||
      body.projectId !== input.scope.projectId ||
      body.houseId !== input.scope.houseId ||
      body.serialized === undefined
    ) {
      return null;
    }
    return body as PublicDecisionSessionRecord;
  } catch {
    return null;
  }
}

export function isDurableDecisionCommand(
  type: string,
): type is 'SelectRoom' | 'ChangePriority' | 'AnswerQuestion' | 'OpenQuestion' {
  return (
    type === 'SelectRoom' ||
    type === 'ChangePriority' ||
    type === 'AnswerQuestion' ||
    type === 'OpenQuestion'
  );
}
