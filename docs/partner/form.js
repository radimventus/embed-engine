(() => {
  const form = document.getElementById('meeting-form');
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('status');
  const endpoint = 'https://script.google.com/macros/s/AKfycbzQ2-YW9DputxDhBVLGRK8byxhLfoju1Obo5OneqAABWK6KuQubzDwM8zLz2z_yDKTj3g/exec';
  let pending = false, completed = false;
  const started = Date.now();
  const id = crypto.randomUUID();
  const say = message => { status.textContent = message; status.focus(); };
  const safe = value => /^[=+@\-\t\r\n]/.test(value) ? "'" + value : value;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || completed || !form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    const name = fields.name.trim(), company = fields.company.trim(), contact = fields.contact.trim();
    const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const phoneOK = /^[+\d() .-]+$/.test(contact) && contact.replace(/\D/g, '').length >= 9 && contact.replace(/\D/g, '').length <= 15;
    if (!name || !company || !(emailOK || phoneOK)) { say('Vyplňte prosím jméno, firmu a platný e-mail nebo telefon.'); return; }
    if (fields.fax || Date.now() - started < 1500) { say('Odeslání nebylo přijato. Zkontrolujte údaje a zkuste to znovu.'); return; }
    const timestamp = new Date().toISOString();
    const body = {
      channel: 'web', source: 'CONIS_PARTNER', leadId: id,
      name, company, email: emailOK ? contact : 'Neuveden (kontakt telefonem)', phone: phoneOK ? contact : '', timestamp,
      segment: 'PARTNER - zadost o schuzku', recommendation: 'Domluvit osobni schuzku. Kontaktovat pouze na vyplneny e-mail nebo telefon.', url: location.origin + location.pathname,
      sheetColumns: {'Lead ID': id, 'Datum a čas': timestamp, Source: 'CONIS_PARTNER', 'Jméno': safe(name), Firma: safe(company), 'E-mail': emailOK ? safe(contact) : '', Telefon: phoneOK ? safe(contact) : '', URL: location.origin + location.pathname},
      mail: {subject: 'CONIS partner — žádost o schůzku — ' + company.replace(/[\r\n]/g, ' '), body: ['Žádost o schůzku z conis.cz/partner', '', 'Jméno: ' + name, 'Firma: ' + company, 'Kontakt: ' + contact, '', 'ID: ' + id, 'Čas: ' + timestamp].join('\n')}
    };
    pending = true; button.disabled = true; button.textContent = 'Odesílám…'; say('');
    try {
      const response = await fetch(endpoint, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=UTF-8'}, body: JSON.stringify(body), redirect: 'follow', signal: AbortSignal.timeout(30000)});
      const result = await response.json();
      if (!response.ok || result.ok !== true || result.leadId !== id) throw new Error('Not confirmed');
      completed = true; form.reset(); button.textContent = 'Žádost odeslána';
      say('Děkujeme. Vaše žádost byla odeslána. Ozveme se vám a domluvíme schůzku.');
    } catch (_) {
      say('Odeslání se nepodařilo potvrdit. Údaje zůstaly vyplněné. Napište prosím na kontakt@conis.cz nebo zavolejte +420 725 020 757; žádost již mohla být přijata.');
    } finally {
      pending = false;
      if (!completed) { button.disabled = false; button.textContent = 'Domluvit schůzku'; }
    }
  });
})();
