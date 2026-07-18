import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Input } from '@embed-engine/ui';

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

export function AuditContact() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
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
        Po odeslání vám zašleme další postup a informace, které budeme potřebovat pro
        zpracování posouzení.
      </p>

      {submitted ? (
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
            className={AUDIT_INPUT_CLASS}
            style={{ ...AUDIT_INPUT_STYLE, height: AUDIT_INPUT_HEIGHT_PX }}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPhone(event.target.value)}
          />

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-[8px] px-4 text-center text-sm font-semibold tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001930]"
            style={{
              height: AUDIT_INPUT_HEIGHT_PX,
              backgroundColor: AUDIT_ACCENT,
              color: AUDIT_ON_ACCENT,
            }}
          >
            ODESLAT POŽADAVEK →
          </button>
        </form>
      )}

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
