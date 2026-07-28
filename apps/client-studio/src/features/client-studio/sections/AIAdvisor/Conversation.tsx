import { useEffect, useRef } from 'react';

import { AI_CHAT_VEIL_CLEARANCE_PX } from './ai-advisor-layout';
import { MessageBubble } from './MessageBubble';
import type { Message } from './types';

type ConversationProps = {
  messages: Message[];
};

/**
 * Thread in the fixed FAQ-aligned chat band (reference width on 4173).
 * Internal scroll keeps bubble max-width stable; welcome seed clears the veil.
 */
export function Conversation({ messages }: ConversationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }

    if (messages.length <= 1) {
      container.scrollTop = 0;
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col space-y-section overflow-x-hidden overflow-y-auto"
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
