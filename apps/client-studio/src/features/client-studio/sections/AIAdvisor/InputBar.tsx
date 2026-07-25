import { colors } from '@embed-engine/design-tokens';
import { TextArea } from '@embed-engine/ui';

import { AI_ADVISOR_INPUT_GAP_CLASS, FAQ_ACCORDION_LIST_WIDTH_CLASS } from './ai-advisor-layout';
import { SendButton } from './SendButton';

type InputBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

/**
 * Light field: transparent fill, goldIntense border only.
 * Row width matches FAQ (680px). Height stays 50px.
 */
export function InputBar({ value, onChange, onSend, disabled = false }: InputBarProps) {
  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className={`${AI_ADVISOR_INPUT_GAP_CLASS} ${FAQ_ACCORDION_LIST_WIDTH_CLASS} flex items-stretch gap-3`}>
      <div
        className="flex h-[50px] min-w-0 flex-1 items-center overflow-hidden rounded-[8px] border bg-transparent px-section"
        style={{ borderColor: colors.action.accent }}
      >
        <TextArea
          rows={1}
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
          className="h-[50px] min-h-[50px] w-full min-w-0 resize-none border-0 bg-transparent px-0 py-0 leading-[50px]"
        />
      </div>
      <SendButton disabled={!canSend} onClick={onSend} />
    </div>
  );
}
