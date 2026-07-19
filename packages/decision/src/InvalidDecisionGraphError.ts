export class InvalidDecisionGraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDecisionGraphError";
  }
}
