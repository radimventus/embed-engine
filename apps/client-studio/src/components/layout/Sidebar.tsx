const DEFAULT_NAV_ITEMS = [
  'Dashboard',
  'Projects',
  'Properties',
  'Clients',
  'Settings',
] as const;

type SidebarProps = {
  items?: readonly string[];
};

export function Sidebar({ items = DEFAULT_NAV_ITEMS }: SidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-embed-border-default bg-embed-background-secondary">
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-md px-3 py-2 text-sm text-embed-foreground-secondary"
          >
            {item}
          </span>
        ))}
      </nav>
    </aside>
  );
}
