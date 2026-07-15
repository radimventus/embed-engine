import { useState } from 'react';

import { AuditSummary } from './AuditSummary';
import { ContactCard } from './ContactCard';
import { ContactForm } from './ContactForm';
import { IntroContent } from './IntroContent';
import { SectionHeader } from './SectionHeader';
import { SuccessState } from './SuccessState';

export function AuditLeadCapture() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section aria-label="Audit and Lead Capture">
      <div className="bg-embed-brand-navy px-section py-16">
        <SectionHeader />
        <AuditSummary />
        <IntroContent />
        {submitted ? <SuccessState /> : <ContactForm onSubmit={() => setSubmitted(true)} />}
        <ContactCard />
      </div>
      <p className="py-section text-center text-xs text-embed-foreground-muted">
        power by Realivideo.online
      </p>
    </section>
  );
}
