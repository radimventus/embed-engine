import type { PlatformBreadcrumbItem } from './platformTypes';

type PlatformBreadcrumbProps = {
  readonly items: readonly PlatformBreadcrumbItem[];
};

/**
 * VR-FIX-03 — Breadcrumb with consistent deep-nav / landing return.
 */
export function PlatformBreadcrumb({ items }: PlatformBreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="platform-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const current = index === items.length - 1;
        return (
          <span key={item.id} style={{ display: 'inline-flex', gap: 8 }}>
            {index > 0 && (
              <span className="platform-breadcrumb__sep" aria-hidden>
                /
              </span>
            )}
            {item.onSelect !== undefined && !current ? (
              <button
                type="button"
                className="platform-breadcrumb__item platform-breadcrumb__item--action"
                onClick={item.onSelect}
              >
                {item.label}
              </button>
            ) : item.href !== undefined && !current ? (
              <a href={item.href} className="platform-breadcrumb__item">
                {item.label}
              </a>
            ) : (
              <span
                className={`platform-breadcrumb__item${current ? ' platform-breadcrumb__item--current' : ''}`}
                aria-current={current ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
