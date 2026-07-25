import { MOTION_DURATION_CLASS } from '../../chapter-layout';
import { primaryButtonClass } from '@embed-engine/ui';

export const DECISION_GRID_COLUMN_SIZE_PX = 121;
export const DECISION_SURFACE_WIDTH_PX = 685;
export const DECISION_CARD_SIZE_PX = 119;
/** Gap between priority cards (~22 px optical). */
export const DECISION_GRID_GAP_PX = 22;
/** Two card rows + one gap — Decision Terminal matches this height. */
export const DECISION_SURFACE_HEIGHT_PX =
  DECISION_CARD_SIZE_PX * 2 + DECISION_GRID_GAP_PX;
export const DECISION_CARD_ACTIVE_SCALE = 1.12;
export const DECISION_TRANSITION_MS = 200;

export const DECISION_TRANSITION_CLASS = MOTION_DURATION_CLASS;

export const DECISION_CARD_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2';

/** Default card — 1 px gold border. */
export const DECISION_CARD_IDLE_CLASS =
  'border border-[#D4AF37] bg-[#F4F3F1] shadow-none';

export const DECISION_CARD_HOVER_CLASS =
  'hover:cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_4px_14px_rgba(0,25,48,0.06)]';

/** Open / selected card — 2 px gold border. */
export const DECISION_CARD_ACTIVE_CLASS =
  'z-10 scale-[1.12] border-2 border-[#D4AF37] shadow-[0_8px_24px_rgba(0,25,48,0.08)]';

/** PT-002 — primary Decision Story priority (Runtime-driven highlight). */
export const DECISION_CARD_PRIMARY_CLASS =
  'ring-2 ring-embed-brand-gold ring-offset-2 ring-offset-[#F4F3F1]';

/** PT-002 — related content for primary priority. */
export const DECISION_CARD_RELATED_CLASS =
  'ring-1 ring-embed-brand-gold/40 ring-offset-1 ring-offset-[#F4F3F1]';

export const DECISION_CTA_ENABLED_CLASS = primaryButtonClass({ size: 'md' });

export const DECISION_CTA_DISABLED_CLASS = primaryButtonClass({ size: 'md', state: 'disabled' });

export const DECISION_CTA_FOCUS_CLASS = DECISION_CARD_FOCUS_CLASS;
