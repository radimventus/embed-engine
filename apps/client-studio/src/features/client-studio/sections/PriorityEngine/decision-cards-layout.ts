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

/** Default / latent card — page bg fill; Tour-switcher gray border (1 px). */
export const DECISION_CARD_IDLE_CLASS =
  'rounded-[8px] border border-solid border-[#E3E3E3] bg-[#F7F6F4] shadow-none';

/** CAP UX 54 — idle hover uses gold border (same family as active). */
export const DECISION_CARD_HOVER_CLASS =
  'hover:z-[5] hover:cursor-pointer hover:scale-[1.06] hover:border-2 hover:border-solid hover:border-[#D4AF37] hover:shadow-[0_8px_22px_rgba(0,25,48,0.14)]';

/** Idle attention nudge — paused while hovered or active (CAP UX 52). */
export const DECISION_CARD_ATTENTION_CLASS =
  'animate-priority-card-attention hover:[animation-play-state:paused]';

/** Open / selected card — page bg fill, 2 px gold border, rounded in both states. */
export const DECISION_CARD_ACTIVE_CLASS =
  'z-10 scale-[1.12] rounded-[8px] border-2 border-solid border-[#D4AF37] bg-[#F7F6F4] shadow-[0_8px_24px_rgba(0,25,48,0.08)]';

/** PT-002 — primary Decision Story priority (Runtime-driven highlight). */
export const DECISION_CARD_PRIMARY_CLASS =
  'ring-2 ring-embed-brand-gold ring-offset-2 ring-offset-[#F7F6F4]';

/** PT-002 — related content for primary priority. */
export const DECISION_CARD_RELATED_CLASS =
  'ring-1 ring-embed-brand-gold/40 ring-offset-1 ring-offset-[#F7F6F4]';

export const DECISION_CTA_ENABLED_CLASS = primaryButtonClass({ size: 'md' });

export const DECISION_CTA_DISABLED_CLASS = primaryButtonClass({ size: 'md', state: 'disabled' });

export const DECISION_CTA_FOCUS_CLASS = DECISION_CARD_FOCUS_CLASS;
