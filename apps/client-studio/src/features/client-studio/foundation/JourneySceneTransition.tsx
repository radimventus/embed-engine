import { scrollToSection } from './scrollToSection';

type JourneySceneTransitionProps = {
  readonly previousSceneId?: string;
  readonly nextSceneId?: string;
  readonly onPrevious?: () => void;
  readonly onNext?: () => void;
  readonly compact?: boolean;
};

const NAV_BUTTON_CLASS =
  'inline-flex h-[48px] w-[180px] items-center justify-center rounded-[8px] bg-[#001930] px-5 text-base font-medium text-[#FFFFFF] transition-colors duration-150 hover:bg-[#083154] active:bg-[#00101f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';

/**
 * Navigation lives only in the large semantic gaps between scenes.
 */
export function JourneySceneTransition({
  previousSceneId,
  nextSceneId,
  onPrevious,
  onNext,
  compact = false,
}: JourneySceneTransitionProps) {
  return (
    <div className={`flex items-center px-section ${compact ? 'h-[90px]' : 'h-[180px]'}`}>
      <div className="grid w-full grid-cols-2 items-center gap-4 mobile:grid-cols-1">
        <div className="justify-self-start mobile:justify-self-stretch">
          {previousSceneId ? (
            <button
              type="button"
              onClick={() => {
                onPrevious?.();
                if (!onPrevious) {
                  scrollToSection(previousSceneId);
                }
              }}
              className={NAV_BUTTON_CLASS}
            >
              ↑ Zpět
            </button>
          ) : (
            <span aria-hidden="true" className="block h-[48px] w-[180px] opacity-0" />
          )}
        </div>
        <div className="justify-self-end mobile:justify-self-stretch">
          {nextSceneId ? (
            <button
              type="button"
              onClick={() => {
                onNext?.();
                if (!onNext) {
                  scrollToSection(nextSceneId);
                }
              }}
              className={NAV_BUTTON_CLASS}
            >
              Pokračovat ↓
            </button>
          ) : (
            <span aria-hidden="true" className="block h-[48px] w-[180px] opacity-0" />
          )}
        </div>
      </div>
    </div>
  );
}
