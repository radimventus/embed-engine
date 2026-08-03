type PlayControlProps = {
  onPlay: () => void;
};

export function PlayControl({ onPlay }: PlayControlProps) {
  return (
    <button
      type="button"
      aria-label="Přehrát video"
      className="group absolute inset-0 flex min-h-11 cursor-pointer items-center justify-center border-0 bg-transparent p-0 touch-manipulation"
      onClick={onPlay}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-embed-background-primary/90 shadow-md transition-[transform,opacity] duration-150 ease-out group-hover:scale-[1.04] group-hover:opacity-95">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="ml-1 h-7 w-7 fill-embed-foreground-primary"
        >
          <path d="M8 5.14v13.72L19 12 8 5.14z" />
        </svg>
      </span>
    </button>
  );
}
