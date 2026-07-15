type SendButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};

export function SendButton({ disabled = false, onClick }: SendButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="bg-embed-brand-navy px-6 py-3 text-sm text-embed-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      Odeslat
    </button>
  );
}
