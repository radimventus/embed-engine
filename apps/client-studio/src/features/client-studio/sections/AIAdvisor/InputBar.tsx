import { colors, palette } from '@embed-engine/design-tokens';

import { AI_ADVISOR_INPUT_GAP_CLASS, FAQ_ACCORDION_LIST_WIDTH_CLASS } from './ai-advisor-layout';
import { SendButton } from './SendButton';

type InputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

/**
 * Light field: goldIntense border only; placeholder vertically centered (CAP UX 53).
 * Row width matches FAQ (680px). Height stays 50px.
 */
export function InputBar({ value, onChange, onSend, disabled = false }: InputBarProps) {
  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className={`${AI_ADVISOR_INPUT_GAP_CLASS} ${FAQ_ACCORDION_LIST_WIDTH_CLASS} flex items-stretch gap-3`}>
      <div
        className="flex h-[50px] min-w-0 flex-1 items-center overflow-hidden rounded-[8px] bg-transparent px-section"
        style={{
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: colors.action.accent,
        }}
      >
        <input
          type="text"
          value={value}
          placeholder="Zadejte svůj dotaz"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && canSend) {
              event.preventDefault();
              onSend();
            }
          }}
          className="h-full w-full min-w-0 bg-transparent text-sm shadow-none outline-none placeholder:text-embed-foreground-primary/40"
          style={{
            borderStyle: 'none',
            borderWidth: 0,
            borderRadius: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            outline: 'none',
            color: palette.navy,
            lineHeight: '50px',
            padding: 0,
            margin: 0,
          }}
        />
      </div>
      <SendButton disabled={!canSend} onClick={onSend} />
    </div>
  );
}
