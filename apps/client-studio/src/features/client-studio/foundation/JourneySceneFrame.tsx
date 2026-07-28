import type { ReactNode } from 'react';

type JourneySceneFrameProps = {
  readonly sceneId: string;
  readonly children: ReactNode;
};

/**
 * Meaning-based Decision Journey scene wrapper. No snap, no forced layout.
 */
export function JourneySceneFrame({ sceneId, children }: JourneySceneFrameProps) {
  return (
    <div
      id={sceneId}
      data-journey-scene={sceneId}
      className="flex w-full flex-col"
    >
      {children}
    </div>
  );
}
