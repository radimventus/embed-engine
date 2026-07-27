import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { CloseButton } from '@embed-engine/ui';

type ExperienceHeaderModalProps = {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
};

/**
 * Lightweight presentation modal for Experience header actions.
 * No Runtime / Decision Flow coupling.
 */
export function ExperienceHeaderModal({
  title,
  onClose,
  children,
}: ExperienceHeaderModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-embed-background-primary/70 px-section"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-card border border-embed-border-default bg-embed-background-primary p-section shadow-embed-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <CloseButton
          aria-label="Zavřít"
          className="absolute right-3 top-3"
          onClick={onClose}
        />
        <div className="mb-section pr-12">
          <h2 className="text-lg font-medium text-embed-foreground-primary">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
}
