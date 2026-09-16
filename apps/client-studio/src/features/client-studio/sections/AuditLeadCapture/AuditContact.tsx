import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
} from 'react';
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
  type LandOption,
} from './audit-panel';
import { AuditConsentDialog } from './AuditConsentDialog';
import { LockIcon, UserIcon } from './AuditIcons';
import { SuccessState } from './SuccessState';
import { submitDurableLead } from './durableLeadSubmission';
import { buildClientOutputSnapshot, clientOutputVariantForLandOption } from '../../client-output/clientOutputSnapshot';
import { downloadClientOutput, submitClientOutput, type ClientOutputAccepted } from '../../client-output/clientOutputClient';

type LeadPhase = 'idle' | 'loading' | 'success' | 'error';

export const AUDIT_POST_SUBMIT_COPY =
  'Po odeslání formuláře se s Vámi spojíme a domluvíme podrobnosti.';

type AuditContactProps = {
  readonly landOption: LandOption;
  readonly onPersistLandIntent: (value: LandOption) => void;
};

/**
 * Lead Capture succeeds only after the Platform API durably accepts a lead.
 */
export function AuditContact({
  landOption,
  onPersistLandIntent,
}: AuditContactProps) {
  const analytics = useOptionalDecisionAnalytics();
  const runtime = useDecisionSessionRuntime();
  const { analyticsScope, company, project, decisionSessionId } = runtime;
  const [phase, setPhase] = useState<LeadPhase>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientOutput, setClientOutput] = useState<ClientOutputAccepted | null>(null);
  const contactOpenedRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const consentContinuationRef = useRef(false);

  const trackContactOpened = () => {
    if (contactOpenedRef.current) {
      return;
    }
    contactOpenedRef.current = true;
    analytics?.conversionStarted('audit-contact-form');
  };

  const closeConsentDialog = useCallback(() => setConsentDialogOpen(false), []);

  useEffect(() => {
    if (!gdprConsent || !consentContinuationRef.current) return;
    consentContinuationRef.current = false;
    formRef.current?.requestSubmit();
  }, [gdprConsent]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!gdprConsent) {
      setConsentDialogOpen(true);
      return;
    }

    if (
      project?.privacyUrl === undefined ||
      analyticsScope === null ||
      company === null
    ) {
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
    onPersistLandIntent(landOption);
    const idempotencyKey = idempotencyKeyRef.current ?? crypto.randomUUID();
    idempotencyKeyRef.current = idempotencyKey;

    let auditPersisted = false;
    try {
      const acceptedLead = await submitDurableLead({
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
        decisionSessionId,
      });
      auditPersisted = true;
      const variant = clientOutputVariantForLandOption(landOption);
      const output = await submitClientOutput({snapshot:buildClientOutputSnapshot(runtime,variant),recipient:trimmedEmail,trigger:'AUDIT',auditLeadId:acceptedLead.leadId});
      setClientOutput(output);
      analytics?.conversionCompleted('audit-contact-form');
      idempotencyKeyRef.current = null;
      setPhase('success');
    } catch {
      setPhase('error');
      setErrorMessage(auditPersisted
        ? 'Poptávka byla bezpečně uložena, osobní PDF se však nepodařilo připravit nebo doručit. Zkuste odeslání znovu.'
        : 'Poptávku se nepodařilo uložit. Zkuste to prosím znovu.');
    }
  };

  const handleCtaClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (gdprConsent) {
      return;
    }
    event.preventDefault();
    setConsentDialogOpen(true);
  };

  const confirmConsentAndContinue = () => {
    if (consentContinuationRef.current) return;
    consentContinuationRef.current = true;
    setConsentDialogOpen(false);
    setGdprConsent(true);
  };

  return (
    <div className={`${AUDIT_FORM_MAX_WIDTH_CLASS} px-section`}>
      <h2 className="text-left text-base font-semibold tracking-wide mobile:text-[1.1rem] mobile:leading-[1.2]">
        <span style={{ color: AUDIT_ACCENT }}>3. </span>
        <span style={{ color: AUDIT_WHITE }}>Kam vám máme poslat výstup?</span>
      </h2>

      {phase === 'success' ? (
        <div className="mt-5">
          <SuccessState landOption={landOption} onDownload={clientOutput===null?undefined:()=>downloadClientOutput(clientOutput,runtime.experience.house.title)} />
        </div>
      ) : (
        <form ref={formRef} className="mt-5" onSubmit={handleSubmit}>
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
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setName(event.target.value)
                }
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
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
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
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setPhone(event.target.value)
                }
                onFocus={trackContactOpened}
              />
            </div>

            <div className="relative">
              <button
                type="submit"
                data-testid="audit-contact-submit"
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
                onClick={handleCtaClick}
              >
                {phase === 'loading' ? 'ODESÍLÁM…' : 'ODESLAT POPTÁVKU →'}
              </button>
            </div>
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

      <div className="mt-5 grid grid-cols-2 gap-6 mobile:grid-cols-1">
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
            <p
              className="mt-1 text-xs leading-snug"
              style={{ color: AUDIT_MUTED }}
            >
              Posouzení je nezávazné. Rozhodnutí je vždy na vás.
            </p>
          </div>
        </div>

        <div
          className="flex gap-3 mobile:hidden"
          data-testid="audit-data-trust"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: AUDIT_ACCENT }}
          >
            <LockIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: AUDIT_WHITE }}>
              Vaše data jsou u nás v bezpečí.
            </p>
            <p
              className="mt-1 text-xs leading-snug"
              style={{ color: AUDIT_MUTED }}
            >
              Informace použijeme pouze pro účely posouzení. Nesdílíme je s
              třetími stranami.
            </p>
          </div>
        </div>
      </div>

      <AuditConsentDialog
        open={consentDialogOpen}
        privacyHref={project?.privacyUrl}
        onCancel={closeConsentDialog}
        onConfirm={confirmConsentAndContinue}
      />
    </div>
  );
}
