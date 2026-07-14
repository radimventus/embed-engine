type SocialProofItemProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function SocialProofItem({ label, value, valueClassName }: SocialProofItemProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 text-center md:px-6 md:py-8">
      <p className="text-xs leading-relaxed text-embed-foreground-primary md:text-sm">{label}</p>
      <p
        className={`mt-2 text-sm text-embed-foreground-primary md:text-base ${valueClassName ?? 'font-bold'}`}
      >
        {value}
      </p>
    </div>
  );
}

export function SocialProof() {
  return (
    <section className="grid grid-cols-1 divide-y divide-embed-border-default border-b border-embed-border-default md:grid-cols-3 md:divide-x md:divide-y-0">
      <SocialProofItem label="Právě si tento dům prohlížejí" value="3 rodiny" />
      <SocialProofItem label="Tento týden si jej uložilo" value="28 klientů" />
      <SocialProofItem
        label="Nejčastější dotaz"
        value="velikost pozemku"
        valueClassName="font-bold underline decoration-embed-border-strong underline-offset-4"
      />
    </section>
  );
}
