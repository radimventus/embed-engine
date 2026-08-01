type NotificationsProps = {
  readonly count?: number;
};

/**
 * Notifications placeholder — no backend.
 */
export function NotificationsBell({ count = 3 }: NotificationsProps) {
  return (
    <span
      className="platform-notify"
      title="Notifications (placeholder)"
      aria-label={`${count} oznámení`}
    >
      <span aria-hidden>○</span>
      {count > 0 && (
        <span className="platform-notify__badge" aria-hidden>
          {count}
        </span>
      )}
    </span>
  );
}
