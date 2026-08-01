import { useId, useState } from 'react';

import {
  PlatformNotice,
  type PlatformNoticeItem,
} from './PlatformNotice';

type NotificationsProps = {
  readonly count?: number;
};

const DEMO_NOTICES: readonly PlatformNoticeItem[] = [
  {
    id: 'n1',
    tone: 'info',
    title: 'Platforma je připravena',
    detail: 'Studio Switcher a Project Switcher používají stejný model.',
  },
  {
    id: 'n2',
    tone: 'success',
    title: 'Session aktivní',
    detail: 'Pokračujte Builder → Publikace → Manager → Sales.',
  },
];

/**
 * VR-FIX-06 — Notifications use unified notice grammar.
 */
export function NotificationsBell({ count = 2 }: NotificationsProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<PlatformNoticeItem | null>(null);

  return (
    <span className="platform-feedback">
      <button
        type="button"
        className="platform-notify"
        title="Oznámení"
        aria-label={`${count} oznámení`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden>○</span>
        {count > 0 && (
          <span className="platform-notify__badge" aria-hidden>
            {count}
          </span>
        )}
      </button>
      {open && (
        <div
          id={panelId}
          className="platform-feedback__panel"
          role="dialog"
          aria-label="Oznámení"
        >
          <p className="platform-feedback__title">Oznámení</p>
          <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none' }}>
            {DEMO_NOTICES.map((item) => (
              <li key={item.id} style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="platform-btn"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => {
                    setActive(item);
                    setOpen(false);
                  }}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="platform-notice-host">
        <PlatformNotice
          notice={active}
          onDismiss={() => setActive(null)}
        />
      </div>
    </span>
  );
}
