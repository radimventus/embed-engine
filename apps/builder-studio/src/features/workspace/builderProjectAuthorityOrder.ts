export type BuilderProjectTransitionResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly stage: 'project' | 'host' };

/** Project authority must be visible in Host before any House synchronization. */
export async function runBuilderProjectAuthorityOrder<T>(input: {
  readonly switchProject: () => Promise<boolean>;
  readonly applyProjectProjection: () => void;
  readonly confirmHostProject: () => Promise<boolean>;
  readonly synchronizeHouse: () => Promise<T>;
}): Promise<BuilderProjectTransitionResult<T>> {
  if (!(await input.switchProject())) return { ok: false, stage: 'project' };
  input.applyProjectProjection();
  if (!(await input.confirmHostProject())) return { ok: false, stage: 'host' };
  return { ok: true, value: await input.synchronizeHouse() };
}
