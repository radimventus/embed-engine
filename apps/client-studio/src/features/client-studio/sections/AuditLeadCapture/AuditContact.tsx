import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Input } from '@embed-engine/ui';

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
import { LockIcon, UserIcon } from './AuditIcons';
import { SuccessState } from './SuccessState';

type LeadPhase = 'idle' | 'loading' | 'success' | 'error';

/**
 * Lead Capture — operational mailto handoff until a backend exists (S-006A).
 * Never claims a server received the request when none exists.
 */
export function AuditContact() {
  const [phase, setPhase] = useState<LeadPhase>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

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

    setPhase('loading');

    const subject = encodeURIComponent('Poptávka — posouzení umístění domu');
    const body = encodeURIComponent(
      [
        `Jméno: ${trimmedName}`,
        `E-mail: ${trimmedEmail}`,
        phone.trim() ? `Telefon: ${phone.trim()}` : null,
        '',
        'Zdroj: Client Studio — Audit / Lead',
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
    );

    try {
      window.location.href = `mailto:${PILOT_LEAD_MAILTO}?subject=${subject}&body=${body}`;
      window.setTimeout(() => setPhase('success'), 400);
    } catch {
      setPhase('error');
      setErrorMessage(
        `Nepodařilo se otevřít e-mail. Napište nám na ${PILOT_LEAD_MAILTO}.`,
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
        posouzení. Poptávku otevřete ve svém e-mailu — odeslání potvrďte tam.
      </p>

      {phase === 'success' ? (
        <div className="mt-5">
          <SuccessState />
        </div>
      ) : (
        <form className="mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1" onSubmit={handleSubmit}>
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
            className={AUDIT_INPUT_CLASS}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPhone(event.target.value)}
          />

          <button
            type="submit"
            disabled={phase === 'loading'}
            className="flex w-full items-center justify-center rounded-[8px] px-4 text-center text-sm font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001930] disabled:opacity-60"
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
