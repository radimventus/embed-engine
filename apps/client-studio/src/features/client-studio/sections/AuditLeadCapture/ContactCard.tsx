import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { AUDIT_ACCENT, AUDIT_MUTED, AUDIT_PANEL_MAX_WIDTH_CLASS, AUDIT_WHITE } from './audit-panel';
import {
  projectFooterFromRuntime,
  projectFooterHasContact,
  projectFooterHasContent,
  projectFooterHasIdentity,
} from './projectFooter';

/** Project/partner identity + contact below the Audit gold separator. */
export function ContactCard() {
  const { company } = useDecisionSessionRuntime();
  const footer = projectFooterFromRuntime({
    companyName: company?.companyName,
    legalName: company?.legalName,
    city: company?.city,
    country: company?.country,
    ico: company?.ico,
    phone: company?.phone,
    email: company?.email,
  });

  if (!projectFooterHasContent(footer)) {
    return null;
  }

  const hasIdentity = projectFooterHasIdentity(footer);
  const hasContact = projectFooterHasContact(footer);

  return (
    <div
      className={`${AUDIT_PANEL_MAX_WIDTH_CLASS} mt-10 border-t px-section pt-6 mobile:mt-8`}
      style={{ borderColor: AUDIT_ACCENT }}
      data-testid="audit-project-footer"
    >
      <div
        className={
          hasIdentity && hasContact
            ? 'grid grid-cols-2 gap-section text-sm leading-relaxed mobile:grid-cols-1'
            : 'text-sm leading-relaxed'
        }
      >
        {hasIdentity ? (
          <div
            data-testid="audit-project-footer-identity"
            style={{ color: AUDIT_MUTED }}
          >
            {footer.legalName ? (
              <p style={{ color: AUDIT_WHITE }}>{footer.legalName}</p>
            ) : null}
            {footer.address ? <p>{footer.address}</p> : null}
            {footer.ico ? <p>IČO: {footer.ico}</p> : null}
          </div>
        ) : null}
        {hasContact ? (
          <div
            className={hasIdentity ? 'text-right mobile:text-left' : undefined}
            data-testid="audit-project-footer-contact"
            style={{ color: AUDIT_MUTED }}
          >
            {footer.phone ? (
              <p style={{ color: AUDIT_WHITE }}>{footer.phone}</p>
            ) : null}
            {footer.email ? <p>{footer.email}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
