import { ChatBubble } from '@embed-engine/ui';

type MessageBubbleProps = {
  role: 'user' | 'assistant';
  text: string;
  time: string;
};

export function MessageBubble({ role, text, time }: MessageBubbleProps) {
  return (
    <ChatBubble role={role} time={time}>
      <span className="whitespace-pre-line">{text}</span>
    </ChatBubble>
  );
}
