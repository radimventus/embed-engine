import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Input } from '@embed-engine/ui';

import {
  COMMERCIAL_CONSENT_TEXT_CS,
  COMMERCIAL_CONTACT_METHODS,
  findCommercialCta,
  type CommercialCtaId,
  type ContactMethodId,
} from '../../pilot/commercialConversion';
import { PILOT_FLAGS, PILOT_LEAD_MAILTO } from '../../pilot/pilotVocabulary';
import {
  AUDIT_ACCENT,
  AUDIT_FORM_MAX_WIDTH_CLASS,
  AUDIT_INPUT_CLASS,
  AUDIT_INPUT_HEIGHT_PX,
  AUDIT_INPUT_STYLE,
  AUDIT_MUTED,
  AUDIT_ON_ACCENT,
  AUDIT_WHITE,
} from './audit-panel';
import {
  formatSnapshotForMailto,
  type ConversionRuntimeSnapshot,
} from './ConversionContextStrip';
import { LockIcon, UserIcon } from './AuditIcons';
import { SuccessState } from './SuccessState';
import { useOptionalDecisionAnalytics } from '../../analytics/DecisionAnalyticsProvider';

type LeadPhase = 'idle' | 'loading' | 'success' | 'error';

type ConversionLeadFormProps = {
  readonly ctaId: CommercialCtaId;
  readonly snapshot: ConversionRuntimeSnapshot;
};

/**
 * Lead form — presentation + mailto transport only (CSCB-07).
 * No CRM routing, scoring, or Runtime mutation.
 */
