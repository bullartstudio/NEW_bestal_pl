(function () {
  'use strict';

  const listEl = document.getElementById('blog-list');
  const emptyEl = document.getElementById('blog-empty');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    try {
      return new Date(value).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_e) {
      return value;
    }
  }

  async function loadPosts() {
    try {
      const res = await fetch('/api/posts?limit=50');
      if (!res.ok) throw new Error('API unavailable');
      return await res.json();
    } catch (_error) {
      const fallback = await fetch('cms/data/posts.json');
      return await fallback.json();
    }
  }

  function renderPosts(posts) {
    if (!Array.isArray(posts) || posts.length === 0) {
      emptyEl.hidden = false;
      listEl.innerHTML = '';
      return;
    }

    emptyEl.hidden = true;

    listEl.innerHTML = posts.map(function (post) {
      const media = post.coverImage
        ? `<a class="blog-card__media" href="blog-wpis.html?slug=${encodeURIComponent(post.slug)}" aria-label="Przeczytaj wpis: ${escapeHtml(post.title)}">
             <img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.coverAlt || post.title || 'Grafika wpisu blogowego')}" width="1200" height="800" loading="lazy" decoding="async">
           </a>`
        : '';

      return `
        <article class="blog-card">
          ${media}
          <div class="blog-card__meta">
            <span class="blog-chip">${escapeHtml(post.category || 'Aktualności')}</span>
            <time datetime="${escapeHtml(post.publishedAt || '')}">${escapeHtml(formatDate(post.publishedAt || ''))}</time>
          </div>
          <h2 class="blog-card__title">
            <a href="blog-wpis.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a>
          </h2>
          <p class="blog-card__excerpt">${escapeHtml(post.excerpt || '')}</p>
          <a class="btn btn--outline" href="blog-wpis.html?slug=${encodeURIComponent(post.slug)}">Czytaj wpis</a>
        </article>
      `;
    }).join('');
  }

  async function init() {
    if (!listEl) return;
    const posts = await loadPosts();
    renderPosts(posts);
  }

  init();
})();
