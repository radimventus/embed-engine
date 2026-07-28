import type { ReactNode } from 'react';

type JourneySceneFrameProps = {
  readonly sceneId: string;
  readonly state?: 'hidden' | 'revealing' | 'visible';
  readonly children: ReactNode;
};

/**
 * Meaning-based Decision Journey scene wrapper. No snap, no forced layout.
 */
export function JourneySceneFrame({
  sceneId,
  state = 'visible',
  children,
}: JourneySceneFrameProps) {
  if (state === 'hidden') {
    return null;
  }

  return (
    <div
      id={sceneId}
      data-journey-scene={sceneId}
      data-scene-state={state}
      className={`flex w-full flex-col transition-all duration-500 ease-in-out ${
        state === 'revealing'
          ? 'translate-y-[24px] opacity-0'
          : 'translate-y-0 opacity-100'
      }`}
    >
      {children}
    </div>
  );
}
