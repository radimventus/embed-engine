export class UnknownDecisionError extends Error {
  constructor(decisionId: string) {
    super(`No decision registered for id "${decisionId}"`);
    this.name = "UnknownDecisionError";
  }
}
