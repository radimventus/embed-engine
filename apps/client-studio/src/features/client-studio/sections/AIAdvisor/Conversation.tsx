import { useEffect, useRef } from 'react';

import { MessageBubble } from './MessageBubble';
import type { Message } from './types';

type ConversationProps = {
  messages: Message[];
};

export function Conversation({ messages }: ConversationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-1 flex-col space-y-section overflow-x-hidden overflow-y-auto"
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
