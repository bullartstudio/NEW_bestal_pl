/**
 * BESTAL — Demo Popup
 *
 * Wyświetla pływający widget zachęcający do kliknięcia,
 * po kliknięciu otwiera popup decyzyjny z formularzem.
 *
 * Dane firmy przez:
 * 1. window.DEMO_POPUP_CONFIG = { company, industry, city, formEndpoint }
 * 2. URL: ?firma=Nazwa&branza=branzy&miasto=Miasto
 */

(function () {
  'use strict';

  var DEFAULTS = {
    company:      '',
    industry:     '',
    city:         '',
    formEndpoint: '/api/demo-inquiry',
    widgetDelay:  2500    /* ms — po ilu ms pojawia się widget */
  };

  function getConfig() {
    var cfg = Object.assign({}, DEFAULTS, window.DEMO_POPUP_CONFIG || {});
    var params = new URLSearchParams(window.location.search);
    if (params.get('firma'))  cfg.company  = params.get('firma');
    if (params.get('branza')) cfg.industry = params.get('branza');
    if (params.get('miasto')) cfg.city     = params.get('miasto');
    return cfg;
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ================================================================
     HTML — widget pływający
     ================================================================ */
  function buildWidgetHTML(cfg) {
    return '<div id="dp-widget" class="dp-widget" role="complementary" aria-label="Ocena projektu demo">' +
      '<button class="dp-widget__btn" id="dp-widget-btn" type="button" aria-haspopup="dialog">' +
        '<span class="dp-widget__pulse" aria-hidden="true"></span>' +
        '<span class="dp-widget__icon" aria-hidden="true">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
            '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>' +
          '</svg>' +
        '</span>' +
        '<span class="dp-widget__text">' +
          '<span class="dp-widget__label">' + (cfg.company ? 'Projekt demo dla ' + esc(cfg.company) : 'Projekt demo strony internetowej') + '</span>' +
          '<span class="dp-widget__cta">Czy ta strona jest dla Ciebie? Kliknij →</span>' +
        '</span>' +
        '<button class="dp-widget__dismiss" id="dp-widget-dismiss" type="button" aria-label="Zamknij widget">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</button>' +
    '</div>';
  }

  /* ================================================================
     HTML — popup / modal
     ================================================================ */
  function buildPopupHTML(cfg) {
    return '<div id="dp-overlay" class="dp-overlay" role="dialog" aria-modal="true" aria-labelledby="dp-heading" tabindex="-1">' +
      '<div class="dp-modal">' +

      /* krok 1 — decyzja */
      '<div class="dp-step" id="dp-step-decision">' +
        '<p class="dp-eyebrow">Projekt demo</p>' +
        '<h2 id="dp-heading" class="dp-heading">' +
          (cfg.company
            ? 'Czy taka strona byłaby odpowiednia dla <span class="dp-company">' + esc(cfg.company) + '</span>?'
            : 'Czy taka strona byłaby odpowiednia dla Państwa firmy?') +
        '</h2>' +
        (cfg.industry || cfg.city
          ? '<p class="dp-lead">Przygotowałem wstępny projekt strony dopasowany do firmy' +
              (cfg.industry ? ' z branży <strong>' + esc(cfg.industry) + '</strong>' : '') +
              (cfg.city    ? ' w <strong>' + esc(cfg.city) + '</strong>'             : '') +
            '.</p>'
          : '') +
        '<p class="dp-lead">Strona jest gotowa w około <strong>70%</strong> i może zostać uruchomiona w ciągu 2–3 dni. ' +
          'Możemy ją uruchomić w obecnej formie lub wprowadzić drobne zmiany.</p>' +
        '<div class="dp-actions">' +
          '<button class="dp-btn dp-btn--primary" id="dp-btn-accept" type="button">' +
            '<span class="dp-btn-icon" aria-hidden="true">✅</span> Tak, chcę uruchomić tę stronę' +
          '</button>' +
          '<button class="dp-btn dp-btn--outline" id="dp-btn-changes" type="button">' +
            '<span class="dp-btn-icon" aria-hidden="true">✏️</span> Chcę wprowadzić kilka zmian' +
          '</button>' +
        '</div>' +
        '<p class="dp-notice">Projekt demo jest dostępny przez <strong>7 dni</strong>, ponieważ przygotowuję kolejne projekty dla innych firm.</p>' +
      '</div>' +

      /* krok 2a — akceptacja */
      '<div class="dp-step dp-step--hidden" id="dp-step-accept">' +
        '<button class="dp-back" id="dp-back-accept" type="button">← Wróć</button>' +
        '<p class="dp-eyebrow">Uruchomienie strony</p>' +
        '<h2 class="dp-heading">Uruchomienie strony</h2>' +
        '<p class="dp-lead">Świetnie — przygotuję wersję końcową strony oraz wycenę wdrożenia.<br>' +
          'Strona może zostać uruchomiona w ciągu <strong>2–3 dni</strong>.</p>' +
        '<form class="dp-form" id="dp-form-accept" novalidate>' +
          '<input type="hidden" name="type" value="accept">' +
          '<input type="hidden" name="company" value="' + esc(cfg.company) + '">' +
          buildField('dp-a-name',   'Imię i nazwisko', 'name',  'text',  'name',  true) +
          buildField('dp-a-phone',  'Telefon',         'phone', 'tel',   'tel',   true) +
          buildField('dp-a-email',  'Adres email',     'email', 'email', 'email', true) +
          '<div class="dp-field">' +
            '<label class="dp-label" for="dp-a-notes">Czy chcieliby Państwo coś zmienić przed uruchomieniem? <span class="dp-optional">(opcjonalne)</span></label>' +
            '<textarea class="dp-textarea" id="dp-a-notes" name="notes" rows="3" placeholder="Np. zmiana koloru, inne zdjęcie…"></textarea>' +
          '</div>' +
          '<div class="dp-form-result" id="dp-result-accept" role="status" aria-live="polite"></div>' +
          '<button class="dp-btn dp-btn--primary dp-btn--full" type="submit" id="dp-submit-accept">Poproś o wycenę i uruchomienie strony</button>' +
        '</form>' +
        '<p class="dp-notice">Projekt demo jest dostępny przez <strong>7 dni</strong>.</p>' +
      '</div>' +

      /* krok 2b — zmiany */
      '<div class="dp-step dp-step--hidden" id="dp-step-changes">' +
        '<button class="dp-back" id="dp-back-changes" type="button">← Wróć</button>' +
        '<p class="dp-eyebrow">Prośba o zmiany</p>' +
        '<h2 class="dp-heading">Jakie zmiany chcieliby Państwo wprowadzić?</h2>' +
        '<p class="dp-lead">Proszę napisać jakie elementy strony chcieliby Państwo zmienić lub dodać.<br>' +
          'Na tej podstawie przygotuję poprawioną wersję projektu.</p>' +
        '<form class="dp-form" id="dp-form-changes" novalidate>' +
          '<input type="hidden" name="type" value="changes">' +
          '<input type="hidden" name="company" value="' + esc(cfg.company) + '">' +
          buildField('dp-c-name',   'Imię i nazwisko', 'name',  'text',  'name',  true) +
          buildField('dp-c-phone',  'Telefon',         'phone', 'tel',   'tel',   true) +
          buildField('dp-c-email',  'Adres email',     'email', 'email', 'email', true) +
          '<div class="dp-field">' +
            '<label class="dp-label" for="dp-c-changes">Jakie zmiany chcieliby Państwo wprowadzić? <span aria-hidden="true">*</span></label>' +
            '<textarea class="dp-textarea" id="dp-c-changes" name="changes" rows="4" placeholder="Np. inne kolory, inny układ sekcji…" required></textarea>' +
          '</div>' +
          '<div class="dp-form-result" id="dp-result-changes" role="status" aria-live="polite"></div>' +
          '<button class="dp-btn dp-btn--primary dp-btn--full" type="submit" id="dp-submit-changes">Wyślij uwagi do projektu</button>' +
        '</form>' +
        '<p class="dp-notice">Projekt demo jest dostępny przez <strong>7 dni</strong>.</p>' +
      '</div>' +

      /* krok 3 — podziękowanie */
      '<div class="dp-step dp-step--hidden" id="dp-step-thanks">' +
        '<div class="dp-thanks-icon" aria-hidden="true">✅</div>' +
        '<h2 class="dp-heading">Dziękujemy!</h2>' +
        '<p class="dp-lead" id="dp-thanks-msg">Wrócimy do Państwa wkrótce.</p>' +
        '<button class="dp-btn dp-btn--outline dp-btn--full" id="dp-btn-close-thanks" type="button">Zamknij</button>' +
      '</div>' +

      '</div></div>';
  }

  function buildField(id, label, name, type, autocomplete, required) {
    return '<div class="dp-field">' +
      '<label class="dp-label" for="' + id + '">' + label +
        (required ? ' <span aria-hidden="true">*</span>' : '') +
      '</label>' +
      '<input class="dp-input" id="' + id + '" name="' + name + '" type="' + type + '" autocomplete="' + autocomplete + '"' +
        (required ? ' required' : '') + '>' +
    '</div>';
  }

  /* ================================================================
     Zarządzanie krokami
     ================================================================ */
  function showStep(id) {
    document.querySelectorAll('.dp-step').forEach(function (el) {
      el.classList.add('dp-step--hidden');
      el.setAttribute('aria-hidden', 'true');
    });
    var step = document.getElementById(id);
    if (!step) return;
    step.classList.remove('dp-step--hidden');
    step.removeAttribute('aria-hidden');
    var focusable = step.querySelector('button, input, textarea');
    if (focusable) focusable.focus();
  }

  /* ================================================================
     Otwarcie / zamknięcie popupu
     ================================================================ */
  function openPopup() {
    var overlay = document.getElementById('dp-overlay');
    if (!overlay) return;
    showStep('dp-step-decision');
    overlay.classList.add('dp-overlay--visible');
    document.body.classList.add('dp-body-locked');
    overlay.focus();
    /* schowaj widget na czas otwarcia */
    var widget = document.getElementById('dp-widget');
    if (widget) widget.classList.add('dp-widget--hidden');
  }

  function closePopup() {
    var overlay = document.getElementById('dp-overlay');
    if (!overlay) return;
    overlay.classList.remove('dp-overlay--visible');
    document.body.classList.remove('dp-body-locked');
    /* przywróć widget */
    var widget = document.getElementById('dp-widget');
    if (widget) widget.classList.remove('dp-widget--hidden');
  }

  /* ================================================================
     Walidacja + submit
     ================================================================ */
  function validateForm(form) {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (f) {
      var filled = f.value.trim() !== '';
      f.classList.toggle('dp-input--invalid', !filled);
      f.setAttribute('aria-invalid', filled ? 'false' : 'true');
      if (!filled) ok = false;
    });
    return ok;
  }

  function submitForm(form, resultEl, btn, successMsg) {
    if (!validateForm(form)) {
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Wysyłanie…';
    resultEl.textContent = '';
    resultEl.className = 'dp-form-result';

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data.pageUrl   = window.location.href;
    data.pageTitle = document.title;
    var cfg = getConfig();

    fetch(cfg.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Błąd serwera (' + res.status + ')');
      return res.json().catch(function () { return {}; });
    })
    .then(function () {
      var msg = document.getElementById('dp-thanks-msg');
      if (msg) msg.textContent = successMsg;
      showStep('dp-step-thanks');
    })
    .catch(function (err) {
      resultEl.textContent = err.message || 'Wystąpił błąd. Proszę spróbować ponownie.';
      resultEl.classList.add('dp-form-result--error');
      btn.disabled = false;
      btn.textContent = orig;
    });
  }

  /* ================================================================
     Trap fokusa w modalu
     ================================================================ */
  function trapFocus(e) {
    var overlay = document.getElementById('dp-overlay');
    if (!overlay || !overlay.classList.contains('dp-overlay--visible')) return;
    var focusable = Array.from(overlay.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled])'
    )).filter(function (el) { return !el.closest('.dp-step--hidden'); });
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === 'Escape') closePopup();
  }

  /* ================================================================
     Inicjalizacja
     ================================================================ */
  function init() {
    var cfg = getConfig();

    /* wstrzyknij widget + popup */
    var widgetWrap = document.createElement('div');
    widgetWrap.innerHTML = buildWidgetHTML(cfg);
    document.body.appendChild(widgetWrap.firstChild);

    var popupWrap = document.createElement('div');
    popupWrap.innerHTML = buildPopupHTML(cfg);
    document.body.appendChild(popupWrap.firstChild);

    /* widget — otwórz popup */
    document.getElementById('dp-widget-btn').addEventListener('click', function (e) {
      if (e.target.closest('#dp-widget-dismiss')) return;
      openPopup();
    });

    /* widget — zamknij widget (X) */
    document.getElementById('dp-widget-dismiss').addEventListener('click', function (e) {
      e.stopPropagation();
      var widget = document.getElementById('dp-widget');
      if (widget) {
        widget.classList.add('dp-widget--gone');
      }
    });

    /* przyciski decyzji */
    document.getElementById('dp-btn-accept').addEventListener('click', function () { showStep('dp-step-accept'); });
    document.getElementById('dp-btn-changes').addEventListener('click', function () { showStep('dp-step-changes'); });

    /* przyciski wróć */
    document.getElementById('dp-back-accept').addEventListener('click', function () { showStep('dp-step-decision'); });
    document.getElementById('dp-back-changes').addEventListener('click', function () { showStep('dp-step-decision'); });

    /* kliknięcie tła */
    document.getElementById('dp-overlay').addEventListener('click', function (e) {
      if (e.target === this) closePopup();
    });

    /* zamknij po podziękowaniu */
    document.getElementById('dp-btn-close-thanks').addEventListener('click', closePopup);

    /* czyszczenie błędów przy wpisywaniu */
    document.querySelectorAll('.dp-input, .dp-textarea').forEach(function (f) {
      f.addEventListener('input', function () {
        f.classList.remove('dp-input--invalid');
        f.setAttribute('aria-invalid', 'false');
      });
    });

    /* formularze */
    document.getElementById('dp-form-accept').addEventListener('submit', function (e) {
      e.preventDefault();
      submitForm(this, document.getElementById('dp-result-accept'), document.getElementById('dp-submit-accept'),
        'Przygotujemy wycenę i skontaktujemy się wkrótce. Strona zostanie uruchomiona w ciągu 2–3 dni.');
    });
    document.getElementById('dp-form-changes').addEventListener('submit', function (e) {
      e.preventDefault();
      submitForm(this, document.getElementById('dp-result-changes'), document.getElementById('dp-submit-changes'),
        'Otrzymaliśmy Państwa uwagi. Przygotujemy poprawioną wersję projektu i skontaktujemy się wkrótce.');
    });

    document.addEventListener('keydown', trapFocus);

    /* widget pojawia się po opóźnieniu */
    var widget = document.getElementById('dp-widget');
    if (widget) {
      setTimeout(function () { widget.classList.add('dp-widget--visible'); }, cfg.widgetDelay);
    }
  }

  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
