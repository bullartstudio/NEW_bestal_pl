(function () {
  'use strict';

  const cards = Array.from(document.querySelectorAll('.prefab-card'));
  const tabs = Array.from(document.querySelectorAll('.prefab-catalog__tab'));
  const title = document.getElementById('prefab-list-title');
  const meta = document.getElementById('prefab-list-meta');
  const empty = document.getElementById('prefab-empty');

  if (!cards.length || !tabs.length) return;

  const categoryTitles = {
    all: 'Wszystkie grupy prefabrykacji',
    ksztaltki: '1. Elementy rurociągów i kształtek',
    podparcia: '2. Podparcia i zawieszenia rurociągów',
    wymienniki: '3. Wymienniki ciepła i wężownice',
    giecie: '4. Gięcie - usługi obróbki',
    instalacje: '5. Instalacje przemysłowe i specjalne',
    konstrukcje: '6. Konstrukcje stalowe',
    materialy: '7. Materiały i normalia'
  };

  let activeFilter = 'all';

  function setTabState(nextFilter, shouldFocus) {
    tabs.forEach(function (tab) {
      const isActive = tab.dataset.filter === nextFilter;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive && shouldFocus) tab.focus();
    });
  }

  function countLabel(total) {
    if (total === 1) return 'pozycja';
    if (total >= 2 && total <= 4) return 'pozycje';
    return 'pozycji';
  }

  function applyFilters() {
    let visible = 0;

    cards.forEach(function (card) {
      const category = card.dataset.category || '';
      const show = activeFilter === 'all' || category === activeFilter;

      card.hidden = !show;
      if (show) visible += 1;
    });

    if (visible === 0 && activeFilter !== 'all') {
      activateFilter('all', false);
      return;
    }

    if (title) title.textContent = categoryTitles[activeFilter] || categoryTitles.all;
    if (meta) meta.textContent = visible + ' ' + countLabel(visible);
    if (empty) empty.hidden = visible !== 0;
  }

  function activateFilter(nextFilter, shouldFocus) {
    activeFilter = nextFilter || 'all';
    setTabState(activeFilter, shouldFocus);
    applyFilters();
  }

  function resolveNextFilter(clickedFilter) {
    if (!clickedFilter || clickedFilter === 'all') return 'all';
    if (clickedFilter === activeFilter) return 'all';
    return clickedFilter;
  }

  function onTabKeydown(event, tab) {
    const idx = tabs.indexOf(tab);
    let next = idx;

    if (event.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;

    event.preventDefault();
    activateFilter(tabs[next].dataset.filter, true);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateFilter(resolveNextFilter(tab.dataset.filter), false);
    });
    tab.addEventListener('keydown', function (event) {
      onTabKeydown(event, tab);
    });
  });

  activateFilter('all', false);
})();
