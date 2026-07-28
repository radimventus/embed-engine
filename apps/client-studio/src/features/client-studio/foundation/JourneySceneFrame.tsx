import type { ReactNode } from 'react';

import { scrollToSection } from './scrollToSection';

type JourneySceneFrameProps = {
  readonly sceneId: string;
  readonly previousSceneId?: string;
  readonly nextSceneId?: string;
  readonly onNavigate?: (sceneId: string) => void;
  readonly children: ReactNode;
};

const PRIMARY_NAV_BUTTON_CLASS =
  'inline-flex min-h-[48px] items-center justify-center rounded-[8px] bg-[#001930] px-6 text-base font-medium text-[#FFFFFF] transition-colors duration-150 hover:bg-embed-brand-gold hover:text-[#001930] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';
const SECONDARY_NAV_BUTTON_CLASS =
  'inline-flex min-h-[40px] items-center text-sm text-embed-foreground-primary/65 transition-colors duration-150 hover:text-embed-foreground-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';

const SCENE_MIN_HEIGHT_PX = 'calc(100vh - 72px)';

/**
 * Scene shell for one guided stop in the Decision Journey.
 * Keeps the page one-piece while adding snap + next/previous affordances.
 */
export function JourneySceneFrame({
  sceneId,
  previousSceneId,
  nextSceneId,
  onNavigate,
  children,
}: JourneySceneFrameProps) {
  const navigate = (targetSceneId: string) => {
    onNavigate?.(targetSceneId);
    scrollToSection(targetSceneId);
  };

  return (
    <div
      id={sceneId}
      data-journey-scene={sceneId}
      className="flex w-full snap-start snap-normal flex-col gap-[18px] pb-[30px]"
      style={{ minHeight: SCENE_MIN_HEIGHT_PX }}
    >
      {children}
      <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-section mobile:grid-cols-1">
        {previousSceneId ? (
          <button
            type="button"
            onClick={() => navigate(previousSceneId)}
            className={`${SECONDARY_NAV_BUTTON_CLASS} justify-self-start mobile:justify-self-stretch`}
          >
            ← Zpět
          </button>
        ) : (
          <span aria-hidden="true" className="hidden min-h-[40px] desktop:block" />
        )}
        {nextSceneId ? (
          <button
            type="button"
            onClick={() => navigate(nextSceneId)}
            className={`${PRIMARY_NAV_BUTTON_CLASS} justify-self-center mobile:justify-self-stretch`}
          >
            Pokračovat →
          </button>
        ) : null}
        {nextSceneId ? (
          <span aria-hidden="true" className="hidden min-h-[48px] desktop:block" />
        ) : null}
      </div>
    </div>
  );
}
