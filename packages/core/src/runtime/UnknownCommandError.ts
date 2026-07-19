export class UnknownCommandError extends Error {
  constructor(commandType: string) {
    super(`No handler registered for command "${commandType}"`);
    this.name = "UnknownCommandError";
  }
}
