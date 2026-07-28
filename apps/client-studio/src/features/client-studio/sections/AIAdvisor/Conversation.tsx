import { useEffect, useRef } from 'react';

import { AI_CHAT_VEIL_CLEARANCE_PX } from './ai-advisor-layout';
import { MessageBubble } from './MessageBubble';
import type { Message } from './types';

type ConversationProps = {
  messages: Message[];
};

/**
 * Full thread, content-sized — section stretches so the latest Q+A is never
 * clipped (CAP UX 54). Welcome seed sits below the header veil (CAP UX 55).
 */
export function Conversation({ messages }: ConversationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }

    // Welcome-only: keep the greeting at the top of the thread.
    if (messages.length <= 1) {
      container.scrollTop = 0;
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col space-y-section overflow-x-hidden"
      style={{ paddingTop: AI_CHAT_VEIL_CLEARANCE_PX }}
      data-testid="ai-advisor-conversation"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          text={message.text}
          time={message.time}
        />
      ))}
    </div>
  );
}
