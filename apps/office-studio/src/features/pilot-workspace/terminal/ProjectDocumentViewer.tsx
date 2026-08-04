import { useMemo, useState } from 'react';

import type { DocumentArtifact } from '@embed-engine/document-runtime';

import {
  getProjectDocument,
  listProjectDocuments,
} from '../../../office/officeDocumentRuntimeHost';
import { getOfficeAutomationHost } from '../../../office/officeAutomationHost';
import { DEFAULT_PILOT_MAILBOX_ID } from '../../../mail';

type ProjectDocumentViewerProps = {
  readonly projectId: string;
  readonly contactEmail: string | null;
};

/**
 * PT-15 — Office document viewer (no create).
 * Preview · Send · Download · History · Status.
 */
export function ProjectDocumentViewer({
  projectId,
  contactEmail,
}: ProjectDocumentViewerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const documents = useMemo(() => {
    void revision;
    return listProjectDocuments(projectId);
  }, [projectId, revision]);

  const selected =
    selectedId === null ? null : getProjectDocument(selectedId);

  const refresh = () => setRevision((value) => value + 1);

  const onDownload = (artifact: DocumentArtifact) => {
    const bytes = Uint8Array.from(
      atob(artifact.attachment.bytesBase64),
      (char) => char.charCodeAt(0),
    );
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = artifact.attachment.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatusMessage(`Staženo · ${artifact.attachment.fileName}`);
  };

  const onSend = async (artifact: DocumentArtifact) => {
    const toEmail = contactEmail ?? artifact.context.contactEmail;
    if (toEmail === null || toEmail.length === 0) {
      setStatusMessage('Chybí e-mail příjemce.');
      return;
    }
    const host = getOfficeAutomationHost();
    await host.mailSession.sendSystemMail({
      mailboxId: DEFAULT_PILOT_MAILBOX_ID,
      toEmail,
      subject: `${artifact.label} · ${artifact.context.partnerName}`,
      body: `V příloze zasíláme ${artifact.label}.`,
      caseId: projectId,
      origin: 'OFFICE',
      attachments: [
        {
          fileName: artifact.attachment.fileName,
          mimeType: 'application/pdf',
          bytesBase64: artifact.attachment.bytesBase64,
          documentId: artifact.id,
        },
      ],
    });
    setStatusMessage(`Odesláno · ${artifact.label}`);
    refresh();
  };

  return (
    <section
      className="office-pilot-docs"
      data-testid="pilot-project-documents"
      data-project-id={projectId}
    >
      <h4 className="office-pilot-inbox__title">Dokumenty projektu</h4>
      <p className="office-pilot-detail__meta">
        Historie · stav · náhled · odeslání · stažení
      </p>

      {documents.length === 0 ? (
        <p
          className="office-pilot-ws__panel-body"
          data-testid="pilot-project-documents-empty"
        >
          Zatím žádné dokumenty.
        </p>
      ) : (
        <ul
          className="office-pilot-docs__list"
          data-testid="pilot-project-documents-list"
        >
          {documents.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  selectedId === item.id
                    ? 'office-pilot-docs__item office-pilot-docs__item--active'
                    : 'office-pilot-docs__item'
                }
                data-testid={`pilot-project-document-${item.type}`}
                onClick={() => setSelectedId(item.id)}
              >
                <strong>{item.label}</strong>
                <span>
                  v{item.version} · {item.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected !== null ? (
        <div
          className="office-pilot-docs__detail"
          data-testid="pilot-project-document-detail"
        >
          <p>
            <strong>{selected.label}</strong> · {selected.attachment.fileName}
          </p>
          <p className="office-pilot-detail__meta" data-testid="pilot-project-document-status">
            Stav: {selected.status} · zdroj: {selected.sourcePath}
          </p>
          <pre
            className="office-pilot-docs__preview"
            data-testid="pilot-project-document-preview"
          >
            {`PDF ${selected.attachment.byteLength} B · ${selected.label}\nProjekt ${selected.projectId}\nPartner ${selected.context.partnerName}`}
          </pre>
          <div className="office-pilot-docs__actions">
            <button
              type="button"
              className="platform-btn platform-btn--secondary"
              data-testid="pilot-project-document-download"
              onClick={() => onDownload(selected)}
            >
              Download
            </button>
            <button
              type="button"
              className="platform-btn"
              data-testid="pilot-project-document-send"
              onClick={() => void onSend(selected)}
            >
              Send
            </button>
          </div>
        </div>
      ) : null}

      {statusMessage !== null ? (
        <p className="office-pilot-detail__meta" data-testid="pilot-project-document-toast">
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
