import { useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
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
import { UserIcon } from './AuditIcons';
import { SuccessState } from './SuccessState';
import { submitDurableLead } from './durableLeadSubmission';

type LeadPhase = 'idle' | 'loading' | 'success' | 'error';

export const AUDIT_GDPR_GUIDANCE = 'Pro odeslání potvrďte souhlas s GDPR.';

export const AUDIT_POST_SUBMIT_COPY =
  'Po odeslání formuláře se s Vámi spojíme a domluvíme podrobnosti.';

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
  const [ctaHovered, setCtaHovered] = useState(false);
  const [guidancePinned, setGuidancePinned] = useState(false);
  const contactOpenedRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const trackContactOpened = () => {
    if (contactOpenedRef.current) {
      return;
    }
    contactOpenedRef.current = true;
    analytics?.conversionStarted('audit-contact-form');
  };

  const showConsentGuidance =
    !gdprConsent && (ctaHovered || guidancePinned);

  const revealConsentGuidance = () => {
    setGuidancePinned(true);
    checkboxRef.current?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!gdprConsent) {
      revealConsentGuidance();
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

  const handleCtaClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (gdprConsent) {
      return;
    }
    event.preventDefault();
    revealConsentGuidance();
  };

  return (
    <div className={`${AUDIT_FORM_MAX_WIDTH_CLASS} px-section`}>
      <h2 className="text-center text-base font-semibold tracking-wide">
        <span style={{ color: AUDIT_ACCENT }}>3. </span>
        <span style={{ color: AUDIT_WHITE }}>Kam vám máme poslat výstup?</span>
      </h2>

      {phase === 'success' ? (
        <div className="mt-5">
          <SuccessState />
        </div>
      ) : (
        <form className="mt-5" onSubmit={handleSubmit}>
          <div
            className="grid grid-cols-2 gap-3 mobile:grid-cols-1"
            data-testid="audit-contact-grid"
          >
            <div>
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
            </div>

            <div>
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
            </div>

            <div>
              <label className="sr-only" htmlFor="audit-contact-phone">
                Telefon (volitelně)
              </label>
              <Input
                id="audit-contact-phone"
                type="tel"
                value={phone}
                placeholder="Telefon (volitelně)"
                disabled={phase === 'loading'}
                className={AUDIT_INPUT_CLASS}
                style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPhone(event.target.value)}
                onFocus={trackContactOpened}
              />
            </div>

            <div className="relative">
              <button
                type="submit"
                data-testid="audit-contact-submit"
                aria-describedby={
                  showConsentGuidance ? 'audit-gdpr-guidance' : undefined
                }
                disabled={phase === 'loading'}
                className="flex w-full items-center justify-center px-4 text-center text-sm font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001930] disabled:cursor-not-allowed"
                style={{
                  height: AUDIT_INPUT_HEIGHT_PX,
                  backgroundColor: AUDIT_ACCENT,
                  color: AUDIT_ON_ACCENT,
                  borderRadius: AUDIT_CONTROL_RADIUS_PX,
                  borderStyle: 'none',
                  borderWidth: 0,
                  opacity: phase === 'loading' ? 0.6 : 1,
                }}
                onMouseEnter={() => {
                  if (!gdprConsent) setCtaHovered(true);
                }}
                onMouseLeave={() => setCtaHovered(false)}
                onClick={handleCtaClick}
              >
                {phase === 'loading' ? 'ODESÍLÁM…' : 'ODESLAT POPTÁVKU →'}
              </button>
              {showConsentGuidance ? (
                <span
                  id="audit-gdpr-guidance"
                  role="status"
                  data-testid="audit-gdpr-guidance"
                  className="pointer-events-none absolute top-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-xs leading-none"
                  style={{ color: AUDIT_ACCENT }}
                >
                  {AUDIT_GDPR_GUIDANCE}
                </span>
              ) : null}
            </div>
          </div>

          <div
            className="mt-3 flex items-start gap-2"
            data-testid="audit-gdpr-consent"
          >
            <label
              htmlFor="audit-gdpr-consent"
              className="mt-0.5 cursor-pointer"
              data-testid="audit-gdpr-consent-control"
            >
              <input
                ref={checkboxRef}
                id="audit-gdpr-consent"
                type="checkbox"
                checked={gdprConsent}
                disabled={phase === 'loading'}
                className="sr-only"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const checked = event.target.checked;
                  setGdprConsent(checked);
                  if (checked) {
                    setGuidancePinned(false);
                  }
                }}
              />
              <span
                aria-hidden="true"
                data-testid="audit-gdpr-consent-mark"
                className="flex h-4 w-4 items-center justify-center border-2"
                style={{
                  borderColor: AUDIT_ACCENT,
                  backgroundColor: gdprConsent ? AUDIT_ACCENT : 'transparent',
                  borderRadius: 3,
                  boxShadow: guidancePinned && !gdprConsent
                    ? `0 0 0 2px ${AUDIT_ACCENT}66`
                    : undefined,
                }}
              >
                {gdprConsent ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3"
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
              <label htmlFor="audit-gdpr-consent" className="cursor-pointer">
                Odesláním souhlasíte se{' '}
              </label>
              <a
                href={project?.privacyUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="audit-gdpr-privacy-link"
                className="underline underline-offset-2"
                style={{ color: AUDIT_ACCENT }}
              >
                zpracováním osobních údajů
              </a>
              <label htmlFor="audit-gdpr-consent" className="cursor-pointer">
                {' '}
                v souladu s pravidly GDPR.
              </label>
            </p>
          </div>

          <p
            className="mt-3 text-center text-sm leading-snug"
            style={{ color: AUDIT_MUTED }}
            data-testid="audit-post-submit-copy"
          >
            {AUDIT_POST_SUBMIT_COPY}
          </p>
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

      <div className="mt-5 flex gap-3">
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
  );
}
