import { useWalkthrough } from '../../../walkthrough';
import type { MediaMode } from '@embed-engine/contracts';

const OPTIONS: readonly { value: MediaMode; label: string }[] = [
  { value: 'video', label: 'VIDEO' },
  { value: 'photo', label: 'FOTKY' },
];

/** Shared shell for VIDEO/FOTKY and floor selector (TOUR-09 / TOUR-12). */
export const TOUR_SEGMENTED_SHELL_CLASS =
  'inline-flex w-full min-w-0 shrink-0 gap-0.5 rounded-[8px] border border-embed-border-default bg-[#E3E3E3] p-0.5';

export function tourSegmentedButtonClass(active: boolean): string {
  return `flex-1 rounded-[6px] py-2 text-xs font-medium tracking-wide transition-colors duration-[125ms] ease-out touch-manipulation ${
    active
      ? 'bg-[#E8E5E0] font-semibold text-[#001930]'
      : 'bg-white font-normal text-[#001930] hover:bg-[#001930] hover:text-[#FFFFFF]'
  }`;
}

/**
 * VIDEO / FOTKY — visual language aligned with room menu (PT-TOUR-REDESIGN-01).
 * Shell: darker gray. Default segment: white. Hover: navy. Active: beige.
 */
export function MediaModeToggle() {
  const { mediaMode, setMediaMode } = useWalkthrough();

  return (
    <div aria-label="Režim média" className={TOUR_SEGMENTED_SHELL_CLASS}>
      {OPTIONS.map((option) => {
        const active = option.value === mediaMode;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            className={tourSegmentedButtonClass(active)}
            onClick={() => setMediaMode(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
