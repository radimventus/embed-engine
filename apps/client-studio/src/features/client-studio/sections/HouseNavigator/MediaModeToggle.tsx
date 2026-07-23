import { useWalkthrough } from '../../../walkthrough';
import type { MediaMode } from '@embed-engine/contracts';

const OPTIONS: readonly { value: MediaMode; label: string }[] = [
  { value: 'video', label: 'VIDEO' },
  { value: 'photo', label: 'FOTKY' },
];

/**
 * VIDEO / FOTKY — visual language aligned with room menu (PT-TOUR-REDESIGN-01).
 * Default: white surface + navy text. Hover: navy fill + white text.
 * Active: beige surface (same as active room row).
 */
export function MediaModeToggle() {
  const { mediaMode, setMediaMode } = useWalkthrough();

  return (
    <div
      aria-label="Režim média"
      className="inline-flex w-full min-w-0 shrink-0 gap-0.5 rounded-[8px] border border-embed-border-default bg-white p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = option.value === mediaMode;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            className={`flex-1 rounded-[6px] py-2 text-xs font-medium tracking-wide transition-colors duration-[125ms] ease-out touch-manipulation ${
              active
                ? 'bg-[#E8E5E0] font-semibold text-[#001930]'
                : 'bg-white font-normal text-[#001930] hover:bg-[#001930] hover:text-[#FFFFFF]'
            }`}
            onClick={() => setMediaMode(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
