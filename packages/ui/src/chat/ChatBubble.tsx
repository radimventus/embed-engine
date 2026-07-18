import type { CSSProperties, ReactNode } from 'react';
import { colors } from '@embed-engine/design-tokens';

import { chatBubbleClass, type ChatBubbleRole } from './chat-bubble-styles';

type ChatBubbleProps = {
  role: ChatBubbleRole;
  children: ReactNode;
  time?: string;
  className?: string;
};

const ROLE_FILL: Record<ChatBubbleRole, CSSProperties> = {
  /** Client query — light gray */
  user: { backgroundColor: colors.surface.card },
  /** AI reply — dark gray */
  assistant: { backgroundColor: colors.surface.interactive },
};

export function ChatBubble({ role, children, time, className }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
      <div className={chatBubbleClass(role, className)} style={ROLE_FILL[role]}>
        {children}
      </div>
      {time ? (
        <span className="mt-1 text-xs text-embed-foreground-primary/40">{time}</span>
      ) : null}
    </div>
  );
}

export type { ChatBubbleRole };
export { chatBubbleClass };