export function ConversionLeadForm({ ctaId, snapshot }: ConversionLeadFormProps) {
  const cta = findCommercialCta(ctaId);
  const analytics = useOptionalDecisionAnalytics();
  const [phase, setPhase] = useState<LeadPhase>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethodId>('email');
  const [consent, setConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (cta === null) {
      setPhase('error');
      setErrorMessage('Vyberte akci pokračování.');
      return;
    }

    if (PILOT_FLAGS.leadCaptureMode !== 'mailto') {
      setPhase('error');
      setErrorMessage(
        'Odesílání poptávek zatím není aktivní. Použijte kontakt níže.',
      );
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail) {
      setPhase('error');
      setErrorMessage('Vyplňte jméno a e-mail.');
      return;
    }

    if (!consent) {
      setPhase('error');
      setErrorMessage('Pro odeslání je potřeba souhlas se zpracováním údajů.');
      return;
    }

    setPhase('loading');

    const methodLabel =
      COMMERCIAL_CONTACT_METHODS.find((method) => method.id === contactMethod)
        ?.labelCs ?? contactMethod;

    const subject = encodeURIComponent(cta.mailtoSubject);
    const body = encodeURIComponent(
      [
        `Akce: ${cta.labelCs} (${cta.id})`,
        `Jméno: ${trimmedName}`,
        `E-mail: ${trimmedEmail}`,
        phone.trim() ? `Telefon: ${phone.trim()}` : null,
        `Preferovaný kontakt: ${methodLabel}`,
        message.trim() ? `Zpráva: ${message.trim()}` : null,
        `Souhlas: ano`,
        '',
        formatSnapshotForMailto(snapshot),
        '',
        'Zdroj: Client Studio — Commercial Conversion',
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
    );

    try {
      window.location.href = `mailto:${PILOT_LEAD_MAILTO}?subject=${subject}&body=${body}`;
      window.setTimeout(() => {
        analytics?.conversionCompleted(cta.id);
        setPhase('success');
      }, 400);
    } catch {
      setPhase('error');
      setErrorMessage(
        `Nepodařilo se otevřít e-mail. Napište nám na ${PILOT_LEAD_MAILTO}.`,
      );
    }
  };

  if (cta === null) {
    return null;
  }

  return (
    <div
      className={`${AUDIT_FORM_MAX_WIDTH_CLASS} px-section`}
      data-testid="conversion-lead-form"
      data-cta-id={cta.id}
    >
      <h2 className="text-center text-base font-semibold tracking-wide">
        <span style={{ color: AUDIT_ACCENT }}>2. </span>
        <span style={{ color: AUDIT_WHITE }}>{cta.labelCs}</span>
      </h2>

      <p
        className="mx-auto mt-3 max-w-xl text-center text-sm leading-snug"
        style={{ color: AUDIT_MUTED }}
      >
        {cta.descriptionCs} Poptávku otevřete ve svém e-mailu — odeslání potvrďte
        tam.
      </p>

      {phase === 'success' ? (
        <div className="mt-5">
          <SuccessState nextStep={cta.successNextStepCs} />
        </div>
      ) : (
        <form
          className="mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="conversion-contact-name">
            Jméno a příjmení
          </label>
          <Input
            id="conversion-contact-name"
            type="text"
            required
            value={name}
            placeholder="Jméno a příjmení"
            disabled={phase === 'loading'}
            className={AUDIT_INPUT_CLASS}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setName(event.target.value)
            }
          />

          <label className="sr-only" htmlFor="conversion-contact-email">
            E-mail
          </label>
          <Input
            id="conversion-contact-email"
            type="email"
            required
            value={email}
            placeholder="E-mail"
            disabled={phase === 'loading'}
            className={AUDIT_INPUT_CLASS}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
          />

          <label className="sr-only" htmlFor="conversion-contact-phone">
            Telefon (volitelné)
          </label>
          <Input
            id="conversion-contact-phone"
            type="tel"
            value={phone}
            placeholder="Telefon (volitelné)"
            disabled={phase === 'loading'}
            className={AUDIT_INPUT_CLASS}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setPhone(event.target.value)
            }
          />

          <label className="sr-only" htmlFor="conversion-contact-method">
            Preferovaný kontakt
          </label>
          <select
            id="conversion-contact-method"
            value={contactMethod}
            disabled={phase === 'loading'}
            className={`${AUDIT_INPUT_CLASS} rounded-[8px] px-3 text-sm`}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setContactMethod(event.target.value as ContactMethodId)
            }
          >
            {COMMERCIAL_CONTACT_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.labelCs}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="conversion-contact-message">
            Zpráva (volitelné)
          </label>
          <textarea
            id="conversion-contact-message"
            value={message}
            placeholder="Zpráva (volitelné)"
            disabled={phase === 'loading'}
            rows={3}
            className="col-span-2 rounded-[8px] border px-3 py-3 text-sm mobile:col-span-1"
            style={AUDIT_INPUT_STYLE}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setMessage(event.target.value)
            }
          />

          <label
            className="col-span-2 flex items-start gap-3 text-left text-xs leading-snug mobile:col-span-1"
            style={{ color: AUDIT_MUTED }}
          >
            <input
              type="checkbox"
              checked={consent}
              disabled={phase === 'loading'}
              className="mt-0.5 h-4 w-4 shrink-0"
              data-testid="conversion-consent"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setConsent(event.target.checked)
              }
            />
            <span>{COMMERCIAL_CONSENT_TEXT_CS}</span>
          </label>

          <button
            type="submit"
            disabled={phase === 'loading'}
            data-testid="conversion-submit"
            className="col-span-2 flex w-full items-center justify-center rounded-[8px] px-4 text-center text-sm font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001930] disabled:opacity-60 mobile:col-span-1"
            style={{
              height: AUDIT_INPUT_HEIGHT_PX,
              backgroundColor: AUDIT_ACCENT,
              color: AUDIT_ON_ACCENT,
            }}
          >
            {phase === 'loading' ? 'Otevírám e-mail…' : 'ODESLAT POPTÁVKU →'}
          </button>
        </form>
      )}

      {phase === 'error' && errorMessage ? (
        <p
          className="mt-3 text-center text-sm"
          style={{ color: AUDIT_ACCENT }}
          role="alert"
          data-testid="lead-capture-error"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-6 mobile:grid-cols-1">
        <div className="flex gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: AUDIT_ACCENT }}
          >
            <LockIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: AUDIT_WHITE }}>
              Vaše údaje jsou v bezpečí.
            </p>
            <p className="mt-1 text-xs leading-snug" style={{ color: AUDIT_MUTED }}>
              Informace použijeme pouze pro vyřízení poptávky.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: AUDIT_ACCENT }}
          >
            <UserIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: AUDIT_WHITE }}>
              Nezávazný další krok.
            </p>
            <p className="mt-1 text-xs leading-snug" style={{ color: AUDIT_MUTED }}>
              Rozhodnutí zůstává na vás. Runtime doporučení neměníme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
