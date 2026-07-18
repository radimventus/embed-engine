import { useState, type FormEvent } from 'react';
import { colors } from '@embed-engine/design-tokens';
import { Input, PrimaryButton, SegmentedControl } from '@embed-engine/ui';

import { ContactCard } from './ContactCard';
import { PlotIllustration } from './PlotIllustration';
import { SectionHeader } from './SectionHeader';
import { SuccessState } from './SuccessState';
import {
  AUDIT_CONTROL_WIDTH_CLASS,
  AUDIT_FORM_PANEL_STYLE,
  AUDIT_INPUT_CLASS,
  AUDIT_INPUT_STYLE,
  AUDIT_LAND_PROMPT,
  AUDIT_PANEL_MAX_WIDTH_CLASS,
  AUDIT_PANEL_SURFACE_CLASS,
  LAND_OPTION_COPY,
  LAND_OPTIONS,
  type LandOption,
} from './audit-panel';

export function AuditLeadCapture() {
  const [submitted, setSubmitted] = useState(false);
  const [landOption, setLandOption] = useState<LandOption>('owned');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const isOwned = landOption === 'owned';
  const [lineOne, lineTwo] = LAND_OPTION_COPY[landOption];

  return (
    <section aria-label="Audit and Lead Capture">
      <div className="overflow-hidden rounded-[11px] bg-[#001E3A] px-section py-16 shadow-[0_1px_11px_rgba(0,30,58,0.044)]">
        <SectionHeader />

        <p
          className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} mt-section text-center text-xl font-bold uppercase leading-snug tracking-wide`}
          style={{ color: colors.border.default }}
        >
          {AUDIT_LAND_PROMPT}
        </p>

        <div className={`mt-section ${AUDIT_PANEL_MAX_WIDTH_CLASS} flex justify-center`}>
          <div className={AUDIT_CONTROL_WIDTH_CLASS}>
            <SegmentedControl
              aria-label="Typ pozemku"
              size="compact"
              theme="navy"
              value={landOption}
              onChange={setLandOption}
              options={LAND_OPTIONS}
            />
          </div>
        </div>

        <div className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} relative mt-section flex min-h-[3rem] items-center justify-center`}>
          <div
            aria-hidden="true"
            className={`absolute top-1/2 -translate-y-1/2 ${isOwned ? 'left-0' : 'right-0'}`}
          >
            <PlotIllustration />
          </div>
          <p className="text-center text-base leading-relaxed text-[#D4AF37]">
            {lineOne}
            <br />
            {lineTwo}
          </p>
        </div>

        {submitted ? (
          <div className={`mt-section ${AUDIT_PANEL_MAX_WIDTH_CLASS}`}>
            <SuccessState />
          </div>
        ) : (
          <form
            className={`mt-section ${AUDIT_PANEL_MAX_WIDTH_CLASS}`}
            onSubmit={handleSubmit}
          >
            <div
              className={`${AUDIT_PANEL_SURFACE_CLASS} flex flex-col gap-3`}
              style={AUDIT_FORM_PANEL_STYLE}
            >
              <label className="sr-only" htmlFor="contact-name">
                Vaše jméno a příjmení
              </label>
              <Input
                id="contact-name"
                type="text"
                value={name}
                placeholder="Vaše jméno a příjmení"
                className={AUDIT_INPUT_CLASS}
                style={AUDIT_INPUT_STYLE}
                onChange={(event) => setName(event.target.value)}
              />

              <label className="sr-only" htmlFor="contact-email">
                Váš e-mail
              </label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                placeholder="Váš e-mail"
                className={AUDIT_INPUT_CLASS}
                style={AUDIT_INPUT_STYLE}
                onChange={(event) => setEmail(event.target.value)}
              />

              <label className="sr-only" htmlFor="contact-phone">
                Vaše telefonní číslo
              </label>
              <Input
                id="contact-phone"
                type="tel"
                value={phone}
                placeholder="Vaše telefonní číslo"
                className={AUDIT_INPUT_CLASS}
                style={AUDIT_INPUT_STYLE}
                onChange={(event) => setPhone(event.target.value)}
              />

              <div className="flex justify-center">
                <div className={AUDIT_CONTROL_WIDTH_CLASS}>
                  <PrimaryButton type="submit" size="full">
                    Odeslat
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </form>
        )}

        <ContactCard />
      </div>
      <p className="bg-[#F7F6F4] py-section text-center text-xs text-embed-foreground-primary/45">
        power by Realivideo.online
      </p>
    </section>
  );
}
