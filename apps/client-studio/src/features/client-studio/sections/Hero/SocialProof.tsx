type SocialProofItemProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function SocialProofItem({ label, value, valueClassName }: SocialProofItemProps) {
  return (
    <div className="flex h-social-proof items-center justify-center px-section text-center">
      <p className="text-sm leading-relaxed text-embed-foreground-primary">
        {label} / <span className={valueClassName ?? 'font-bold'}>{value}</span>
      </p>
    </div>
  );
}

export function SocialProof() {
  return (
    <div className="grid grid-cols-3 divide-x divide-embed-border-default bg-embed-background-secondary mobile:grid-cols-1 mobile:divide-x-0 mobile:divide-y">
      <SocialProofItem label="Právě si tento dům prohlížejí" value="3 rodiny" />
      <SocialProofItem label="Tento týden si jej uložilo" value="28 klientů" />
      <SocialProofItem
        label="Nejčastější dotaz"
        value="velikost pozemku"
        valueClassName="font-bold underline decoration-embed-border-strong underline-offset-4"
      />
    </div>
  );
}
