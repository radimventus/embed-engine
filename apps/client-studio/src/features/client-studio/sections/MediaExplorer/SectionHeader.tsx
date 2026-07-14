type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2 className="text-sm font-bold tracking-wide text-embed-foreground-primary md:text-base">
      {title}
    </h2>
  );
}
