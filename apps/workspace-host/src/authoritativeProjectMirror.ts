type AuthoritativeProjectSession = {
  readonly projectId: string | null;
  readonly activeHouseId: string | null;
};

type RestoreAuthoritativeProjectMirrorInput<TSession extends AuthoritativeProjectSession> = {
  readonly requestedProjectId: string;
  readonly restoreSession: () => Promise<TSession | null>;
  readonly saveSession: (session: TSession) => void;
  readonly mirrorSession: (session: TSession) => void;
};

/**
 * Refresh the Host runtime after an embedded Studio has already completed the
 * authoritative server mutation. The message is only a refresh request; the
 * freshly restored server session remains the authority for the mirrored ID.
 */
export async function restoreAuthoritativeProjectMirror<
  TSession extends AuthoritativeProjectSession,
>({
  requestedProjectId,
  restoreSession,
  saveSession,
  mirrorSession,
}: RestoreAuthoritativeProjectMirrorInput<TSession>): Promise<boolean> {
  const restored = await restoreSession();
  if (restored?.projectId !== requestedProjectId) return false;

  saveSession(restored);
  mirrorSession(restored);
  return true;
}
