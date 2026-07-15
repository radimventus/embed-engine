type MessageBubbleProps = {
  role: 'user' | 'assistant';
  text: string;
  time: string;
};

export function MessageBubble({ role, text, time }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
      <div
        className={
          isUser
            ? 'max-w-[85%] bg-embed-status-info/25 px-4 py-3 text-sm text-embed-foreground-primary'
            : 'max-w-[85%] border border-embed-border-default bg-embed-background-primary px-4 py-3 text-sm text-embed-foreground-primary'
        }
      >
        {text}
      </div>
      <span className="mt-1 text-xs text-embed-foreground-muted">{time}</span>
    </div>
  );
}
