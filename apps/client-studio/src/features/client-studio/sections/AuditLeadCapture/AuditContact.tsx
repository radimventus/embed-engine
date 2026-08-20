import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Input } from '@embed-engine/ui';

import { useOptionalDecisionAnalytics } from '../../analytics';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import {
  AUDIT_ACCENT,
  AUDIT_CONTROL_RADIUS_PX,
  AUDIT_FORM_MAX_WIDTH_CLASS,
  AUDIT_INPUT_CLASS,
  AUDIT_INPUT_HEIGHT_PX,
  AUDIT_INPUT_STYLE,
  AUDIT_MUTED,
  AUDIT_ON_ACCENT,
  AUDIT_WHITE,
} from './audit-panel';
import { LockIcon, UserIcon } from './AuditIcons';
import { SuccessState } from './SuccessState';
import { submitDurableLead } from './durableLeadSubmission';

type LeadPhase = 'idle' | 'loading' | 'success' | 'error';

export const AUDIT_GDPR_GUIDANCE =
  'Pro odeslání poptávky potvrďte souhlas se zpracováním osobních údajů.';

/**
 * Lead Capture succeeds only after the Platform API durably accepts a lead.
 */
export function AuditContact() {
  const analytics = useOptionalDecisionAnalytics();
  const { analyticsScope, company, project } = useDecisionSessionRuntime();
  const [phase, setPhase] = useState<LeadPhase>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const contactOpenedRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  const trackContactOpened = () => {
    if (contactOpenedRef.current) {
      return;
    }
    contactOpenedRef.current = true;
    analytics?.conversionStarted('audit-contact-form');
  };

  const consentReady =
    gdprConsent && project?.privacyUrl !== undefined;
  const submitEnabled = consentReady && phase !== 'loading';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!gdprConsent) {
      return;
    }

    if (project?.privacyUrl === undefined || analyticsScope === null || company === null) {
      setPhase('error');
      setErrorMessage(
        'Pro tohoto partnera nejsou dostupné zásady soukromí. Poptávku nelze odeslat.',
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

    setPhase('loading');
    const idempotencyKey =
      idempotencyKeyRef.current ?? crypto.randomUUID();
    idempotencyKeyRef.current = idempotencyKey;

    try {
      await submitDurableLead({
        idempotencyKey,
        scope: {
          companyId: company.companyId,
          projectId: analyticsScope.projectId,
          houseId: analyticsScope.houseId,
          privacyUrl: project.privacyUrl,
        },
        contact: {
          name: trimmedName,
          email: trimmedEmail,
          phone: phone.trim() || null,
        },
        acceptedAt: new Date().toISOString(),
      });
      analytics?.conversionCompleted('audit-contact-form');
      idempotencyKeyRef.current = null;
      setPhase('success');
    } catch {
      setPhase('error');
      setErrorMessage(
        'Poptávku se nepodařilo uložit. Zkuste to prosím znovu.',
      );
    }
  };

  return (
    <div className={`${AUDIT_FORM_MAX_WIDTH_CLASS} px-section`}>
      <h2 className="text-center text-base font-semibold tracking-wide">
        <span style={{ color: AUDIT_ACCENT }}>3. </span>
        <span style={{ color: AUDIT_WHITE }}>Kam vám máme poslat výstup?</span>
      </h2>

      <p
        className="mx-auto mt-3 max-w-xl text-center text-sm leading-snug"
        style={{ color: AUDIT_MUTED }}
      >
        Po odeslání vám zašleme další postup a informace potřebné pro zpracování
        posouzení.
      </p>

      {phase === 'success' ? (
        <div className="mt-5">
          <SuccessState />
        </div>
      ) : (
        <form className="mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1" onSubmit={handleSubmit}>
          <div
            className="col-span-2 mobile:col-span-1"
            data-testid="audit-gdpr-consent"
          >
            <div className="flex items-start gap-3">
              <label
                htmlFor="audit-gdpr-consent"
                className="mt-0.5 cursor-pointer"
                data-testid="audit-gdpr-consent-control"
              >
                <input
                  id="audit-gdpr-consent"
                  type="checkbox"
                  checked={gdprConsent}
                  disabled={phase === 'loading'}
                  className="sr-only"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setGdprConsent(event.target.checked)
                  }
                />
                <span
                  aria-hidden="true"
                  data-testid="audit-gdpr-consent-mark"
                  className="flex h-5 w-5 items-center justify-center border-2"
                  style={{
                    borderColor: AUDIT_ACCENT,
                    backgroundColor: gdprConsent ? AUDIT_ACCENT : 'transparent',
                    borderRadius: 4,
                  }}
                >
                  {gdprConsent ? (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 8.5 6.5 11.5 12.5 4.5"
                        fill="none"
                        stroke={AUDIT_ON_ACCENT}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </span>
              </label>
              <p className="text-sm leading-snug" style={{ color: AUDIT_MUTED }}>
                Vaše data jsou u nás v bezpečí. Odesláním souhlasíte se{' '}
                <a
                  href={project?.privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="audit-gdpr-privacy-link"
                  className="underline underline-offset-2"
                  style={{ color: AUDIT_ACCENT }}
                >
                  zpracováním osobních údajů
                </a>{' '}
                v souladu s pravidly GDPR.
              </p>
            </div>
            {gdprConsent ? null : (
              <p
                className="mt-2 text-sm leading-snug"
                style={{ color: AUDIT_MUTED }}
                data-testid="audit-gdpr-guidance"
              >
                {AUDIT_GDPR_GUIDANCE}
              </p>
            )}
          </div>

          <label className="sr-only" htmlFor="audit-contact-name">
            Jméno a příjmení
          </label>
          <Input
            id="audit-contact-name"
            type="text"
            required
            value={name}
            placeholder="Jméno a příjmení"
            disabled={phase === 'loading'}
            className={AUDIT_INPUT_CLASS}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
            onFocus={trackContactOpened}
          />

          <label className="sr-only" htmlFor="audit-contact-email">
            E-mail
          </label>
          <Input
            id="audit-contact-email"
            type="email"
            required
            value={email}
            placeholder="E-mail"
            disabled={phase === 'loading'}
            className={AUDIT_INPUT_CLASS}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
            onFocus={trackContactOpened}
          />

          <label className="sr-only" htmlFor="audit-contact-phone">
            Telefon (volitelné)
          </label>
          <Input
            id="audit-contact-phone"
            type="tel"
            value={phone}
            placeholder="Telefon (volitelné)"
            disabled={phase === 'loading'}
            className={`${AUDIT_INPUT_CLASS} col-span-2 mobile:col-span-1`}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPhone(event.target.value)}
            onFocus={trackContactOpened}
          />

          <button
            type="submit"
            disabled={!submitEnabled}
            className="col-span-2 flex w-full items-center justify-center px-4 text-center text-sm font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001930] disabled:cursor-not-allowed mobile:col-span-1"
            style={{
              height: AUDIT_INPUT_HEIGHT_PX,
              backgroundColor: AUDIT_ACCENT,
              color: AUDIT_ON_ACCENT,
              borderRadius: AUDIT_CONTROL_RADIUS_PX,
              borderStyle: 'none',
              borderWidth: 0,
              opacity: phase === 'loading' ? 0.6 : submitEnabled ? 1 : 0.42,
            }}
          >
            {phase === 'loading' ? 'ODESÍLÁM…' : 'ODESLAT POPTÁVKU →'}
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
              Informace použijeme pouze pro účely posouzení. Nesdílíme je s třetími stranami.
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
              Nezávislé posouzení.
            </p>
            <p className="mt-1 text-xs leading-snug" style={{ color: AUDIT_MUTED }}>
              Posouzení je nezávazné. Rozhodnutí je vždy na vás.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
