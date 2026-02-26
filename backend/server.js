const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.CMS_API_KEY || '';

const WEB_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(WEB_ROOT, 'cms', 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const PAGES_FILE = path.join(DATA_DIR, 'pages.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contact-submissions.json');

app.use(express.json({ limit: '1mb' }));

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const normalized = raw.replace(/^\uFEFF/, '');
    return JSON.parse(normalized);
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tmpPath, filePath);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function hasBrokenDiacritics(value) {
  // Detects typical corruption like: "ruroci?g", "jako?ci", "zesp??".
  const text = String(value || '');
  return /[A-Za-zÀ-ž]\?[A-Za-zÀ-ž]/.test(text)
    || /\?{2,}/.test(text)
    || text.includes('\uFFFD');
}

function requireApiKey(req, res, next) {
  if (!API_KEY) return next();

  const provided = req.header('x-api-key');
  if (provided !== API_KEY) {
    return res.status(401).json({ error: 'Brak autoryzacji API.' });
  }

  return next();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', date: new Date().toISOString() });
});

app.get('/api/posts', async (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 100;
  const category = String(req.query.category || '').trim().toLowerCase();
  const posts = await readJson(POSTS_FILE, []);

  const filtered = posts
    .filter((post) => !category || String(post.category || '').toLowerCase() === category)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, Math.min(limit, 100));

  res.json(filtered);
});

app.get('/api/posts/:slug', async (req, res) => {
  const posts = await readJson(POSTS_FILE, []);
  const post = posts.find((item) => item.slug === req.params.slug);

  if (!post) {
    return res.status(404).json({ error: 'Wpis nie został znaleziony.' });
  }

  return res.json(post);
});

app.post('/api/posts', requireApiKey, async (req, res) => {
  const payload = req.body || {};
  const title = String(payload.title || '').trim();
  const excerpt = String(payload.excerpt || '').trim();
  const content = String(payload.content || '').trim();

  if (!title || !excerpt || !content) {
    return res.status(400).json({ error: 'Pola title, excerpt i content są wymagane.' });
  }

  if (
    hasBrokenDiacritics(title)
    || hasBrokenDiacritics(excerpt)
    || hasBrokenDiacritics(content)
  ) {
    return res.status(400).json({
      error: 'Wykryto uszkodzone znaki w treści wpisu. Sprawdź kodowanie UTF-8 i spróbuj ponownie.'
    });
  }

  const posts = await readJson(POSTS_FILE, []);
  const baseSlug = slugify(payload.slug || title);
  let slug = baseSlug || `wpis-${Date.now()}`;
  let counter = 2;

  while (posts.some((item) => item.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const post = {
    id: Date.now(),
    slug,
    title,
    excerpt,
    content,
    category: String(payload.category || 'Aktualności').trim(),
    tags: Array.isArray(payload.tags) ? payload.tags : String(payload.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
    author: String(payload.author || 'Zespół PZRE BESTAL').trim(),
    publishedAt: payload.publishedAt || new Date().toISOString(),
    readingTime: Number.parseInt(payload.readingTime, 10) || Math.max(2, Math.ceil(content.split(/\s+/).length / 180))
  };

  posts.push(post);
  await writeJson(POSTS_FILE, posts);

  return res.status(201).json(post);
});

app.get('/api/pages', async (_req, res) => {
  const pages = await readJson(PAGES_FILE, []);
  res.json(pages);
});

app.get('/api/pages/:slug', async (req, res) => {
  const pages = await readJson(PAGES_FILE, []);
  const page = pages.find((item) => item.slug === req.params.slug);

  if (!page) {
    return res.status(404).json({ error: 'Strona nie istnieje.' });
  }

  return res.json(page);
});

app.put('/api/pages/:slug', requireApiKey, async (req, res) => {
  const pages = await readJson(PAGES_FILE, []);
  const index = pages.findIndex((item) => item.slug === req.params.slug);

  if (index === -1) {
    return res.status(404).json({ error: 'Strona nie istnieje.' });
  }

  const updated = {
    ...pages[index],
    ...req.body,
    slug: pages[index].slug,
    updatedAt: new Date().toISOString()
  };

  pages[index] = updated;
  await writeJson(PAGES_FILE, pages);

  return res.json(updated);
});

app.post('/api/contact', async (req, res) => {
  const payload = req.body || {};
  const name = String(payload.name || '').trim();
  const company = String(payload.company || '').trim();
  const email = String(payload.email || '').trim();
  const phone = String(payload.phone || '').trim();
  const topic = String(payload.topic || '').trim();
  const message = String(payload.message || '').trim();
  const calculatorDraftRaw = String(payload.calculatorDraft || '').trim();
  const rodoConsent = payload.rodoConsent === true
    || payload.rodoConsent === 'true'
    || payload.rodoConsent === 'on'
    || payload.rodoConsent === 1;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Pola name, email i message są wymagane.' });
  }

  if (!rodoConsent) {
    return res.status(400).json({ error: 'Akceptacja zgody RODO jest wymagana.' });
  }

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isEmailValid) {
    return res.status(400).json({ error: 'Niepoprawny adres e-mail.' });
  }

  let calculatorDraft = null;
  if (calculatorDraftRaw) {
    try {
      calculatorDraft = JSON.parse(calculatorDraftRaw);
    } catch (_error) {
      calculatorDraft = calculatorDraftRaw;
    }
  }

  const submissions = await readJson(CONTACTS_FILE, []);
  const item = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    name,
    company,
    email,
    phone,
    topic,
    message,
    rodoConsent: true,
    calculatorDraft
  };

  submissions.push(item);
  await writeJson(CONTACTS_FILE, submissions);

  return res.status(201).json({ ok: true, id: item.id });
});

app.use(express.static(WEB_ROOT));

app.get('/', (_req, res) => {
  res.sendFile(path.join(WEB_ROOT, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BESTAL CMS server działa: http://localhost:${PORT}`);
});
