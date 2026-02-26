(function () {
  'use strict';

  const wrap = document.getElementById('home-blog-list');
  if (!wrap) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function loadPosts() {
    try {
      const res = await fetch('/api/posts?limit=3');
      if (!res.ok) throw new Error('API');
      return await res.json();
    } catch (_e) {
      const fallback = await fetch('cms/data/posts.json');
      const data = await fallback.json();
      return data.slice().sort(function (a, b) {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      }).slice(0, 3);
    }
  }

  loadPosts().then(function (posts) {
    wrap.innerHTML = posts.map(function (post) {
      const media = post.coverImage
        ? `<a class="blog-card__media" href="blog-wpis.html?slug=${encodeURIComponent(post.slug)}" aria-label="Przejdź do wpisu: ${escapeHtml(post.title)}">
             <img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.coverAlt || post.title || 'Grafika wpisu blogowego')}" width="1200" height="800" loading="lazy" decoding="async">
           </a>`
        : '';

      return `
        <article class="blog-card blog-card--compact">
          ${media}
          <span class="blog-chip">${escapeHtml(post.category || 'Aktualności')}</span>
          <h3 class="blog-card__title"><a href="blog-wpis.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h3>
          <p class="blog-card__excerpt">${escapeHtml(post.excerpt || '')}</p>
          <a class="btn btn--outline" href="blog-wpis.html?slug=${encodeURIComponent(post.slug)}">Czytaj</a>
        </article>
      `;
    }).join('');
  });
})();
