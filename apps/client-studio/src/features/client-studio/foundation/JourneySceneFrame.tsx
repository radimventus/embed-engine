import type { ReactNode } from 'react';

import { scrollToSection } from './scrollToSection';

type JourneySceneFrameProps = {
  readonly sceneId: string;
  readonly previousSceneId?: string;
  readonly nextSceneId?: string;
  readonly children: ReactNode;
};

const NAV_BUTTON_CLASS =
  'inline-flex min-h-[40px] items-center rounded-[8px] border border-[#E3E3E3] bg-[#FFFFFF] px-3.5 text-sm font-medium text-embed-foreground-primary transition-colors duration-150 hover:border-embed-brand-gold hover:bg-embed-brand-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';

const SCENE_MIN_HEIGHT_PX = 'calc(100vh - 72px)';

/**
 * Scene shell for one guided stop in the Decision Journey.
 * Keeps the page one-piece while adding snap + next/previous affordances.
 */
export function JourneySceneFrame({
  sceneId,
  previousSceneId,
  nextSceneId,
  children,
}: JourneySceneFrameProps) {
  return (
    <div
      data-journey-scene={sceneId}
      className="flex w-full snap-start snap-normal flex-col gap-[18px] pb-[30px]"
      style={{ minHeight: SCENE_MIN_HEIGHT_PX }}
    >
      {children}
      <div className="mt-auto flex items-center justify-between gap-3 px-section mobile:flex-col mobile:items-stretch">
        {previousSceneId ? (
          <button
            type="button"
            onClick={() => scrollToSection(previousSceneId)}
            className={NAV_BUTTON_CLASS}
          >
            ← Předchozí
          </button>
        ) : (
          <span aria-hidden="true" className="hidden min-h-[40px] desktop:block" />
        )}
        {nextSceneId ? (
          <button
            type="button"
            onClick={() => scrollToSection(nextSceneId)}
            className={`${NAV_BUTTON_CLASS} ml-auto mobile:ml-0`}
          >
            Další →
          </button>
        ) : null}
      </div>
    </div>
  );
}
