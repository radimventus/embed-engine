export type DecisionSessionScope = {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
};

export type DecisionSessionPointerStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function decisionSessionPointerKey(scope: DecisionSessionScope): string {
  return `conis.decisionSessionId:${scope.companyId}:${scope.projectId}:${scope.houseId}`;
}

export function readDecisionSessionPointer(
  scope: DecisionSessionScope,
  store: DecisionSessionPointerStore | null = defaultPointerStore(),
): string | null {
  if (store === null) {
    return null;
  }
  const value = store.getItem(decisionSessionPointerKey(scope));
  return value !== null && value.trim().length > 0 ? value.trim() : null;
}

export function writeDecisionSessionPointer(
  scope: DecisionSessionScope,
  decisionSessionId: string,
  store: DecisionSessionPointerStore | null = defaultPointerStore(),
): void {
  if (store === null) {
    return;
  }
  store.setItem(decisionSessionPointerKey(scope), decisionSessionId);
}

function defaultPointerStore(): DecisionSessionPointerStore | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  return sessionStorage;
}
