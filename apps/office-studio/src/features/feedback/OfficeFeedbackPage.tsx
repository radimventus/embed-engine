import {useEffect, useState} from 'react';
import {getManagerFeedback, listManagerFeedback, type ManagerFeedbackRecord} from '@embed-engine/platform-access';

function date(value: string) {
  return new Intl.DateTimeFormat('cs-CZ', {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(value));
}

export function OfficeFeedbackPage() {
  const [entries, setEntries] = useState<readonly ManagerFeedbackRecord[]>([]);
  const [selected, setSelected] = useState<ManagerFeedbackRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void listManagerFeedback().then(items => {if (active) {setEntries(items); setSelected(items[0] ?? null);}})
      .catch(reason => {if (active) setError(reason instanceof Error ? reason.message : 'Feedback se nepodařilo načíst.');})
      .finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, []);
  const open = (feedbackId: string) => {
    setError(null);
    void getManagerFeedback(feedbackId).then(setSelected).catch(reason => setError(reason instanceof Error ? reason.message : 'Detail se nepodařilo načíst.'));
  };
  return <section className="office-feedback" data-testid="office-feedback">
    <header className="office-dashboard__header">
      <p className="office-dashboard__eyebrow">Komunikace</p>
      <h1 className="office-dashboard__title">Feedback</h1>
      <p className="office-dashboard__lead">Zpětná vazba odeslaná z Manager účtů.</p>
    </header>
    {error && <p className="office-feedback__error" role="alert">{error}</p>}
    <div className="office-feedback__workspace">
      <div className="office-feedback__list" aria-label="Seznam feedbacků">
        {loading ? <p className="office-list__meta">Načítám…</p> : entries.length === 0 ? <p className="office-list__meta">Žádný feedback.</p> : entries.map(entry =>
          <button type="button" key={entry.feedbackId} className={selected?.feedbackId === entry.feedbackId ? 'office-feedback__item office-feedback__item--active' : 'office-feedback__item'} onClick={() => open(entry.feedbackId)}>
            <strong>{entry.projectId ?? 'Bez projektu'}</strong>
            <span>{entry.message}</span><small>{date(entry.createdAt)} · {entry.notificationStatus ?? 'NEW'}</small>
          </button>)}
      </div>
      <article className="office-feedback__detail" aria-label="Detail feedbacku">
        {selected ? <>
          <h2>Detail feedbacku</h2>
          <dl>
            <div><dt>Datum a čas</dt><dd>{date(selected.createdAt)}</dd></div>
            <div><dt>Autor / účet</dt><dd>{selected.userId ?? 'Neuvedeno'}</dd></div>
            <div><dt>Projekt</dt><dd>{selected.projectId ?? 'Neuvedeno'}</dd></div>
            <div><dt>Zdroj</dt><dd>{selected.surface}{selected.currentUrl ? ` · ${selected.currentUrl}` : ''}</dd></div>
            <div><dt>Stav</dt><dd>{selected.status} · notifikace {selected.notificationStatus ?? 'nezaznamenána'}</dd></div>
          </dl>
          <p className="office-feedback__message">{selected.message}</p>
        </> : <p className="office-list__meta">Vyberte feedback.</p>}
      </article>
    </div>
  </section>;
}
