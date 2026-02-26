/**
 * BESTAL — Main JavaScript
 * Handles: sticky header, mobile menu, desktop dropdowns,
 * hero slider init, gallery init, copyright year.
 */

(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    function updateHeader() {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  function initMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    if (!hamburger || !mobileNav) return;

    function openMenu() {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        closeMenu();
      }
    });
  }

  function initDesktopDropdowns() {
    const groups = document.querySelectorAll('.main-nav__item--group');
    if (!groups.length) return;
    const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    function setExpanded(group, expanded) {
      group.classList.toggle('open', expanded);
      const toggle = group.querySelector('.main-nav__toggle');
      if (toggle) toggle.setAttribute('aria-expanded', String(expanded));
    }

    function closeAll(except) {
      groups.forEach(function (group) {
        if (group === except) return;
        setExpanded(group, false);
      });
    }

    groups.forEach(function (group) {
      const toggle = group.querySelector('.main-nav__toggle');

      group.addEventListener('mouseenter', function () {
        if (isTouchLike) return;
        closeAll(group);
        setExpanded(group, true);
      });

      group.addEventListener('mouseleave', function () {
        if (isTouchLike) return;
        if (!group.matches(':focus-within')) {
          setExpanded(group, false);
        }
      });

      group.addEventListener('focusin', function () {
        closeAll(group);
        setExpanded(group, true);
      });

      group.addEventListener('focusout', function () {
        window.requestAnimationFrame(function () {
          if (!group.matches(':focus-within')) {
            setExpanded(group, false);
          }
        });
      });

      group.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          setExpanded(group, false);
          const toggle = group.querySelector('.main-nav__toggle');
          if (toggle) toggle.focus();
        }
      });
    });

    document.addEventListener('click', function (e) {
      const clickedInNav = e.target.closest('.main-nav__item--group');
      if (!clickedInNav) closeAll();
    });
  }

  function initActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.main-nav__link, .main-nav__sublink, .mobile-nav__link').forEach(function (link) {
      const href = (link.getAttribute('href') || '').split('/').pop();
      if (href === currentPage) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        const parentGroup = link.closest('.main-nav__item--group');
        if (parentGroup) parentGroup.classList.add('is-active');
      }
    });
  }

  function initCopyrightYear() {
    const el = document.getElementById('copyright-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function initHeroSwiper() {
    const el = document.getElementById('hero-swiper');
    if (!el || typeof Swiper === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    new Swiper(el, {
      loop: true,
      speed: prefersReduced ? 0 : 700,
      autoplay: prefersReduced ? false : {
        delay: 5500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      pagination: {
        el: '.hero-swiper .swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          return '<button class="' + className + '" aria-label="Slajd ' + (index + 1) + '"></button>';
        },
      },
      navigation: {
        nextEl: '.hero-swiper .swiper-button-next',
        prevEl: '.hero-swiper .swiper-button-prev',
      },
      a11y: {
        prevSlideMessage: 'Poprzednie zdjęcie',
        nextSlideMessage: 'Następne zdjęcie',
        paginationBulletMessage: 'Przejdź do slajdu {{index}}',
      },
      keyboard: {
        enabled: true,
      },
    });
  }

  function initGallery() {
    if (typeof PhotoSwipeLightbox === 'undefined') return;

    const lightbox = new PhotoSwipeLightbox({
      gallery: '.gallery-grid',
      children: '.gallery-item',
      pswpModule: PhotoSwipe,
      bgOpacity: 0.92,
    });

    lightbox.init();
  }

  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const style = document.createElement('style');
    style.textContent = `
      .reveal {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
      }
      .reveal.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.service-card, .stat, .cert-badge, .gallery-item, .value-card, .trust-item').forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  function initCookieConsent() {
    const bar = document.getElementById('cookie-bar');
    const settingsBtn = document.getElementById('cookie-settings');
    if (!bar) return;

    const COOKIE_KEY = 'bestal_cookie_consent';

    function getCookie(name) {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    }

    function setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
    }

    function hideCookieBar() {
      bar.setAttribute('aria-hidden', 'true');
      bar.style.display = 'none';
    }

    function showCookieBar() {
      bar.setAttribute('aria-hidden', 'false');
      bar.style.display = 'flex';
    }

    if (!getCookie(COOKIE_KEY)) {
      showCookieBar();
    }

    const btnAccept = document.getElementById('cookie-accept');
    const btnDeny = document.getElementById('cookie-deny');

    if (btnAccept) {
      btnAccept.addEventListener('click', function () {
        setCookie(COOKIE_KEY, 'accepted', 365);
        hideCookieBar();
      });
    }

    if (btnDeny) {
      btnDeny.addEventListener('click', function () {
        setCookie(COOKIE_KEY, 'denied', 30);
        hideCookieBar();
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener('click', showCookieBar);
    }
  }

  ready(function () {
    initStickyHeader();
    initMobileNav();
    initDesktopDropdowns();
    initActiveNav();
    initCopyrightYear();
    initHeroSwiper();
    initGallery();
    initScrollReveal();
    initCookieConsent();
  });
})();
