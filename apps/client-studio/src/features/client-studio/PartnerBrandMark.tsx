type PartnerBrandMarkProps = {
  readonly src: string | null | undefined;
  readonly alt?: string;
};

/**
 * Experience header Project logo.
 * No generated initials, SVG mark or pseudo-brand fallback.
 */
export function PartnerBrandMark({
  src,
  alt = '',
}: PartnerBrandMarkProps) {
  const logo = src?.trim() ?? '';
  if (logo.length === 0) return null;

  return (
    <img
      src={logo}
      alt={alt}
      className="block h-[43px] max-w-[180px] object-contain object-left"
      data-testid="client-partner-logo"
    />
  );
}
