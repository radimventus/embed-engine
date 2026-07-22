import { AUDIT_ACCENT, AUDIT_MUTED, AUDIT_WHITE } from './audit-panel';
import { PILOT_LEAD_MAILTO } from '../../pilot/pilotVocabulary';

type SuccessStateProps = {
  readonly nextStep?: string;
};

export function SuccessState({ nextStep }: SuccessStateProps) {
  return (
    <div
      className="rounded-[8px] border px-6 py-8 text-center"
      style={{ borderColor: `${AUDIT_ACCENT}66` }}
      data-testid="lead-capture-success"
    >
      <p className="text-xl font-semibold" style={{ color: AUDIT_WHITE }}>
        E-mail je připraven.
      </p>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: AUDIT_MUTED }}>
        Dokončete odeslání ve svém e-mailovém klientovi. Pokud se neotevřel, napište
        na {PILOT_LEAD_MAILTO}.
      </p>
      {nextStep ? (
        <p className="mt-4 text-sm font-medium" style={{ color: AUDIT_ACCENT }}>
          Další krok: {nextStep}
        </p>
      ) : null}
    </div>
  );
}
