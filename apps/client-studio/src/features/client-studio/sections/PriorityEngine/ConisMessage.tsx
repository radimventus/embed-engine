import type { ReactNode } from 'react';

import { ConisAvatar } from './ConisAvatar';

type ConisMessageProps = {
  children: ReactNode;
  className?: string;
  testId?: string;
};

/**
 * Conis utterance chrome — avatar accompanies every message (PT-PRIORITY-TUNING-02).
 */
export function ConisMessage({ children, className = '', testId }: ConisMessageProps) {
  return (
    <div
      className={`flex items-start gap-2.5 ${className}`}
      data-testid={testId}
    >
      <ConisAvatar size={26} />
      <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">{children}</div>
    </div>
  );
}
