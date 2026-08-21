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

/** Removes `invite` from a location href while preserving path, hash, and other params. */
export function urlWithoutInviteParam(href: string): string {
  const url = new URL(href);
  url.searchParams.delete('invite');
  return `${url.pathname}${url.search}${url.hash}`;
}
