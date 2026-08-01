import { useEffect, useState } from 'react';

export type PlatformNoticeTone = 'success' | 'warning' | 'error' | 'info';

export type PlatformNoticeItem = {
  readonly id: string;
  readonly tone: PlatformNoticeTone;
  readonly title: string;
  readonly detail?: string;
};

type PlatformNoticeProps = {
  readonly notice: PlatformNoticeItem | null;
  readonly onDismiss?: () => void;
  readonly autoHideMs?: number;
};

const TONE_CLASS: Record<PlatformNoticeTone, string> = {
  success: 'platform-notice--success',
  warning: 'platform-notice--warning',
  error: 'platform-notice--error',
  info: 'platform-notice--info',
};

/**
 * VR-FIX-03 — Unified notification banner (success · warning · error · info).
 */
export function PlatformNotice({
  notice,
  onDismiss,
  autoHideMs = 5000,
}: PlatformNoticeProps) {
  const [visible, setVisible] = useState(notice !== null);

  useEffect(() => {
    setVisible(notice !== null);
    if (notice === null || autoHideMs <= 0) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoHideMs);
    return () => window.clearTimeout(timer);
  }, [notice, autoHideMs, onDismiss]);

  if (notice === null || !visible) {
    return null;
  }

  return (
    <div
      className={`platform-notice ${TONE_CLASS[notice.tone]}`}
      role="status"
      aria-live="polite"
      data-testid="platform-notice"
    >
      <div className="platform-notice__body">
        <p className="platform-notice__title">{notice.title}</p>
        {notice.detail !== undefined && notice.detail.length > 0 && (
          <p className="platform-notice__detail">{notice.detail}</p>
        )}
      </div>
      {onDismiss !== undefined && (
        <button
          type="button"
          className="platform-notice__dismiss"
          aria-label="Zavřít oznámení"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
