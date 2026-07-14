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
    <div className="mt-4 max-h-[320px] space-y-4 overflow-y-auto md:max-h-[360px]">
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
