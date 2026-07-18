const STROKE = '#D4AF37';

/** Outline plot / parcel mark — same gold line language as Priority icons. */
export function PlotIllustration() {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      aria-hidden="true"
      className="h-[3rem] w-[4rem] shrink-0"
    >
      <path
        d="M6 38V14l14-8 24 6v26H6z"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M20 6v32M44 12v26M6 26h38"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M28 20h8v8h-8z"
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
