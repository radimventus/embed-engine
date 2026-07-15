type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2 className="text-base font-bold tracking-wide text-embed-brand-navy">{title}</h2>
  );
}
