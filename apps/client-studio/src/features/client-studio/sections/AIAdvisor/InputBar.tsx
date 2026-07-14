import { useLayoutEffect, useRef } from 'react';

import { SendButton } from './SendButton';

type InputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function InputBar({ value, onChange, onSend }: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  const canSend = value.trim().length > 0;

  return (
    <div className="mt-4 flex items-end border border-embed-border-default">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        placeholder="Zadejte svůj dotaz"
        onChange={(event) => onChange(event.target.value)}
        className="max-h-40 min-h-[48px] flex-1 resize-none bg-embed-background-primary px-4 py-3 text-sm text-embed-foreground-primary placeholder:text-embed-foreground-muted"
      />
      <SendButton disabled={!canSend} onClick={onSend} />
    </div>
  );
}
