(function () {
  'use strict';

  const STORAGE_KEY = 'bestal_calc_draft_v1';
  const REQUIRED_FIELD_IDS = ['cf-name', 'cf-email', 'cf-msg', 'cf-rodo'];

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function getCalculatorDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.tab || !parsed.inputs) return null;
      return parsed;
    } catch (_error) {
      return null;
    }
  }

  function buildCalculatorLines(draft) {
    const lines = [];
    const savedAt = draft.savedAt ? new Date(draft.savedAt).toLocaleString('pl-PL') : '';

    lines.push('Dane z kalkulatora BESTAL');
    if (savedAt) lines.push('Data zapisu: ' + savedAt);
    lines.push('Typ kalkulacji: ' + (draft.tabLabel || draft.tab || '-'));
    lines.push('');
    lines.push('Wprowadzone wartości:');

    Object.keys(draft.inputs || {}).forEach(function (key) {
      const item = draft.inputs[key];
      if (!item || item.value === '') return;
      lines.push('- ' + item.label + ': ' + item.value);
    });

    lines.push('');
    lines.push('Wyniki:');
    Object.keys(draft.results || {}).forEach(function (key) {
      const item = draft.results[key];
      if (!item || !item.value || item.value === '-') return;
      lines.push('- ' + item.label + ': ' + item.value);
    });

    return lines;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderDraftSummary(target, draft) {
    if (!target) return;

    const inputs = Object.keys(draft.inputs || {})
      .map(function (key) { return draft.inputs[key]; })
      .filter(function (item) { return item && item.value !== ''; })
      .slice(0, 4);

    const results = Object.keys(draft.results || {})
      .map(function (key) { return draft.results[key]; })
      .filter(function (item) { return item && item.value && item.value !== '-'; })
      .slice(0, 3);

    const list = [];
    if (draft.tabLabel) list.push('Typ: ' + draft.tabLabel);
    if (draft.savedAt) list.push('Zapisano: ' + new Date(draft.savedAt).toLocaleString('pl-PL'));
    inputs.forEach(function (item) { list.push(item.label + ': ' + item.value); });
    results.forEach(function (item) { list.push(item.label + ': ' + item.value); });

    target.innerHTML = '<ul>' + list.map(function (line) {
      return '<li>' + escapeHtml(line) + '</li>';
    }).join('') + '</ul>';
  }

  function setResult(el, text, cls) {
    if (!el) return;
    el.textContent = text || '';
    el.classList.remove('is-success', 'is-error');
    if (cls) el.classList.add(cls);
  }

  function setFieldInvalid(field, invalid) {
    if (!field) return;
    field.classList.toggle('is-invalid', invalid);
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function isFilledField(field) {
    if (!field) return false;
    if (field.type === 'checkbox') return !!field.checked;
    return String(field.value || '').trim() !== '';
  }

  function validateRequiredFields(form) {
    let valid = true;
    REQUIRED_FIELD_IDS.forEach(function (id) {
      const field = form.querySelector('#' + id);
      const ok = isFilledField(field);
      setFieldInvalid(field, !ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  function focusFirstInvalidField(form) {
    for (let i = 0; i < REQUIRED_FIELD_IDS.length; i += 1) {
      const field = form.querySelector('#' + REQUIRED_FIELD_IDS[i]);
      if (!isFilledField(field)) {
        field.focus();
        return;
      }
    }
  }

  function openMailtoFallback(payload) {
    const subject = payload.topic
      ? 'Zapytanie BESTAL - ' + payload.topic
      : 'Zapytanie BESTAL - formularz kontaktowy';

    const lines = [
      'Imię i nazwisko: ' + payload.name,
      'Firma: ' + (payload.company || '-'),
      'E-mail: ' + payload.email,
      'Telefon: ' + (payload.phone || '-'),
      'Zgoda RODO: ' + (payload.rodoConsent ? 'Tak' : 'Nie'),
      '',
      'Wiadomość:',
      payload.message
    ];

    const mailto = 'mailto:bestal@bestal.pl?subject=' +
      encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));

    window.location.href = mailto;
  }

  ready(function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const topicField = document.getElementById('cf-topic');
    const messageField = document.getElementById('cf-msg');
    const calcBox = document.getElementById('calc-transfer-box');
    const calcSummary = document.getElementById('calc-transfer-summary');
    const calcHidden = document.getElementById('cf-calc-draft');
    const submitBtn = document.getElementById('contact-submit');
    const resultEl = document.getElementById('contact-form-result');
    const fromCalculator = new URLSearchParams(window.location.search).get('from') === 'calculator';

    REQUIRED_FIELD_IDS.forEach(function (id) {
      const field = form.querySelector('#' + id);
      if (!field) return;

      const eventName = field.type === 'checkbox' ? 'change' : 'input';
      field.addEventListener(eventName, function () {
        setFieldInvalid(field, !isFilledField(field));
      });
    });

    const draft = getCalculatorDraft();

    if (draft) {
      if (calcBox) calcBox.hidden = false;
      if (calcHidden) calcHidden.value = JSON.stringify(draft);
      renderDraftSummary(calcSummary, draft);

      const messageBlock = buildCalculatorLines(draft).join('\n');
      if (messageField && (!messageField.value.trim() || fromCalculator)) {
        messageField.value = messageBlock;
      }

      if (topicField && !topicField.value) {
        topicField.value = 'Inne zapytanie';
      }
    }

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      setResult(resultEl, '');

      const valid = validateRequiredFields(form);
      if (!valid) {
        focusFirstInvalidField(form);
        setResult(
          resultEl,
          'Uzupełnij wymagane pola i zaakceptuj zgodę RODO: imię i nazwisko, e-mail, wiadomość oraz checkbox zgody.',
          'is-error'
        );
        return;
      }

      const formData = new FormData(form);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        company: String(formData.get('company') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        topic: String(formData.get('topic') || '').trim(),
        message: String(formData.get('message') || '').trim(),
        calculatorDraft: formData.get('calculatorDraft') ? String(formData.get('calculatorDraft')) : '',
        rodoConsent: formData.get('rodoConsent') === 'on'
      };

      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-disabled', 'true');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.textContent = 'Wysyłanie…';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.status === 404) {
          setResult(resultEl, 'Nie znaleziono endpointu formularza. Otwieram domyślny klient poczty.', 'is-error');
          openMailtoFallback(payload);
          return;
        }

        if (!response.ok) {
          const err = await response.json().catch(function () { return {}; });
          throw new Error(err.error || 'Nie udało się wysłać formularza.');
        }

        setResult(resultEl, 'Wiadomość została wysłana. Dziękujemy, skontaktujemy się wkrótce.', 'is-success');
        form.reset();
        localStorage.removeItem(STORAGE_KEY);
        if (calcHidden) calcHidden.value = '';
        if (calcBox) calcBox.hidden = true;
      } catch (error) {
        setResult(resultEl, error.message || 'Wystąpił błąd podczas wysyłki formularza. Otwieram klienta poczty.', 'is-error');
        openMailtoFallback(payload);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.setAttribute('aria-disabled', 'false');
          submitBtn.removeAttribute('aria-busy');
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  });
})();
