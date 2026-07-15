import { SPATIAL_TERMINAL_HEADER_CLASS } from '../spatial-terminal-layout';

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return <h2 className={SPATIAL_TERMINAL_HEADER_CLASS}>{title}</h2>;
}
