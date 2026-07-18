import { useCallback, useRef } from 'react';
import { DECISION_TRANSITION_CLASS } from './decision-cards-layout';

type DecisionSliderProps = {
  value: number;
  onChange: (value: number) => void;
};

function clampImportance(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function DecisionSlider({ value, onChange }: DecisionSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (track === null) {
        return;
      }

      const { left, width } = track.getBoundingClientRect();
      if (width === 0) {
        return;
      }

      onChange(clampImportance((clientX - left) / width));
    },
    [onChange],
  );

  return (
    <div
      className="relative h-7 w-full shrink-0"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        ref={trackRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-label="Decision importance"
        tabIndex={0}
        className="group relative flex h-7 w-full cursor-pointer touch-none items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            onChange(clampImportance(value - 0.05));
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            onChange(clampImportance(value + 0.05));
          }
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateFromClientX(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            updateFromClientX(event.clientX);
          }
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-embed-border-default" />
        <div
          className={`absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-embed-brand-gold ${DECISION_TRANSITION_CLASS} transition-[width]`}
          style={{ width: `${value * 100}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${DECISION_TRANSITION_CLASS} transition-[left]`}
          style={{ left: `${value * 100}%` }}
        >
          <div className="flex h-7 w-7 items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full border-2 border-embed-brand-gold bg-embed-background-primary shadow-[0_1px_4px_rgba(0,25,48,0.12)] transition-shadow group-hover:shadow-[0_2px_6px_rgba(0,25,48,0.16)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
