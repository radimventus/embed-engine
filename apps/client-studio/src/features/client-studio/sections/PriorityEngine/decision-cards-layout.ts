import { MOTION_DURATION_CLASS } from '../../chapter-layout';
import { primaryButtonClass } from '@embed-engine/ui';

export const DECISION_GRID_COLUMN_SIZE_PX = 121;
export const DECISION_SURFACE_WIDTH_PX = 685;
export const DECISION_SURFACE_HEIGHT_PX = 264;
export const DECISION_CARD_SIZE_PX = 119;
export const DECISION_GRID_GAP_PX = 20;
export const DECISION_CARD_ACTIVE_SCALE = 1.12;
export const DECISION_TRANSITION_MS = 200;

export const DECISION_TRANSITION_CLASS = MOTION_DURATION_CLASS;

export const DECISION_CARD_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';

export const DECISION_CARD_IDLE_CLASS =
  'border-embed-border-default bg-[#F4F3F1] shadow-none';

export const DECISION_CARD_HOVER_CLASS =
  'hover:cursor-pointer hover:border-embed-border-strong hover:shadow-[0_4px_14px_rgba(0,30,58,0.06)]';

export const DECISION_CARD_ACTIVE_CLASS =
  'z-10 scale-[1.12] border-[#D4AF37] shadow-[0_8px_24px_rgba(0,30,58,0.08)]';

export const DECISION_CTA_ENABLED_CLASS = primaryButtonClass({ size: 'md' });

export const DECISION_CTA_DISABLED_CLASS = primaryButtonClass({ size: 'md', state: 'disabled' });

export const DECISION_CTA_FOCUS_CLASS = DECISION_CARD_FOCUS_CLASS;
