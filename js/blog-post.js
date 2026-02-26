(function () {
  'use strict';

  const titleEl = document.getElementById('post-title');
  const metaEl = document.getElementById('post-meta');
  const excerptEl = document.getElementById('post-excerpt');
  const mediaEl = document.getElementById('post-media');
  const mediaImgEl = document.getElementById('post-media-img');
  const contentEl = document.getElementById('post-content');
  const notFoundEl = document.getElementById('post-not-found');
  const bannerTitleEl = document.getElementById('post-banner-title');
  const breadcrumbCurrentEl = document.getElementById('post-breadcrumb-current');
  const paginationEl = document.getElementById('post-pagination');
  const prevLinkEl = document.getElementById('post-prev-link');
  const prevTitleEl = document.getElementById('post-prev-title');
  const nextLinkEl = document.getElementById('post-next-link');
  const nextTitleEl = document.getElementById('post-next-title');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
  }

  function sortPostsByDate(posts) {
    return posts.slice().sort(function (a, b) {
      return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
    });
  }

  async function loadPosts() {
    try {
      const res = await fetch('/api/posts?limit=200');
      if (!res.ok) throw new Error('API unavailable');
      const posts = await res.json();
      if (Array.isArray(posts)) return sortPostsByDate(posts);
      throw new Error('Invalid posts payload');
    } catch (_error) {
      const fallback = await fetch('cms/data/posts.json');
      const posts = await fallback.json();
      return Array.isArray(posts) ? sortPostsByDate(posts) : [];
    }
  }

  async function loadPostBySlug(slug) {
    try {
      const res = await fetch('/api/posts/' + encodeURIComponent(slug));
      if (res.ok) return await res.json();
      if (res.status !== 404) throw new Error('API unavailable');
    } catch (_e) {
      // ignore and fallback
    }

    const fallback = await fetch('cms/data/posts.json');
    const posts = await fallback.json();
    return posts.find(function (item) { return item.slug === slug; }) || null;
  }

  function renderPostNavigation(posts, currentSlug) {
    if (!paginationEl || !prevLinkEl || !prevTitleEl || !nextLinkEl || !nextTitleEl) return;

    const idx = posts.findIndex(function (item) { return item.slug === currentSlug; });
    if (idx === -1) {
      paginationEl.hidden = true;
      paginationEl.classList.remove('is-single');
      return;
    }

    const prevPost = posts[idx + 1] || null;
    const nextPost = posts[idx - 1] || null;
    const hasPrev = !!(prevPost && prevPost.slug && String(prevPost.title || '').trim());
    const hasNext = !!(nextPost && nextPost.slug && String(nextPost.title || '').trim());

    if (hasPrev) {
      prevLinkEl.href = 'blog-wpis.html?slug=' + encodeURIComponent(prevPost.slug);
      prevTitleEl.textContent = prevPost.title || '';
      prevLinkEl.hidden = false;
    } else {
      prevLinkEl.removeAttribute('href');
      prevTitleEl.textContent = '';
      prevLinkEl.hidden = true;
    }

    if (hasNext) {
      nextLinkEl.href = 'blog-wpis.html?slug=' + encodeURIComponent(nextPost.slug);
      nextTitleEl.textContent = nextPost.title || '';
      nextLinkEl.hidden = false;
    } else {
      nextLinkEl.removeAttribute('href');
      nextTitleEl.textContent = '';
      nextLinkEl.hidden = true;
    }

    const visibleCount = (hasPrev ? 1 : 0) + (hasNext ? 1 : 0);
    paginationEl.hidden = visibleCount === 0;
    paginationEl.classList.toggle('is-single', visibleCount === 1);
  }

  function renderContent(content) {
    return String(content || '')
      .split(/\n\n+/)
      .map(function (paragraph) {
        return '<p>' + escapeHtml(paragraph.trim()) + '</p>';
      })
      .join('');
  }

  async function init() {
    const slug = getSlug();

    if (!slug) {
      notFoundEl.hidden = false;
      return;
    }

    const posts = await loadPosts();
    let post = posts.find(function (item) { return item.slug === slug; }) || null;
    if (!post) post = await loadPostBySlug(slug);
    if (!post) {
      notFoundEl.hidden = false;
      return;
    }

    document.title = post.title + ' | Blog PZRE BESTAL';
    titleEl.textContent = post.title;
    if (bannerTitleEl) bannerTitleEl.textContent = post.title;
    if (breadcrumbCurrentEl) breadcrumbCurrentEl.textContent = post.title;
    excerptEl.textContent = post.excerpt || '';
    metaEl.textContent = `${formatDate(post.publishedAt)} · ${post.category || 'Aktualności'} · ${post.readingTime || 3} min czytania`;
    if (mediaEl && mediaImgEl && post.coverImage) {
      mediaImgEl.src = post.coverImage;
      mediaImgEl.alt = post.coverAlt || post.title || 'Grafika wpisu blogowego';
      mediaImgEl.width = 1200;
      mediaImgEl.height = 800;
      mediaImgEl.decoding = 'async';
      mediaEl.hidden = false;
    }
    contentEl.innerHTML = renderContent(post.content);
    renderPostNavigation(posts, slug);
  }

  init();
})();
