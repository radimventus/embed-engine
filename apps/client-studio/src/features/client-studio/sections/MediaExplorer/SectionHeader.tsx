import { SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS } from '../spatial-terminal-layout';

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return <h2 className={SPATIAL_TERMINAL_WALKTHROUGH_TITLE_CLASS}>{title}</h2>;
}
