import { EXPERIENCE_ICONS } from '../../../assets/icons';

type HeaderTextActionProps = {
  readonly iconSrc: string;
  readonly label: string;
  readonly onClick: () => void;
};

/** HDR-02 — icon + text only, no button chrome. */
function HeaderTextAction({ iconSrc, label, onClick }: HeaderTextActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-transparent p-0 text-sm text-embed-foreground-primary transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-embed-action-primary"
    >
      <img
        src={iconSrc}
        alt=""
        width={18}
        height={18}
        className="h-[18px] w-[18px] shrink-0 object-contain"
        aria-hidden="true"
      />
      <span>{label}</span>
    </button>
  );
}

export function HeaderCallAction({ onClick }: { readonly onClick: () => void }) {
  return (
    <HeaderTextAction
      iconSrc={EXPERIENCE_ICONS.call}
      label="Zavolat"
      onClick={onClick}
    />
  );
}

export function HeaderPdfAction({ onClick }: { readonly onClick: () => void }) {
  return (
    <HeaderTextAction
      iconSrc={EXPERIENCE_ICONS.pdf}
      label="Poslat PDF"
      onClick={onClick}
    />
  );
}
