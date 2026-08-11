/**
 * A URL bearer token explicitly selects the activation route. This remains true
 * when a browser restores a previously authenticated Studio session.
 */
export function shouldPrioritizeInviteRoute(input: {
  readonly inviteToken: string;
  readonly hasRestoredSession: boolean;
}): boolean {
  void input.hasRestoredSession;
  return input.inviteToken.trim().length > 0;
}
