import { cn } from '../lib/cn';

export type ChatBubbleRole = 'user' | 'assistant';

/** Fill colors applied via design-token styles in ChatBubble. */
const ROLE_CLASS: Record<ChatBubbleRole, string> = {
  user: 'rounded-[8px] border border-embed-border-default',
  assistant: 'rounded-[8px] border border-embed-border-default',
};

export function chatBubbleClass(role: ChatBubbleRole, className?: string): string {
  return cn(
    'max-w-[85%] px-4 py-3 text-sm text-embed-foreground-primary',
    ROLE_CLASS[role],
    className,
  );
}
