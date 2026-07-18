import { PrimaryButton } from '@embed-engine/ui';

type SendButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};

export function SendButton({ disabled = false, onClick }: SendButtonProps) {
  return (
    <PrimaryButton
      disabled={disabled}
      onClick={onClick}
      size="sm"
      className="h-[50px] shrink-0 border-0 px-6 py-0 shadow-none"
    >
      Odeslat
    </PrimaryButton>
  );
}
