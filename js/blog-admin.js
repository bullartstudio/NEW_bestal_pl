(function () {
  'use strict';

  const form = document.getElementById('blog-admin-form');
  const result = document.getElementById('blog-admin-result');
  const submitBtn = document.getElementById('blog-admin-submit');
  const requiredFieldIds = ['post-title', 'post-excerpt', 'post-content'];

  function getField(id) {
    return document.getElementById(id);
  }

  function getValue(id) {
    const el = getField(id);
    return el ? el.value.trim() : '';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setResult(message, type) {
    if (!result) return;
    result.classList.remove('is-error', 'is-success');

    if (type === 'success') {
      result.classList.add('is-success');
      result.innerHTML = message;
      return;
    }

    if (type === 'error') {
      result.classList.add('is-error');
    }

    result.textContent = message || '';
  }

  function isFilled(el) {
    return !!el && String(el.value || '').trim() !== '';
  }

  function setFieldInvalid(el, invalid) {
    if (!el) return;
    el.classList.toggle('is-invalid', invalid);
    el.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function validateRequiredFields() {
    let valid = true;
    requiredFieldIds.forEach(function (id) {
      const field = getField(id);
      const filled = isFilled(field);
      setFieldInvalid(field, !filled);
      if (!filled) valid = false;
    });
    return valid;
  }

  function focusFirstInvalidField() {
    for (let i = 0; i < requiredFieldIds.length; i += 1) {
      const field = getField(requiredFieldIds[i]);
      if (!isFilled(field)) {
        field.focus();
        return;
      }
    }
  }

  async function submitPost(payload, apiKey) {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      throw new Error(data.error || 'Błąd zapisu wpisu');
    }

    return data;
  }

  if (!form) return;

  requiredFieldIds.forEach(function (id) {
    const field = getField(id);
    if (!field) return;
    field.addEventListener('input', function () {
      setFieldInvalid(field, !isFilled(field));
    });
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    setResult('');

    if (!validateRequiredFields()) {
      focusFirstInvalidField();
      setResult('Uzupełnij pola obowiązkowe: tytuł, lead i treść wpisu.', 'error');
      return;
    }

    const payload = {
      title: getValue('post-title'),
      excerpt: getValue('post-excerpt'),
      content: getValue('post-content'),
      category: getValue('post-category') || 'Aktualności',
      tags: getValue('post-tags'),
      author: getValue('post-author') || 'Zespół PZRE BESTAL'
    };

    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-disabled', 'true');
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.textContent = 'Zapisywanie…';
    }
    setResult('Zapisywanie wpisu…');

    try {
      const created = await submitPost(payload, getValue('post-api-key'));
      const safeTitle = escapeHtml(created.title || payload.title);
      const safeSlug = encodeURIComponent(created.slug || '');
      setResult('Wpis dodany: <a href="blog-wpis.html?slug=' + safeSlug + '">' + safeTitle + '</a>', 'success');
      form.reset();
      requiredFieldIds.forEach(function (id) {
        setFieldInvalid(getField(id), false);
      });
    } catch (error) {
      setResult('Błąd: ' + (error.message || 'Nie udało się zapisać wpisu.'), 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.setAttribute('aria-disabled', 'false');
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = originalBtnText;
      }
    }
  });
})();
