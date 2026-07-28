import { palette } from '@embed-engine/design-tokens';

type SendButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};

/**
 * Chat send — navy fill, gold hover, no border (CAP UX 52/53).
 */
export function SendButton({ disabled = false, onClick }: SendButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-[50px] shrink-0 items-center justify-center px-6 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
      style={{
        backgroundColor: palette.navy,
        color: palette.pureWhite,
        borderStyle: 'none',
        borderWidth: 0,
        borderRadius: 8,
        transition: 'background-color 125ms ease-out, color 125ms ease-out',
      }}
      onMouseEnter={(event) => {
        if (disabled) {
          return;
        }
        event.currentTarget.style.backgroundColor = palette.gold;
        event.currentTarget.style.color = palette.navy;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = palette.navy;
        event.currentTarget.style.color = palette.pureWhite;
      }}
    >
      Odeslat
    </button>
  );
}
