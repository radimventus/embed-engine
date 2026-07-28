import { useEffect, useState, type ReactNode } from 'react';

type JourneySceneFrameProps = {
  readonly sceneId: string;
  readonly previousSceneId?: string;
  readonly nextSceneId?: string;
  readonly onNavigate?: (sceneId: string) => void;
  readonly animateOnMount?: boolean;
  readonly reserveScrollSpace?: boolean;
  readonly children: ReactNode;
};

const PRIMARY_NAV_BUTTON_CLASS =
  'inline-flex min-h-[38px] items-center justify-center rounded-[8px] bg-[#001930] px-[19px] text-[13px] font-medium text-[#FFFFFF] transition-colors duration-150 hover:bg-embed-brand-gold hover:text-[#001930] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';
const SECONDARY_NAV_BUTTON_CLASS = PRIMARY_NAV_BUTTON_CLASS;

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
  animateOnMount = false,
  reserveScrollSpace = false,
  children,
}: JourneySceneFrameProps) {
  const [isEntered, setIsEntered] = useState(!animateOnMount);

  useEffect(() => {
    if (!animateOnMount) {
      setIsEntered(true);
      return;
    }
    const frameId = window.requestAnimationFrame(() => {
      setIsEntered(true);
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [animateOnMount]);

  const navigate = (targetSceneId: string) => {
    onNavigate?.(targetSceneId);
  };

  return (
    <div
      id={sceneId}
      data-journey-scene={sceneId}
      className="flex w-full snap-start snap-normal flex-col gap-[18px]"
      style={{
        minHeight: SCENE_MIN_HEIGHT_PX,
        // Last scene (Audit): Zpět sits under the footer, 40px above the bottom (CAP UX3 09).
        paddingBottom: reserveScrollSpace
          ? 'calc(100vh - 72px)'
          : nextSceneId
            ? '30px'
            : previousSceneId
              ? '40px'
              : '0px',
        opacity: isEntered ? 1 : 0,
        transform: 'translateY(0)',
        transition: animateOnMount
          ? 'opacity 1000ms ease'
          : undefined,
        willChange: animateOnMount ? 'opacity' : undefined,
      }}
    >
      {children}
      <div className="mt-auto flex items-center justify-between gap-3 px-section mobile:flex-col">
        {previousSceneId ? (
          <button
            type="button"
            onClick={() => navigate(previousSceneId)}
            className={`${SECONDARY_NAV_BUTTON_CLASS} justify-start mobile:w-full`}
          >
            ← Zpět
          </button>
        ) : (
          <span aria-hidden="true" className="hidden min-h-[32px] desktop:block" />
        )}
        {nextSceneId ? (
          <button
            type="button"
            onClick={() => navigate(nextSceneId)}
            className={`${PRIMARY_NAV_BUTTON_CLASS} ml-auto mobile:w-full`}
          >
            Pokračovat →
          </button>
        ) : null}
      </div>
    </div>
  );
}
