import {
  EXPERIENCE_STUDIO_EMAIL,
  EXPERIENCE_STUDIO_PHONE,
} from './experienceContact';
import { ExperienceHeaderModal } from './ExperienceHeaderModal';

type CallModalProps = {
  readonly onClose: () => void;
};

/** HDR-03 — Zavolat: phone + email only. */
export function CallModal({ onClose }: CallModalProps) {
  return (
    <ExperienceHeaderModal title="Kontakt" onClose={onClose}>
      <div className="space-y-3 text-base text-embed-foreground-primary">
        <p>
          <span className="block text-sm text-embed-foreground-primary/60">
            Telefon
          </span>
          <a
            href={`tel:${EXPERIENCE_STUDIO_PHONE.replace(/\s/g, '')}`}
            className="text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
          >
            {EXPERIENCE_STUDIO_PHONE}
          </a>
        </p>
        <p>
          <span className="block text-sm text-embed-foreground-primary/60">
            E-mail
          </span>
          <a
            href={`mailto:${EXPERIENCE_STUDIO_EMAIL}`}
            className="text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
          >
            {EXPERIENCE_STUDIO_EMAIL}
          </a>
        </p>
      </div>
    </ExperienceHeaderModal>
  );
}
