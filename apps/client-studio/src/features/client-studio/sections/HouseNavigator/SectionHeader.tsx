import { DECISION_CANVAS_CHAPTER_TITLE_CLASS } from '../spatial-terminal-layout';

type SectionHeaderProps = {
  className?: string;
};

export function SectionHeader({ className }: SectionHeaderProps) {
  return (
    <h2 className={className ? `${DECISION_CANVAS_CHAPTER_TITLE_CLASS} ${className}` : DECISION_CANVAS_CHAPTER_TITLE_CLASS}>
      Interaktivní půdorys
    </h2>
  );
}
