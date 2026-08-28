import type { ReactNode } from 'react';

import { ConisAvatar } from './ConisAvatar';

type ConisMessageProps = {
  children: ReactNode;
  className?: string;
  testId?: string;
};

/**
 * Conis utterance chrome — larger avatar aligned to message top (pilot readiness).
 */
export function ConisMessage({ children, className = '', testId }: ConisMessageProps) {
  return (
    <div
      className={`flex items-start gap-3 ${className}`}
      data-testid={testId}
    >
      <ConisAvatar size={40} />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">{children}</div>
    </div>
  );
}
