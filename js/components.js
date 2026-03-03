/**
 * BESTAL — Shared Components
 * Injects header & footer into every page.
 */

(function () {
  'use strict';

  const NAV_ITEMS = [
    {
      type: 'group',
      label: 'O firmie',
      href: 'o-firmie.html',
      children: [
        { href: 'o-firmie.html', label: 'O nas' },
        { href: 'certyfikaty.html', label: 'Certyfikaty' },
        { href: 'referencje.html', label: 'Referencje' },
      ],
    },
    {
      type: 'group',
      label: 'Oferta',
      href: 'oferta.html',
      children: [
        { href: 'prefabrykacja.html', label: 'Prefabrykacja i produkcja' },
        { href: 'montaze.html', label: 'Montaż' },
        { href: 'remonty.html', label: 'Naprawy i modernizacje' },
        { href: 'serwis.html', label: 'Serwis' },
      ],
    },
    { type: 'link', href: 'kalkulator-produktow.html', label: 'Kalkulator' },
    { type: 'link', href: 'blog.html', label: 'Blog' },
    { type: 'link', href: 'kariera.html', label: 'Kariera' },
    { type: 'link', href: 'kontakt.html', label: 'Kontakt' },
  ];

  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function isItemActive(item, page) {
    if (item.type === 'link') return item.href === page;
    if (item.href === page) return true;
    return item.children.some(function (child) { return child.href === page; });
  }

  function buildDesktopNav() {
    const page = currentPage();

    return NAV_ITEMS.map(function (item) {
      const active = isItemActive(item, page);

      if (item.type === 'link') {
        return '<li class="main-nav__item">' +
          '<a class="main-nav__link' + (active ? ' active" aria-current="page' : '') +
          '" href="' + item.href + '">' + item.label + '</a>' +
          '</li>';
      }

      const children = item.children.map(function (child) {
        const childActive = child.href === page;
        return '<li>' +
          '<a class="main-nav__sublink' + (childActive ? ' active" aria-current="page' : '') +
          '" href="' + child.href + '">' + child.label + '</a>' +
          '</li>';
      }).join('');

      const groupHref = item.href || (item.children[0] && item.children[0].href) || '#';

      return '<li class="main-nav__item main-nav__item--group' + (active ? ' is-active' : '') + '">' +
        '<a class="main-nav__toggle" href="' + groupHref + '" aria-haspopup="true" aria-expanded="false">' +
        item.label +
        '<span class="main-nav__caret" aria-hidden="true"></span>' +
        '</a>' +
        '<ul class="main-nav__submenu" aria-label="' + item.label + '">' + children + '</ul>' +
        '</li>';
    }).join('');
  }

  function buildMobileNav() {
    const page = currentPage();

    return NAV_ITEMS.map(function (item) {
      const active = isItemActive(item, page);

      if (item.type === 'link') {
        return '<a class="mobile-nav__link' + (active ? ' active" aria-current="page' : '') +
          '" href="' + item.href + '">' + item.label + '</a>';
      }

      const children = item.children.map(function (child) {
        const childActive = child.href === page;
        return '<a class="mobile-nav__link mobile-nav__link--child' + (childActive ? ' active" aria-current="page' : '') +
          '" href="' + child.href + '">' + child.label + '</a>';
      }).join('');

      return '<details class="mobile-nav__group"' + (active ? ' open' : '') + '>' +
        '<summary class="mobile-nav__group-toggle">' + item.label + '<span class="mobile-nav__caret" aria-hidden="true"></span></summary>' +
        '<div class="mobile-nav__submenu">' + children + '</div>' +
        '</details>';
    }).join('');
  }

  function headerHTML() {
    return `
<a class="skip-link" href="#main">Przejdź do treści</a>

<header class="site-header" role="banner">
  <div class="container">
    <div class="header-inner">
      <a href="index.html" class="header-logo" aria-label="PZRE BESTAL - strona główna">
        <img src="assets/media/layouts/default/images/logo.png"
             alt="Logo PZRE BESTAL" width="160" height="52">
      </a>
      <nav class="main-nav" role="navigation" aria-label="Nawigacja główna">
        <ul class="main-nav__list">${buildDesktopNav()}</ul>
      </nav>
      <div class="header-tools">
        <button class="hamburger" id="hamburger"
                aria-controls="mobile-nav"
                aria-expanded="false"
                aria-label="Otwórz menu nawigacji">
          <span class="hamburger__bar" aria-hidden="true"></span>
          <span class="hamburger__bar" aria-hidden="true"></span>
          <span class="hamburger__bar" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  </div>
</header>

<nav id="mobile-nav" class="mobile-nav" role="navigation" aria-label="Nawigacja mobilna">
  ${buildMobileNav()}
</nav>`;
  }

  function footerHTML() {
    return `
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-compact">

      <div class="footer-brand">
        <img class="footer-col__logo"
             src="assets/media/obrazy/pliki/logo.png"
             alt="Logo PZRE BESTAL" width="180" height="75" loading="lazy">
        <p class="footer-col__desc">
          PZRE BESTAL Sp. z&nbsp;o.o. &mdash; kompleksowe usługi dla przemysłu
          energetycznego, petrochemicznego i&nbsp;chemicznego od 2000&nbsp;roku.
        </p>
      </div>

      <div>
        <div class="footer-col__title">Kontakt i adresy</div>
        <div class="footer-contact">
          <div class="footer-contact__item">
            <svg class="footer-contact__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.94a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1.18h3a2 2 0 012 1.72 12 12 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12 12 0 002.81.7A2 2 0 0122 16.92z"/></svg>
            <a href="tel:+48323270094">+48 32 327 00 94</a>
          </div>
          <div class="footer-contact__item">
            <svg class="footer-contact__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <a href="mailto:bestal@bestal.pl">bestal@bestal.pl</a>
          </div>
          <div class="footer-contact__item">
            <svg class="footer-contact__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Al.&nbsp;Roździeńskiego&nbsp;188B, 40-203&nbsp;Katowice</span>
          </div>
          <div class="footer-contact__item">
            <svg class="footer-contact__icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>ul.&nbsp;Przemysłowa&nbsp;47, 43-100&nbsp;Tychy</span>
          </div>
        </div>
      </div>

      <div>
        <div class="footer-col__title">Strony</div>
        <nav aria-label="Mapa podstron">
          <ul class="footer-links-grid">
            <li><a href="o-firmie.html">O firmie</a></li>
            <li><a href="prefabrykacja.html">Prefabrykacja</a></li>
            <li><a href="certyfikaty.html">Certyfikaty</a></li>
            <li><a href="montaze.html">Montaż</a></li>
            <li><a href="referencje.html">Referencje</a></li>
            <li><a href="remonty.html">Naprawy</a></li>
            <li><a href="oferta.html">Oferta</a></li>
            <li><a href="serwis.html">Serwis</a></li>
            <li><a href="kalkulator-produktow.html">Kalkulator</a></li>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="kariera.html">Kariera</a></li>
            <li><a href="kontakt.html">Kontakt</a></li>
          </ul>
        </nav>
      </div>

    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom__inner">
      <p class="footer-reg">NIP:&nbsp;646&nbsp;29&nbsp;29&nbsp;489 &bull; KRS:&nbsp;0000447343 &bull; REGON:&nbsp;243161440 &bull; BDO:&nbsp;000008591</p>
      <p class="footer-bottom__copy">&copy; <span id="copyright-year"></span> PZRE BESTAL Sp. z&nbsp;o.o.</p>
      <nav class="footer-bottom__links" aria-label="Linki stopki">
        <a href="rodo.html">Polityka prywatności</a>
        <a href="kontakt.html">Kontakt</a>
      </nav>
      <p class="footer-bottom__made-by">Strona wykonana przez <a href="https://twojastrona.tech/" target="_blank" rel="noopener noreferrer">twojastrona.tech</a></p>
    </div>
  </div>
</footer>

<div id="cookie-bar" class="cookie-bar" role="dialog" aria-live="polite"
     aria-label="Informacja o plikach cookies">
  <p class="cookie-bar__text">
    Niniejsza strona wykorzystuje pliki cookies. Korzystając ze strony,
    wyrażasz zgodę na ich używanie zgodnie z
    <a href="rodo.html" class="cookie-link">Polityką prywatności</a>.
  </p>
  <div class="cookie-bar__actions">
    <button id="cookie-deny" class="btn btn--ghost btn--cookie-deny">Odrzuć</button>
    <button id="cookie-accept" class="btn btn--primary">Zaakceptuj</button>
  </div>
</div>
<button id="cookie-settings" class="cookie-settings" type="button" aria-label="Ustawienia cookies">Cookies</button>`;
  }

  function mobileCTABarHTML() {
    return `<div class="mobile-cta-bar" role="navigation" aria-label="Szybki kontakt">
  <a class="mobile-cta-bar__btn mobile-cta-bar__btn--phone" href="tel:+48323270094">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.94a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1.18h3a2 2 0 012 1.72 12 12 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12 12 0 002.81.7A2 2 0 0122 16.92z"/></svg>
    +48 32 327 00 94
  </a>
  <a class="mobile-cta-bar__btn mobile-cta-bar__btn--contact" href="kontakt.html">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    Napisz do nas
  </a>
</div>`;
  }

  function loadDemoPopup() {
    const s = document.createElement('script');
    s.src = (document.querySelector('base') ? '' : '') + 'js/demo-popup.js';
    document.body.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const headerPlaceholder = document.getElementById('site-header-placeholder');
    if (headerPlaceholder) {
      headerPlaceholder.outerHTML = headerHTML();
    }

    const footerPlaceholder = document.getElementById('site-footer-placeholder');
    if (footerPlaceholder) {
      footerPlaceholder.outerHTML = footerHTML();
    }

    document.body.insertAdjacentHTML('beforeend', mobileCTABarHTML());

    loadDemoPopup();
  });
})();
