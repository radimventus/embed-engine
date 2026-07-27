import { useState, type FormEvent } from 'react';

import { ExperienceHeaderModal } from './ExperienceHeaderModal';

type PdfModalProps = {
  readonly onClose: () => void;
};

type Phase = 'form' | 'success';

/** HDR-04 — Poslat PDF: email required, phone optional. */
export function PdfModal({ onClose }: PdfModalProps) {
  const [phase, setPhase] = useState<Phase>('form');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Vyplňte prosím e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Zadejte platný e-mail.');
      return;
    }
    setError('');
    setPhase('success');
  }

  return (
    <ExperienceHeaderModal
      title={
        phase === 'form' ? 'Kam vám máme poslat shrnutí?' : 'Hotovo'
      }
      onClose={onClose}
    >
      {phase === 'success' ? (
        <p className="text-base leading-relaxed text-embed-foreground-primary">
          Děkujeme. Shrnutí je na cestě do vašeho e-mailu.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <label className="block">
            <span className="mb-2 block text-sm text-embed-foreground-primary/60">
              E-mail
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border-0 border-b border-embed-border-default bg-transparent py-2 text-base text-embed-foreground-primary outline-none focus:border-embed-action-accent"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-embed-foreground-primary/60">
              Telefon <span className="opacity-60">(volitelné)</span>
            </span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full border-0 border-b border-embed-border-default bg-transparent py-2 text-base text-embed-foreground-primary outline-none focus:border-embed-action-accent"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-2 text-sm font-medium text-embed-action-accent underline decoration-embed-action-accent/40 underline-offset-4"
          >
            Odeslat
          </button>
        </form>
      )}
    </ExperienceHeaderModal>
  );
}
