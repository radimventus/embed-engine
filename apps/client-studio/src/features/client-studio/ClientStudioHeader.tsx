import { useEffect, useState } from 'react';
import {
  listWorkspaceHouses,
  usePlatformSession,
} from '@embed-engine/platform-access';

import actionCallUrl from '../../assets/icons/action-call.png';
import actionPdfUrl from '../../assets/icons/action-pdf.png';

import { PartnerBrandMark } from './PartnerBrandMark';
import { HeaderContactMenu } from './header/HeaderContactMenu';
import { HeaderSaveMenu } from './header/HeaderSaveMenu';
import {
  formatClientPartnerHouseTitle,
  resolveClientRuntimeBinding,
} from './runtime/clientCanonicalBind';

/**
 * AppShell top navigation (CSCB-01 / CAP-PLAT-02c) — Partner · House from CPL.
 * Close is owned by the Delivery overlay ([data-embed-close] in overlaySurface).
 */
function projectionAlt(title: string): string {
  return title.trim().length > 0 ? `${title} — logo projektu` : 'Logo projektu';
}

export function ClientStudioHeader() {
  const { session } = usePlatformSession();
  const [title, setTitle] = useState('');
  const mobileHouseTitle = title
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean)
    .at(-1) ?? title;

  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const workspaceDraft =
      session?.projectId !== null && session?.projectId !== undefined
        ? listWorkspaceHouses(session.projectId).find(
            (house) =>
              house.houseId === session.activeHouseId &&
              house.status === 'draft',
          )
        : undefined;
    if (workspaceDraft !== undefined) {
      setLogoUrl(null);
      setTitle(workspaceDraft.name);
      return;
    }
    const binding = resolveClientRuntimeBinding();
    const projection = binding.project;
    if (projection === null) {
      setTitle('');
      setLogoUrl(null);
      return;
    }
    setLogoUrl(projection.branding.logoUrl ?? null);
    setTitle(formatClientPartnerHouseTitle(projection));
  }, [session?.activeHouseId, session?.projectId]);

  return (
    <header
      data-experience-header=""
      className="relative sticky top-0 z-50 shrink-0 border-b border-embed-border-default bg-embed-background-primary pt-[env(safe-area-inset-top,0px)] mobile:static mobile:relative"
    >
      <div className="mx-auto grid h-header w-full min-w-0 max-w-none grid-cols-[1fr_auto_1fr] items-center px-section desktop:w-canvas desktop:max-w-canvas">
        <div className="justify-self-start mobile:hidden">
          <PartnerBrandMark
            src={logoUrl}
            alt={projectionAlt(title)}
          />
        </div>
        <p
          className="max-w-[12rem] truncate text-center text-sm text-embed-foreground-primary/70 tablet:max-w-[16rem] tablet:text-base desktop:max-w-[20rem]"
          data-testid="client-partner-title"
        >
          <span className="mobile:hidden">{title}</span>
          <span className="hidden mobile:inline">{mobileHouseTitle}</span>
        </p>
        <div className="flex items-center justify-end gap-3 justify-self-end desktop:gap-section">
          <HeaderContactMenu
            icon={
              <img
                src={actionCallUrl}
                alt=""
                width={48}
                height={48}
                className="h-10 w-10 shrink-0 object-contain desktop:h-12 desktop:w-12"
                aria-hidden="true"
              />
            }
          />
          <HeaderSaveMenu
            icon={
              <img
                src={actionPdfUrl}
                alt=""
                width={32}
                height={32}
                className="h-7 w-7 shrink-0 object-contain desktop:h-8 desktop:w-8"
                aria-hidden="true"
              />
            }
          />
        </div>
      </div>
    </header>
  );
}
