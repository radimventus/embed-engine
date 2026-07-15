import { useEffect, useRef } from 'react';

import { MessageBubble } from './MessageBubble';
import type { Message } from './types';

type ConversationProps = {
  messages: Message[];
};

export function Conversation({ messages }: ConversationProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="mt-section flex h-full min-h-ai-conversation max-h-ai-conversation flex-col space-y-section overflow-y-auto">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          text={message.text}
          time={message.time}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
