import { useState, type FormEvent } from 'react';

type ContactFormProps = {
  onSubmit: () => void;
};

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      className="mx-auto mt-section flex w-full max-w-md flex-col gap-3"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="contact-name">
        Vaše jméno a příjmení
      </label>
      <input
        id="contact-name"
        type="text"
        value={name}
        placeholder="Vaše jméno a příjmení"
        onChange={(event) => setName(event.target.value)}
        className="bg-embed-white px-4 py-3 text-sm text-embed-foreground-primary placeholder:text-embed-foreground-muted"
      />

      <label className="sr-only" htmlFor="contact-phone">
        Vaše telefonní číslo
      </label>
      <input
        id="contact-phone"
        type="tel"
        value={phone}
        placeholder="Vaše telefonní číslo"
        onChange={(event) => setPhone(event.target.value)}
        className="bg-embed-white px-4 py-3 text-sm text-embed-foreground-primary placeholder:text-embed-foreground-muted"
      />

      <label className="sr-only" htmlFor="contact-email">
        Váš e-mail
      </label>
      <input
        id="contact-email"
        type="email"
        value={email}
        placeholder="Váš e-mail"
        onChange={(event) => setEmail(event.target.value)}
        className="bg-embed-white px-4 py-3 text-sm text-embed-foreground-primary placeholder:text-embed-foreground-muted"
      />

      <button
        type="submit"
        className="mt-section w-full bg-embed-status-warning px-6 py-3 text-sm text-embed-white"
      >
        Odeslat
      </button>
    </form>
  );
}
