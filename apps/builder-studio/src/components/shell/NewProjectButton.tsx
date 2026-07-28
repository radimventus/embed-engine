type NewProjectButtonProps = {
  readonly onCreateProject: () => void;
};

export function NewProjectButton({ onCreateProject }: NewProjectButtonProps) {
  return (
    <button
      type="button"
      onClick={onCreateProject}
      className="mt-[18px] w-full rounded-[10px] bg-builder-soft px-[13px] py-[13px] font-semibold text-builder-navy"
    >
      + Nový projekt
    </button>
  );
}
